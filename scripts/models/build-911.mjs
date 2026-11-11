// Turns the clay Sketchfab model "Porsche 911 992" by Márcio Meireles (CC BY-NC 4.0,
// https://sketchfab.com/3d-models/porsche-911-992-dd10a7e346a645af8ba80be48b604854) into public/models/911.glb:
// metres, wheels on y = 0, nose towards +z, one mesh per material, new tyres and a glass roof, meshopt-compressed.
//
//   npm install --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
//   node scripts/models/build-911.mjs <downloaded source .glb> public/models/911.glb
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength, KHRMeshQuantization } from '@gltf-transform/extensions';
import { clearNodeParent, clearNodeTransform, dedup, join, meshopt, prune, simplifyPrimitive, weldPrimitive } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import * as THREE from 'three';

const [source, output] = process.argv.slice(2);
if (!source || !output) throw new Error('usage: build-911.mjs <source.glb> <output.glb>');

// The source has a 3.6145-unit wheelbase; a 992 has 2.45 m.
const SCALE = 2.45 / 3.6145;
const WHEEL_Y = -0.4175; // axle height in source units
const TYRE_RADIUS = 0.54; // source units

// Source node → [material, share of triangles to keep]. Nodes not listed are dropped: the tyres (600k triangles of
// tread, rebuilt below), seat switches, rear-window heating and a dozen stray spheres.
const PARTS = {
  Object_24: ['paint', 1], Object_18: ['paint', 1], Object_26: ['paint', 1],
  Object_8: ['trim', 1], Object_10: ['trim', 1], Object_14: ['trim', 1], Object_20: ['trim', 1], Object_30: ['trim', 1],
  Object_40: ['trim', 1], Object_42: ['trim', 1], Object_46: ['trim', 0.5], Object_66: ['trim', 1], Object_68: ['trim', 1],
  Object_70: ['trim', 1], Object_16: ['trim', 1], Object_72: ['trim', 1], Object_6: ['trim', 1],
  Object_137: ['trim', 1], Object_139: ['trim', 1], Object_141: ['trim', 1], Object_143: ['trim', 1], Object_145: ['trim', 1], Object_147: ['trim', 1],
  Object_48: ['glass', 1], Object_50: ['glass', 1], Object_52: ['glass_privacy', 1],
  Object_58: ['lens', 1], Object_56: ['lamp_housing', 1], Object_54: ['lamp_housing', 1], Object_60: ['chrome', 0.5], Object_64: ['chrome', 0.2],
  Object_62: ['light_white', 0.5], Object_12: ['gloss_black', 1],
  Object_32: ['light_red', 1], Object_34: ['light_red_lit', 1], Object_74: ['light_red_lit', 1], Object_36: ['light_red', 1],
  Object_28: ['light_red', 1], Object_38: ['light_red', 1], Object_44: ['light_red', 1],
  Object_22: ['chrome', 0.5],
  Object_76: ['wheel', 0.75], Object_125: ['wheel', 1], Object_78: ['caliper', 0.35], Object_83: ['caliper', 1],
  Object_80: ['brake_disc', 0.45], Object_81: ['brake_disc', 0.6],
  Object_4: ['interior', 0.6], Object_111: ['interior', 0.22], Object_113: ['interior', 0.4], Object_117: ['interior', 1],
  Object_119: ['interior', 0.3], Object_121: ['interior', 1], Object_123: ['interior', 1],
};

const io = new NodeIO()
  .registerExtensions([KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength, KHRMeshQuantization, EXTMeshoptCompression])
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const doc = await io.read(source);
const root = doc.getRoot();
const scene = root.listScenes()[0];
const buffer = root.listBuffers()[0];

// ---------- materials ----------
const clearcoat = doc.createExtension(KHRMaterialsClearcoat);
const emissive = doc.createExtension(KHRMaterialsEmissiveStrength);
const srgb = (hex) => new THREE.Color(hex).toArray(); // linear components
const material = (name, hex, metallic, roughness, extra = {}) => {
  const m = doc.createMaterial(name).setBaseColorFactor([...srgb(hex), extra.alpha ?? 1]).setMetallicFactor(metallic).setRoughnessFactor(roughness);
  if (extra.alpha !== undefined) m.setAlphaMode('BLEND');
  if (extra.coat) m.setExtension('KHR_materials_clearcoat', clearcoat.createClearcoat().setClearcoatFactor(1).setClearcoatRoughnessFactor(extra.coat));
  if (extra.glow) m.setEmissiveFactor(srgb(extra.glow)).setExtension('KHR_materials_emissive_strength', emissive.createEmissiveStrength().setEmissiveStrength(extra.strength ?? 1));
  if (extra.doubleSided) m.setDoubleSided(true);
  return m;
};
const MATERIALS = {
  // Oak Green Metallic Neo.
  paint: material('paint', '#1d4a37', 0.75, 0.42, { coat: 0.04 }),
  trim: material('trim', '#0b0c0d', 0, 0.55),
  gloss_black: material('gloss_black', '#050506', 0, 0.12),
  glass: material('glass', '#0a0f0f', 0, 0.03, { alpha: 0.72 }),
  glass_privacy: material('glass_privacy', '#030404', 0, 0.03, { alpha: 0.94 }),
  glass_roof: material('glass_roof', '#020303', 0, 0.02, { coat: 0.02 }),
  lens: material('lens', '#ffffff', 0, 0.02, { alpha: 0.16 }),
  lamp_housing: material('lamp_housing', '#16181a', 0.6, 0.3),
  chrome: material('chrome', '#c9ccd0', 1, 0.14),
  light_white: material('light_white', '#f4f7ff', 0, 0.2, { glow: '#f4f7ff', strength: 0.6 }),
  light_red: material('light_red', '#3d0206', 0, 0.12),
  light_red_lit: material('light_red_lit', '#7a0509', 0, 0.15, { glow: '#ff1a1a', strength: 0.5 }),
  wheel: material('wheel', '#3b3a38', 0.85, 0.42),
  caliper: material('caliper', '#0c0c0d', 0.2, 0.35),
  brake_disc: material('brake_disc', '#6f7174', 0.9, 0.45),
  tyre: material('tyre', '#0c0c0d', 0, 0.86),
  interior: material('interior', '#0d0d0e', 0, 0.7, { doubleSided: true }),
};

