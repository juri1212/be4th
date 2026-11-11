import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  SpotLight,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Material,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { gradient } from './studio';
import { clamp01, lerp } from './timeline';

// The 911 Carrera (992) from public/models/911.glb, which scripts/models/build-911.mjs writes: metres, wheels on
// y = 0, nose towards +z, +x is the driver's side, one mesh per material. The materials here replace the file's.

export const PLATE = 'S JB 911';

// LED headlights: white with a little blue in it.
const HEADLIGHT = 0xe4edff;
// The light bar's red as running lights, and when it is on: bright red drifts to orange in the tone mapping, so the
// lit colour leans the other way.
const TAIL_GLOW = new Color(0xff1a14);
const TAIL_LIT = new Color(0xff0326);
// Where the lamps sit: the front of each headlight's glass, and the middle of the light bar across the tail.
const HEADLAMP = new Vector3(0.7, 0.705, 1.8);
const TAIL = new Vector3(0, 0.77, -2.2);
// How far behind the glass the headlights' LEDs are.
const LED_DEPTH = 0.18;

function materials() {
  const glass = (color: number, opacity: number) =>
    new MeshPhysicalMaterial({ color, roughness: 0.04, metalness: 0, transparent: true, opacity, depthWrite: false, envMapIntensity: 1.5 });
  return {
    // Oak Green Metallic Neo: a dark forest green that lights up where a highlight crosses it.
    paint: new MeshPhysicalMaterial({ color: 0x163f2c, metalness: 0.72, roughness: 0.46, clearcoat: 1, clearcoatRoughness: 0.045, envMapIntensity: 1.25 }),
    trim: new MeshStandardMaterial({ color: 0x0b0c0d, roughness: 0.55 }),
    gloss_black: new MeshPhysicalMaterial({ color: 0x050506, roughness: 0.12, clearcoat: 1 }),
    glass: glass(0x0b1111, 0.74),
    glass_privacy: glass(0x030404, 0.95),
    glass_roof: new MeshPhysicalMaterial({ color: 0x020303, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.5 }),
    // The emissive colour is for the headlights: off by day, and a glow across the whole lamp at night.
    lens: new MeshPhysicalMaterial({ color: 0xffffff, emissive: new Color(HEADLIGHT), emissiveIntensity: 0, roughness: 0.02, transparent: true, opacity: 0.14, depthWrite: false, envMapIntensity: 2 }),
    lamp_housing: new MeshStandardMaterial({ color: 0x16181a, metalness: 0.6, roughness: 0.3 }),
    chrome: new MeshStandardMaterial({ color: 0xc9ccd0, metalness: 1, roughness: 0.14 }),
    light_white: new MeshStandardMaterial({ color: 0xf4f7ff, emissive: new Color(0xf4f7ff), emissiveIntensity: 0.7, roughness: 0.2 }),
    light_red: new MeshPhysicalMaterial({ color: 0x4a0408, roughness: 0.1, clearcoat: 1 }),
    light_red_lit: new MeshStandardMaterial({ color: 0x8a070c, emissive: new Color(TAIL_GLOW), emissiveIntensity: 0.55, roughness: 0.15 }),
    wheel: new MeshStandardMaterial({ color: 0x3a3936, metalness: 0.85, roughness: 0.4 }),
    caliper: new MeshStandardMaterial({ color: 0x0c0c0d, metalness: 0.2, roughness: 0.35 }),
    brake_disc: new MeshStandardMaterial({ color: 0x6f7174, metalness: 0.9, roughness: 0.45 }),
    tyre: new MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.88 }),
    interior: new MeshStandardMaterial({ color: 0x101011, roughness: 0.75, side: DoubleSide }),
  };
}

// Half the width of the strip of bodywork that rays can hit, in metres.
const STRIP = 0.32;

export interface SurfaceHit {
  point: Vector3;
  normal: Vector3;
}

// How wide a slice of the car each bin of a Surface covers, in metres.
const BIN = 0.04;
const AXES = ['x', 'y', 'z'] as const;

// Triangles that rays along an axis are cast onto. Each ray is tested against every triangle by default, which for
// the couple of hundred rays that fit the rack and the plates took most of the time the page needed to start. Here
// the triangles are sorted into bins across each ray's path first, so a ray meets only the few it could hit.
class Surface {
  // Nine numbers per triangle.
  private corners: Float32Array;
  // Per axis a ray can travel along: the triangles overlapping each slice of the axis after it.
  private bins = new Map<number, { from: number; slices: number[][] }>();

  constructor(corners: Float32Array) {
    this.corners = corners;
  }

  private slices(along: number) {
    const existing = this.bins.get(along);
    if (existing) return existing;
    const across = (along + 1) % 3;
    const { corners } = this;
    let from = Infinity;
    for (let i = across; i < corners.length; i += 3) from = Math.min(from, corners[i]!);
    const slices: number[][] = [];
    for (let triangle = 0; triangle < corners.length; triangle += 9) {
      const a = corners[triangle + across]!;
      const b = corners[triangle + 3 + across]!;
      const c = corners[triangle + 6 + across]!;
      const last = Math.floor((Math.max(a, b, c) - from) / BIN);
      for (let slice = Math.floor((Math.min(a, b, c) - from) / BIN); slice <= last; slice++) (slices[slice] ??= []).push(triangle);
    }
    const bins = { from, slices };
    this.bins.set(along, bins);
    return bins;
  }

