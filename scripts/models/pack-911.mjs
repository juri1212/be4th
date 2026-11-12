// The last stage of scripts/models/build-911.mjs: shares one wheel between the four corners and compresses the
// model. It takes the car as build-911 leaves it: metres, one mesh per material, nothing moved by its node.
//
// Run on its own, it repacks a model that an earlier build-911 wrote with four separate wheels:
//
//   npm install --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
//   node scripts/models/pack-911.mjs <built .glb> public/models/911.glb
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength, KHRMeshQuantization } from '@gltf-transform/extensions';
import { clearNodeTransform, dequantize, prune, reorder } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

export const EXTENSIONS = [KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength, KHRMeshQuantization, EXTMeshoptCompression];

// Bits per component. The car is 4.5 m long, so 14 bits place a vertex to within 0.15 mm.
const POSITION_BITS = 14;
// Reflections on paint and glass show every step in a normal, so those keep 12 bits. Nothing else is glossy and
// smooth enough to tell 8 from more.
const NORMAL_BITS = { paint: 12, glass: 12, glass_privacy: 12, glass_roof: 12 };
const NORMAL_BITS_DEFAULT = 8;

// The triangles of `prim` on one corner of the car, as a primitive of their own. `side` is 1 for the driver's side,
// `end` is 1 for the front.
function corner(doc, prim, side, end) {
  const buffer = doc.getRoot().listBuffers()[0];
  const position = prim.getAttribute('POSITION');
  const normal = prim.getAttribute('NORMAL');
  const source = prim.getIndices().getArray();
  const a = [], b = [], c = [];
  const renumbered = new Map();
  const positions = [], normals = [], indices = [];
  for (let i = 0; i < source.length; i += 3) {
    position.getElement(source[i], a);
    position.getElement(source[i + 1], b);
    position.getElement(source[i + 2], c);
    if ((a[0] + b[0] + c[0]) * side <= 0 || (a[2] + b[2] + c[2]) * end <= 0) continue;
    for (let k = 0; k < 3; k++) {
      const vertex = source[i + k];
      if (!renumbered.has(vertex)) {
        renumbered.set(vertex, renumbered.size);
        positions.push(...position.getElement(vertex, a));
        normals.push(...normal.getElement(vertex, a));
      }
      indices.push(renumbered.get(vertex));
    }
  }
  return doc.createPrimitive()
    .setMaterial(prim.getMaterial())
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(normals)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer));
}