// ---------- source meshes ----------
// Bake every node's transform into its vertices, then move to metres with the wheels on the ground.
for (const node of root.listNodes()) if (node.getMesh()) { clearNodeParent(node); clearNodeTransform(node); }
const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
for (const node of root.listNodes()) {
  const position = PARTS[node.getName()] && node.getMesh()?.listPrimitives()[0].getAttribute('POSITION');
  if (!position) continue;
  for (let axis = 0; axis < 3; axis++) {
    bounds.min[axis] = Math.min(bounds.min[axis], position.getMin([])[axis]);
    bounds.max[axis] = Math.max(bounds.max[axis], position.getMax([])[axis]);
  }
}
const OFFSET = [-(bounds.min[0] + bounds.max[0]) / 2, -(WHEEL_Y - TYRE_RADIUS), -(bounds.min[2] + bounds.max[2]) / 2];
const toMetres = ([x, y, z]) => [(x + OFFSET[0]) * SCALE, (y + OFFSET[1]) * SCALE, (z + OFFSET[2]) * SCALE];

let body;
let kept = 0;
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const part = PARTS[node.getName()];
  if (!part) { node.dispose(); continue; }
  const [name, ratio] = part;
  for (const prim of mesh.listPrimitives()) {
    const position = prim.getAttribute('POSITION').clone();
    const array = new Float32Array(position.getArray());
    for (let i = 0; i < array.length; i += 3) array.set(toMetres(array.subarray(i, i + 3)), i);
    prim.setAttribute('POSITION', position.setArray(array));
    prim.setAttribute('NORMAL', prim.getAttribute('NORMAL').clone());
    prim.setAttribute('TEXCOORD_0', null);
    prim.setMaterial(MATERIALS[name]);
    weldPrimitive(prim);
    if (ratio < 1) simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio, error: 0.0008 });
    kept += prim.getIndices().getCount() / 3;
  }
  if (node.getName() === 'Object_24') body = mesh.listPrimitives()[0];
  node.setName(name);
  mesh.setName(name);
}

// ---------- side glass: the rear quarter windows are privacy glass, the door windows are not ----------
{
  const node = root.listNodes().find((n) => n.getMesh()?.listPrimitives()[0].getMaterial() === MATERIALS.glass && n.getMesh().listPrimitives()[0].getAttribute('POSITION').getCount() > 400);
  const prim = node.getMesh().listPrimitives()[0];
  const position = prim.getAttribute('POSITION');
  const indices = prim.getIndices().getArray();
  // Door and quarter window are one surface in the source; the B-pillar sits at z ≈ -0.56 m.
  const v = [];
  const isQuarter = (i) => position.getElement(i, v)[2] < -0.56;
  const front = [], rear = [];
  for (let i = 0; i < indices.length; i += 3) (isQuarter(indices[i]) && isQuarter(indices[i + 1]) && isQuarter(indices[i + 2]) ? rear : front).push(indices[i], indices[i + 1], indices[i + 2]);
  const quarter = prim.clone().setMaterial(MATERIALS.glass_privacy).setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(rear)).setBuffer(buffer));
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(front)).setBuffer(buffer));
  scene.addChild(doc.createNode('glass_privacy').setMesh(doc.createMesh('glass_privacy').addPrimitive(quarter)));
}

// ---------- new geometry ----------
const addMesh = (name, geometry, mat) => {
  const g = geometry.index ? geometry : geometry.toNonIndexed();
  const prim = doc.createPrimitive().setMaterial(mat)
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.position.array)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.normal.array)).setBuffer(buffer));
  if (g.index) prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index.array)).setBuffer(buffer));
  scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
};