  // The first thing a ray meets that leaves `origin` along the axis numbered `along` (x, y, z), forwards or back.
  cast(origin: Vector3, along: number, direction: number): SurfaceHit | null {
    const across = (along + 1) % 3;
    const other = (along + 2) % 3;
    const p = origin.getComponent(across);
    const q = origin.getComponent(other);
    const start = origin.getComponent(along);
    const { from, slices } = this.slices(along);
    const { corners } = this;
    let nearest = Infinity;
    let found = -1;
    for (const triangle of slices[Math.floor((p - from) / BIN)] ?? []) {
      // Where the ray's line crosses the triangle, seen along the ray.
      const ap = corners[triangle + across]! - p;
      const aq = corners[triangle + other]! - q;
      const bp = corners[triangle + 3 + across]! - p;
      const bq = corners[triangle + 3 + other]! - q;
      const cp = corners[triangle + 6 + across]! - p;
      const cq = corners[triangle + 6 + other]! - q;
      const u = bp * cq - bq * cp;
      const v = cp * aq - cq * ap;
      const w = ap * bq - aq * bp;
      if ((u < 0 || v < 0 || w < 0) && (u > 0 || v > 0 || w > 0)) continue;
      const area = u + v + w;
      if (area === 0) continue;
      const distance = ((u * corners[triangle + along]! + v * corners[triangle + 3 + along]! + w * corners[triangle + 6 + along]!) / area - start) * direction;
      if (distance > 0 && distance < nearest) {
        nearest = distance;
        found = triangle;
      }
    }
    if (found < 0) return null;
    const point = origin.clone();
    point[AXES[along]!] += nearest * direction;
    const a = new Vector3().fromArray(corners, found);
    const normal = new Vector3().fromArray(corners, found + 3).sub(a).cross(new Vector3().fromArray(corners, found + 6).sub(a)).normalize();
    // Towards where the ray came from, whichever way the triangle is wound.
    if (normal.getComponent(along) * direction > 0) normal.negate();
    return { point, normal };
  }
}

export interface Car {
  root: Group;
  // The roof or glass under a point above the car, within STRIP of the centre line.
  under(x: number, z: number): SurfaceHit | null;
  // Headlights and tail lights, from 0, when only the running lights glow, to 1 for fully on.
  lights(on: number): void;
}

// A German number plate, drawn rather than loaded.
function plate(text: string): Mesh<PlaneGeometry, MeshStandardMaterial> {
  const canvas = document.createElement('canvas');
  canvas.width = 1040;
  canvas.height = 220;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#f4f4f1';
  context.beginPath();
  context.roundRect(0, 0, 1040, 220, 22);
  context.fill();
  context.strokeStyle = '#111';
  context.lineWidth = 8;
  context.beginPath();
  context.roundRect(6, 6, 1028, 208, 18);
  context.stroke();
  context.fillStyle = '#0b3aa5';
  context.beginPath();
  context.roundRect(10, 10, 92, 200, [14, 0, 0, 14]);
  context.fill();
  context.fillStyle = '#f4f4f1';
  context.font = '700 54px "Archivo Variable", "Arial Narrow", sans-serif';
  context.textAlign = 'center';
  context.fillText('D', 56, 190);
  context.fillStyle = '#111';
  context.font = '600 168px "Archivo Variable", "Arial Narrow", sans-serif';
  context.textBaseline = 'middle';
  if ('fontStretch' in context) context.fontStretch = 'condensed';
  context.fillText(text, 570, 122);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  // The emissive map is the plate lamp, for the rear plate at night.
  const mesh = new Mesh(new PlaneGeometry(0.52, 0.11), new MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.45 }));
  mesh.name = 'plate';
  return mesh;
}

