import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Vector3,
  type Material,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// The 911 Carrera (992) from public/models/911.glb, which scripts/models/build-911.mjs writes: metres, wheels on
// y = 0, nose towards +z, +x is the driver's side, one mesh per material. The materials here replace the file's.

export const PLATE = 'S JB 911';

function materials(): Record<string, Material> {
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
    lens: new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.14, depthWrite: false, envMapIntensity: 2 }),
    lamp_housing: new MeshStandardMaterial({ color: 0x16181a, metalness: 0.6, roughness: 0.3 }),
    chrome: new MeshStandardMaterial({ color: 0xc9ccd0, metalness: 1, roughness: 0.14 }),
    light_white: new MeshStandardMaterial({ color: 0xf4f7ff, emissive: new Color(0xf4f7ff), emissiveIntensity: 0.7, roughness: 0.2 }),
    light_red: new MeshPhysicalMaterial({ color: 0x4a0408, roughness: 0.1, clearcoat: 1 }),
    light_red_lit: new MeshStandardMaterial({ color: 0x8a070c, emissive: new Color(0xff1a14), emissiveIntensity: 0.55, roughness: 0.15 }),
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

export interface Car {
  root: Group;
  // The first thing a ray meets on the body or the glass, within STRIP of the centre line.
  cast(origin: Vector3, direction: Vector3): SurfaceHit | null;
  // The roof or glass under a point above the car.
  under(x: number, z: number): SurfaceHit | null;
}

// A German number plate, drawn rather than loaded.
function plate(text: string): Mesh {
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
  const mesh = new Mesh(new PlaneGeometry(0.52, 0.11), new MeshStandardMaterial({ map: texture, roughness: 0.45 }));
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
    const material = table[name];
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

  // Everything fitted to the car sits near its centre line, so rays are cast against that strip of the body only.
  // Testing every ray against the whole car would hold up the page for seconds.
  const strip: number[] = [];
  const corner = [new Vector3(), new Vector3(), new Vector3()] as const;
  for (const mesh of solid) {
    const position = mesh.geometry.getAttribute('position');
    const index = mesh.geometry.getIndex();
    const count = index ? index.count : position.count;
    for (let i = 0; i < count; i += 3) {
      let near = false;
      for (let k = 0; k < 3; k++) {
        corner[k]!.fromBufferAttribute(position, index ? index.getX(i + k) : i + k).applyMatrix4(mesh.matrixWorld);
        near ||= Math.abs(corner[k]!.x) < STRIP;
      }
      if (near) for (const point of corner) strip.push(point.x, point.y, point.z);
    }
  }
  const stripGeometry = new BufferGeometry();
  stripGeometry.setAttribute('position', new Float32BufferAttribute(strip, 3));
  const centre = new Mesh(stripGeometry, new MeshBasicMaterial({ side: DoubleSide }));

  const raycaster = new Raycaster();
  const cast = (origin: Vector3, direction: Vector3): SurfaceHit | null => {
    raycaster.set(origin, direction);
    const hit = raycaster.intersectObject(centre, false)[0];
    if (!hit?.face) return null;
    const normal = hit.face.normal.clone();
    if (normal.dot(direction) > 0) normal.negate();
    return { point: hit.point, normal };
  };
  const down = new Vector3(0, -1, 0);
  const under = (x: number, z: number) => cast(new Vector3(x, 3, z), down);

  // Plates stand just proud of the bumper: find the foremost point across the plate's width at its height.
  for (const [facing, height] of [[1, 0.37], [-1, 0.6]] as const) {
    let proud: number | null = null;
    for (let x = -0.24; x <= 0.241; x += 0.04) {
      for (const dy of [-0.045, 0, 0.045]) {
        const hit = cast(new Vector3(x, height + dy, facing * 4), new Vector3(0, 0, -facing));
        if (hit && (proud === null || hit.point.z * facing > proud * facing)) proud = hit.point.z;
      }
    }
    if (proud === null) continue;
    const mesh = plate(PLATE);
    mesh.position.set(0, height, proud + facing * 0.014);
    if (facing < 0) mesh.rotation.y = Math.PI;
    root.add(mesh);
  }

  return { root, cast, under };
}