// Tyres: a lathed profile with rounded shoulders and four grooves, in place of the source's sculpted tread.
// The source rims sit at ±1.396 units (outer face) and are 0.4555 units in radius, front and rear alike.
function tyre(width) {
  const R = TYRE_RADIUS * SCALE, r = 0.4555 * SCALE - 0.004, h = R - r, half = width / 2;
  const points = [];
  const side = (sign) => {
    const p = [[r - 0.012, half - 0.03], [r, half - 0.012], [r + 0.012, half - 0.004], [r + h * 0.45, half], [r + h * 0.72, half - 0.004]];
    const rs = 0.032;
    for (let a = 0; a <= 6; a++) { const t = (a / 6) * (Math.PI / 2); p.push([R - 0.005 - rs + Math.sin(t) * rs, half - 0.006 - rs + Math.cos(t) * rs]); }
    return (sign < 0 ? p : p.reverse()).map(([radius, x]) => [radius, sign * x]);
  };
  points.push(...side(-1));
  const treadHalf = half - 0.04;
  const grooves = [-0.55, -0.18, 0.18, 0.55].map((g) => g * treadHalf);
  const crown = (at) => R - 0.005 * (at / treadHalf) ** 2;
  for (const g of grooves) {
    points.push([crown(g - 0.006), g - 0.006], [crown(g) - 0.007, g - 0.004], [crown(g) - 0.007, g + 0.004], [crown(g + 0.006), g + 0.006]);
  }
  points.push(...side(1));
  const lathe = new THREE.LatheGeometry(points.map(([radius, at]) => new THREE.Vector2(radius, at)), 96);
  lathe.rotateZ(-Math.PI / 2); // axis: y → x
  return lathe;
}
{
  const outer = 1.396 * SCALE + OFFSET[0] * SCALE - 0.004;
  const axleY = TYRE_RADIUS * SCALE;
  for (const [z, width] of [[1.806, 0.255], [-1.8085, 0.305]]) {
    for (const sign of [1, -1]) {
      const g = tyre(width);
      g.translate(sign * (outer - width / 2), axleY, (z + OFFSET[2]) * SCALE);
      addMesh('tyre', g, MATERIALS.tyre);
    }
  }
}

// Glass roof: a panel laid 2 mm over the painted roof, found by casting rays down onto the body.
{
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(body.getAttribute('POSITION').getArray()), 3));
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(body.getIndices().getArray()), 1));
  const shell = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const ray = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const hit = (x, z) => {
    ray.set(new THREE.Vector3(x, 3, z), down);
    const first = ray.intersectObject(shell)[0];
    if (!first) return null;
    const normal = first.face.normal.clone();
    if (normal.y < 0) normal.negate();
    return { point: first.point, normal };
  };
  // Roof profile along the centre line, to place the panel between the windscreen and the rear window.
  const profile = [];
  for (let z = -1.2; z <= 1.0; z += 0.05) profile.push(`${z.toFixed(2)}:${hit(0, z)?.point.y.toFixed(3) ?? '-'}`);
  console.log('roof profile z:y', profile.join(' '));
  const SUNROOF = { front: 0.1, rear: -0.47, half: 0.45 };
  const nu = 28, nz = 24;
  const positions = [], normals = [], index = [];
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nu; i++) {
      // A square grid pulled in at the corners, so the panel has rounded corners.
      const u = (i / nu) * 2 - 1, w = (j / nz) * 2 - 1;
      const x = u * Math.sqrt(1 - 0.09 * w * w) * SUNROOF.half;
      const z = (SUNROOF.front + SUNROOF.rear) / 2 + w * Math.sqrt(1 - 0.09 * u * u) * (SUNROOF.front - SUNROOF.rear) / 2;
      const h = hit(x, z);
      if (!h) throw new Error(`no roof under ${x}, ${z}`);
      positions.push(h.point.x + h.normal.x * 0.002, h.point.y + h.normal.y * 0.002, h.point.z + h.normal.z * 0.002);
      normals.push(h.normal.x, h.normal.y, h.normal.z);
    }
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; index.push(a, c, b, b, c, d); }
  const panel = new THREE.BufferGeometry();
  panel.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  panel.setIndex(index);
  panel.computeVertexNormals();
  addMesh('glass_roof', panel, MATERIALS.glass_roof);
}

// ---------- pack ----------
for (const m of root.listMaterials()) if (!Object.values(MATERIALS).includes(m)) m.dispose();
root.getAsset().generator = 'be4th scripts/models/build-911.mjs (glTF-Transform)';
root.getAsset().copyright = 'Porsche 911 992 by Márcio Meireles, CC BY-NC 4.0, https://sketchfab.com/3d-models/porsche-911-992-dd10a7e346a645af8ba80be48b604854. Adapted: materials, tyres, glass roof, fewer triangles.';
root.getAsset().extras = undefined;
await doc.transform(
  prune(),
  dedup(),
  join({ keepNamed: false }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12 }),
);
for (const node of root.listNodes()) { const name = node.getMesh()?.listPrimitives()[0].getMaterial().getName(); if (name) { node.setName(name); node.getMesh().setName(name); } }
await io.write(output, doc);
let triangles = 0;
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) triangles += prim.getIndices().getCount() / 3;
console.log(`wrote ${output}: ${root.listMeshes().length} meshes, ${Math.round(triangles)} triangles (source parts kept: ${Math.round(kept)})`);