export async function loadCar(url: string): Promise<Car> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  const root = gltf.scene;
  root.name = '911';
  const table = materials();
  const solid: Mesh[] = [];
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const name = (object.material as Material).name;
    const material = (table as Record<string, Material>)[name];
    if (material) {
      material.name = name;
      object.material = material;
    }
    const seeThrough = name.startsWith('glass') ? name !== 'glass_roof' : name === 'lens';
    object.castShadow = !seeThrough;
    object.receiveShadow = !seeThrough;
    // Glass after everything it covers, and the outer panes last.
    if (seeThrough) object.renderOrder = name === 'lens' ? 1 : 2;
    if (['paint', 'glass', 'glass_privacy', 'glass_roof', 'trim', 'light_red', 'light_red_lit'].includes(name)) solid.push(object);
  });
  root.updateMatrixWorld(true);

  // Everything fitted to the car sits near its centre line, so only that strip of the body is kept for rays to hit.
  const strip: number[] = [];
  const corner = new Float32Array(9);
  for (const mesh of solid) {
    const position = mesh.geometry.getAttribute('position');
    const index = mesh.geometry.getIndex();
    const count = index ? index.count : position.count;
    const m = mesh.matrixWorld.elements;
    for (let i = 0; i < count; i += 3) {
      let near = false;
      for (let k = 0; k < 3; k++) {
        const vertex = index ? index.getX(i + k) : i + k;
        const x = position.getX(vertex);
        const y = position.getY(vertex);
        const z = position.getZ(vertex);
        corner[k * 3] = m[0]! * x + m[4]! * y + m[8]! * z + m[12]!;
        corner[k * 3 + 1] = m[1]! * x + m[5]! * y + m[9]! * z + m[13]!;
        corner[k * 3 + 2] = m[2]! * x + m[6]! * y + m[10]! * z + m[14]!;
        near ||= Math.abs(corner[k * 3]!) < STRIP;
      }
      if (near) strip.push(...corner);
    }
  }
  const surface = new Surface(new Float32Array(strip));
  const under = (x: number, z: number) => surface.cast(new Vector3(x, 3, z), 1, -1);

  // Plates stand just proud of the bumper: find the foremost point across the plate's width at its height.
  let rearPlate: MeshStandardMaterial | undefined;
  for (const [facing, height] of [[1, 0.37], [-1, 0.6]] as const) {
    let proud: number | null = null;
    for (let x = -0.24; x <= 0.241; x += 0.04) {
      for (const dy of [-0.045, 0, 0.045]) {
        const hit = surface.cast(new Vector3(x, height + dy, facing * 4), 2, -facing);
        if (hit && (proud === null || hit.point.z * facing > proud * facing)) proud = hit.point.z;
      }
    }
    if (proud === null) continue;
    const mesh = plate(PLATE);
    mesh.position.set(0, height, proud + facing * 0.014);
    if (facing < 0) {
      mesh.rotation.y = Math.PI;
      rearPlate = mesh.material;
    }
    root.add(mesh);
  }

  // ----- lights -----
  // Always in the scene, at no brightness by day, so switching them on doesn't rebuild every material's shader.
  // They cast no shadows, so each is a cone that points away from the car and can't shine through it.
  const beams = [-1, 1].map((side) => {
    const beam = new SpotLight(HEADLIGHT, 0, 30, 0.74, 1, 1.5);
    beam.position.set(side * HEADLAMP.x, HEADLAMP.y, HEADLAMP.z);
    // Dipped: the beam meets the floor just ahead of the nose and runs out a few car lengths on.
    beam.target.position.set(side * (HEADLAMP.x + 0.2), 0, HEADLAMP.z + 6);
    root.add(beam, beam.target);
    return beam;
  });
  // The red the light bar throws on the floor behind the car.
  const tail = new SpotLight(TAIL_GLOW, 0, 6, 1.15, 1, 2);
  tail.position.copy(TAIL);
  tail.target.position.set(0, 0, TAIL.z - 2.6);
  root.add(tail, tail.target);

  // The glare of a headlight looked into: a soft disc over each lamp that is gone from the side and from behind,
  // which also keeps it from showing through the car, since it is drawn over everything.
  let level = 0;
  const towards = new Vector3();
  const lamp = new Vector3();
  const glare = gradient([[0, 'rgb(255 255 255 / 0.9)'], [0.09, 'rgb(255 255 255 / 0.46)'], [0.28, 'rgb(255 255 255 / 0.13)'], [0.6, 'rgb(255 255 255 / 0.03)'], [1, 'rgb(255 255 255 / 0)']], 256);
  const halos = [-1, 1].map((side) => {
    const material = new SpriteMaterial({ map: glare, color: HEADLIGHT, blending: AdditiveBlending, transparent: true, depthTest: false, depthWrite: false, fog: false });
    const halo = new Sprite(material);
    halo.name = 'headlight-glare';
    halo.position.set(side * HEADLAMP.x, HEADLAMP.y, HEADLAMP.z - LED_DEPTH);
    halo.scale.setScalar(1.35);
    halo.renderOrder = 3;
    halo.visible = false;
    halo.onBeforeRender = (_renderer, _scene, camera) => {
      towards.setFromMatrixPosition(camera.matrixWorld).sub(halo.getWorldPosition(lamp)).normalize();
      material.opacity = level * clamp01((towards.z - 0.08) / 0.6) ** 1.5;
    };
    root.add(halo);
    return halo;
  });

  const lights = (on: number) => {
    level = on;
    table.light_white.emissiveIntensity = lerp(0.7, 10, on);
    table.lens.emissiveIntensity = on * 5;
    table.light_red_lit.emissiveIntensity = lerp(0.55, 1.7, on);
    table.light_red_lit.emissive.lerpColors(TAIL_GLOW, TAIL_LIT, on);
    if (rearPlate) rearPlate.emissiveIntensity = on * 0.18;
    for (const beam of beams) beam.intensity = on * 42;
    tail.intensity = on * 7;
    for (const halo of halos) halo.visible = on > 0.001;
  };

  return { root, under, lights };
}