// The middle of a primitive's bounding box in y and z, which for anything round on an axle is the axle.
function centre(prim) {
  const position = prim.getAttribute('POSITION');
  const min = position.getMin([]), max = position.getMax([]);
  return [0, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
}

function move(prim, by) {
  const position = prim.getAttribute('POSITION');
  const array = position.getArray();
  for (let i = 0; i < array.length; i += 3) for (let k = 0; k < 3; k++) array[i + k] -= by[k];
  position.setArray(array);
}

// The source has four copies of the same rim and brake disc, and build-911 makes the tyres as two mirrored pairs.
// Keep the front driver's-side rim and disc and put them at every corner, as the nodes `wheel_fl`, `wheel_fr`,
// `wheel_rl` and `wheel_rr`, each with its origin on its axle, so the wheels can turn. Keep one tyre per axle and
// mirror it for the other side; a tyre looks the same however far it has turned, so the tyres stay where they are.
function shareWheels(doc) {
  const root = doc.getRoot();
  const scene = root.listScenes()[0];
  const joined = (name) => root.listNodes().find((node) => node.getName() === name && node.getMesh());
  const parts = { rim: joined('wheel'), disc: joined('brake_disc'), tyre: joined('tyre') };
  if (!parts.rim || !parts.disc || !parts.tyre) throw new Error('Expected the meshes wheel, brake_disc and tyre, one each for all four wheels');
  const from = (node) => node.getMesh().listPrimitives()[0];

  const rim = corner(doc, from(parts.rim), 1, 1);
  const disc = corner(doc, from(parts.disc), 1, 1);
  // The disc sits a few millimetres off the axle in the source. Centre it, so it doesn't wobble when the wheel turns.
  move(disc, centre(disc));
  move(rim, centre(rim));
  const wheel = doc.createMesh('wheel').addPrimitive(rim).addPrimitive(disc);
  for (const [end, name] of [[1, 'f'], [-1, 'r']]) {
    const tyre = corner(doc, from(parts.tyre), 1, end);
    const mesh = doc.createMesh('tyre').addPrimitive(tyre);
    const axle = centre(tyre);
    for (const [side, letter] of [[1, 'l'], [-1, 'r']]) {
      scene.addChild(doc.createNode(`wheel_${name}${letter}`).setMesh(wheel).setTranslation(axle).setScale([side, 1, 1]));
      scene.addChild(doc.createNode('tyre').setMesh(mesh).setScale([side, 1, 1]));
    }
  }
  for (const node of Object.values(parts)) {
    node.getMesh().dispose();
    node.dispose();
  }
}

// Normals as normalized integers of `bits` bits, in the smallest type that holds them.
function quantizeNormals(prim, bits) {
  const normal = prim.getAttribute('NORMAL');
  const source = normal.getArray();
  const wide = bits > 8;
  const scale = 2 ** (bits - 1) - 1;
  // Fewer bits than the type has are kept in its top bits, so the values still read as -1 to 1.
  const shift = 2 ** ((wide ? 16 : 8) - bits);
  const array = wide ? new Int16Array(source.length) : new Int8Array(source.length);
  for (let i = 0; i < source.length; i += 3) {
    const length = Math.hypot(source[i], source[i + 1], source[i + 2]) || 1;
    for (let k = 0; k < 3; k++) array[i + k] = Math.round((source[i + k] / length) * scale) * shift;
  }
  prim.setAttribute('NORMAL', normal.clone().setArray(array).setNormalized(true));
}

// Positions as whole numbers of a step small enough for `bits` bits to span the mesh, measured from the middle of
// the mesh. Every node that shows the mesh takes on the step as its scale and the middle as its position. The middle
// of the wheel is on its axle, so the wheel nodes keep their origin there.
function quantizePositions(doc, mesh, bits) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const prim of mesh.listPrimitives()) {
    const position = prim.getAttribute('POSITION');
    position.getMin([]).forEach((value, axis) => (min[axis] = Math.min(min[axis], value)));
    position.getMax([]).forEach((value, axis) => (max[axis] = Math.max(max[axis], value)));
  }
  const middle = min.map((value, axis) => (value + max[axis]) / 2);
  const step = Math.max(...max.map((value, axis) => value - middle[axis])) / (2 ** (bits - 1) - 1);
  for (const prim of mesh.listPrimitives()) {
    const position = prim.getAttribute('POSITION');
    const source = position.getArray();
    const array = new Int16Array(source.length);
    for (let i = 0; i < source.length; i++) array[i] = Math.round((source[i] - middle[i % 3]) / step);
    prim.setAttribute('POSITION', position.clone().setArray(array));
  }
  for (const node of doc.getRoot().listNodes()) {
    if (node.getMesh() !== mesh) continue;
    const scale = node.getScale();
    node.setTranslation(node.getTranslation().map((value, axis) => value + scale[axis] * middle[axis]));
    node.setScale(scale.map((value) => value * step));
  }
}

export async function pack(doc, { normalBits = NORMAL_BITS, normalBitsDefault = NORMAL_BITS_DEFAULT, positionBits = POSITION_BITS } = {}) {
  await MeshoptEncoder.ready;
  shareWheels(doc);
  await doc.transform(prune(), reorder({ encoder: MeshoptEncoder, target: 'size' }));
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) quantizeNormals(prim, normalBits[prim.getMaterial().getName()] ?? normalBitsDefault);
    quantizePositions(doc, mesh, positionBits);
  }
  await doc.transform(prune());
  doc.createExtension(KHRMeshQuantization).setRequired(true);
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
}

export function describe(doc) {
  let triangles = 0;
  for (const node of doc.getRoot().listNodes()) for (const prim of node.getMesh()?.listPrimitives() ?? []) triangles += prim.getIndices().getCount() / 3;
  return `${doc.getRoot().listMeshes().length} meshes, ${Math.round(triangles)} triangles drawn`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [source, output] = process.argv.slice(2);
  if (!source || !output) throw new Error('usage: pack-911.mjs <built.glb> <output.glb>');
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;
  const io = new NodeIO().registerExtensions(EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
  const doc = await io.read(source);
  if (doc.getRoot().listNodes().some((node) => node.getName().startsWith('wheel_'))) throw new Error(`${source} is packed already`);
  // Back to what build-911 hands over: plain numbers in metres, with nothing left in the nodes.
  await doc.transform(dequantize());
  for (const node of doc.getRoot().listNodes()) if (node.getMesh()) clearNodeTransform(node);
  await pack(doc);
  await io.write(output, doc);
  console.log(`wrote ${output}: ${describe(doc)}`);
}
