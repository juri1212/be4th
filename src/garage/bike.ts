import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  CylinderGeometry,
  DoubleSide,
  Euler,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Path,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  Shape,
  Vector2,
  Vector3,
  type Material,
} from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { loft, station, type Station } from './loft';

// A Rose Backroad FF in Rotten Candy, built from its geometry chart (size M/L) and photos of the real bike.
// Metres. The bike faces +z, +x is its left (non-drive) side, and the origin is on the ground under the bottom bracket.

const DEG = Math.PI / 180;
const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
const add = (a: Vector3, direction: Vector3, distance: number) => a.clone().addScaledVector(direction, distance);
const mix = (a: Vector3, b: Vector3, t: number) => a.clone().lerp(b, t);

export const WHEEL_RADIUS = 0.351; // 700c rim with a 40 mm tyre
const BB = v(0, WHEEL_RADIUS - 0.075, 0);
const CHAINSTAY = 0.42;
export const REAR_AXLE = v(0, WHEEL_RADIUS, -Math.sqrt(CHAINSTAY ** 2 - 0.075 ** 2));
const HEAD_ANGLE = 72.2 * DEG;
// Down the steering axis, and forward at a right angle to it.
const STEER = v(0, -Math.sin(HEAD_ANGLE), Math.cos(HEAD_ANGLE));
const AHEAD = v(0, Math.cos(HEAD_ANGLE), Math.sin(HEAD_ANGLE));
const HEAD_TOP = v(0, BB.y + 0.574, 0.4);
const HEAD_BOTTOM = add(HEAD_TOP, STEER, 0.145);
const RAKE = 0.05;
const FORK_LENGTH = (HEAD_BOTTOM.y + RAKE * AHEAD.y - WHEEL_RADIUS) / Math.sin(HEAD_ANGLE);
export const FRONT_AXLE = add(add(HEAD_BOTTOM, STEER, FORK_LENGTH), AHEAD, RAKE);
const SEAT_ANGLE = 73.5 * DEG;
const SEAT = v(0, Math.sin(SEAT_ANGLE), -Math.cos(SEAT_ANGLE));
const SEAT_AHEAD = v(0, Math.cos(SEAT_ANGLE), Math.sin(SEAT_ANGLE));
const seatTube = (distance: number) => add(BB, SEAT, distance);
// Half the hub widths: 100 mm front, 142 mm rear.
const FRONT_HUB = 0.05;
const REAR_HUB = 0.071;
const CHAINLINE = -0.05;
const TEETH = 0.0127 / (2 * Math.PI); // pitch radius per tooth

// ---------- small geometry helpers ----------

// A cylinder along x.
function cylinderX(radius: number, from: number, to: number, segments = 24): BufferGeometry {
  return new CylinderGeometry(radius, radius, Math.abs(to - from), segments)
    .rotateZ(Math.PI / 2)
    .translate((from + to) / 2, 0, 0);
}

// Spins a closed outline of [radius, x] points around the x axis. Counter-clockwise outlines face outwards.
function latheX(points: [radius: number, x: number][], segments = 96, start = 0, length = Math.PI * 2): BufferGeometry {
  return new LatheGeometry(points.map(([radius, x]) => new Vector2(radius, x)), segments, start, length).rotateZ(-Math.PI / 2);
}

const rod = (from: Vector3, to: Vector3, radius: number, around = 8) =>
  loft([{ at: from, width: radius * 2, depth: radius * 2 }, { at: to, width: radius * 2, depth: radius * 2 }], {
    around,
    power: 2,
    side: Math.abs(from.clone().sub(to).normalize().x) > 0.9 ? v(0, 1, 0) : v(1, 0, 0),
  });

// A flat part cut from sheet: a disc with teeth or windows, standing in the yz plane at x = 0.
function plate(shape: Shape, thickness: number): BufferGeometry {
  const geometry = new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 10 });
  geometry.translate(0, 0, -thickness / 2).rotateY(Math.PI / 2);
  return mergeVertices(geometry);
}

function sprocket(teeth: number, windows = 0, windowRadius = 0): Shape {
  const pitch = teeth * TEETH;
  const shape = new Shape();
  for (let i = 0; i < teeth * 4; i++) {
    const angle = (i / (teeth * 4)) * Math.PI * 2;
    // Each tooth: two points out, two points in.
    const radius = pitch + (i % 4 < 2 ? 0.0032 : -0.0026);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  for (let i = 0; i < windows; i++) {
    const angle = ((i + 0.5) / windows) * Math.PI * 2;
    const hole = new Path();
    hole.absarc(Math.cos(angle) * pitch * 0.74, Math.sin(angle) * pitch * 0.74, windowRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  return shape;
}

// Collects geometry by material, so the whole bike ends up as a handful of meshes.
class Kit {
  private bins = new Map<Material, BufferGeometry[]>();

  add(material: Material, geometry: BufferGeometry, move?: Vector3 | Matrix4): this {
    if (move instanceof Vector3) geometry.translate(move.x, move.y, move.z);
    else if (move) geometry.applyMatrix4(move);
    const bin = this.bins.get(material) ?? [];
    bin.push(geometry.index ? geometry : mergeVertices(geometry));
    this.bins.set(material, bin);
    return this;
  }

  // Adds the geometry and its mirror image on the other side of the bike.
  pair(material: Material, build: (side: 1 | -1) => BufferGeometry): this {
    return this.add(material, build(1)).add(material, build(-1));
  }

  build(name: string): Group {
    const group = new Group();
    group.name = name;
    for (const [material, geometries] of this.bins) {
      for (const geometry of geometries) {
        for (const attribute of Object.keys(geometry.attributes)) {
          if (!['position', 'normal', 'uv'].includes(attribute)) geometry.deleteAttribute(attribute);
        }
      }
      const mesh = new Mesh(mergeGeometries(geometries), material);
      mesh.name = `${name}:${material.name}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}

// ---------- materials ----------

// Rotten Candy: a dusty pink that looks sponged on, with darker and lighter clouds and a few freckles.
function paintTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#dc9a9c';
  context.fillRect(0, 0, size, size);
  // A fixed seed, so the bike looks the same on every visit.
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const blot = (x: number, y: number, radius: number, color: string) => {
    // Drawn nine times around the edges so the texture tiles.
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const gradient = context.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgb(0 0 0 / 0)');
        context.fillStyle = gradient;
        context.fillRect(x + dx - radius, y + dy - radius, radius * 2, radius * 2);
      }
    }
  };
  for (let i = 0; i < 340; i++) {
    const tone = random();
    const color = tone < 0.55 ? `rgb(176 104 112 / ${0.05 + random() * 0.09})` : `rgb(244 200 196 / ${0.06 + random() * 0.1})`;
    blot(random() * size, random() * size, 10 + random() * 30, color);
  }
  for (let i = 0; i < 300; i++) blot(random() * size, random() * size, 1.2 + random() * 3, `rgb(128 70 80 / ${0.08 + random() * 0.14})`);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 6);
  texture.anisotropy = 8;
  return texture;
}

function labelTexture(draw: (context: CanvasRenderingContext2D, width: number, height: number) => void, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d')!, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.anisotropy = 8;
  return texture;
}

function createMaterials() {
  const named = <T extends Material>(name: string, material: T) => {
    material.name = name;
    return material;
  };
  return {
    paint: named('paint', new MeshPhysicalMaterial({ map: paintTexture(), roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.35 })),
    carbon: named('carbon', new MeshPhysicalMaterial({ color: 0x0c0c0e, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3, side: DoubleSide })),
    gloss: named('gloss', new MeshPhysicalMaterial({ color: 0x08080a, roughness: 0.25, clearcoat: 0.6, clearcoatRoughness: 0.15 })),
    rubber: named('rubber', new MeshStandardMaterial({ color: 0x131314, roughness: 0.92, side: DoubleSide })),
    tyre: named('tyre', new MeshStandardMaterial({ color: 0x23211f, roughness: 0.97, side: DoubleSide })),
    steel: named('steel', new MeshStandardMaterial({ color: 0xb9bcc0, metalness: 1, roughness: 0.3 })),
    alloy: named('alloy', new MeshStandardMaterial({ color: 0x2a2b2e, metalness: 0.85, roughness: 0.42 })),
  };
}

type Materials = ReturnType<typeof createMaterials>;

// ---------- wheels ----------

function buildWheel(materials: Materials, rear: boolean): Group {
  const kit = new Kit();
  const hub = rear ? REAR_HUB : FRONT_HUB;

  // Tyre: 40 mm round, open towards the rim.
  const section = 0.0205;
  const centre = WHEEL_RADIUS - section;
  const tyre: [number, number][] = [];
  for (let i = 0; i <= 28; i++) {
    const angle = (-132 + (264 * i) / 28) * DEG;
    tyre.push([centre + Math.cos(angle) * section, Math.sin(angle) * section]);
  }
  kit.add(materials.tyre, latheX(tyre, 128));

  // Rim: 45 mm deep carbon, 31 mm wide, with a blunt nose.
  kit.add(
    materials.carbon,
    latheX(
      [
        [0.2715, 0], [0.2722, -0.004], [0.2755, -0.0072], [0.285, -0.0118], [0.298, -0.0148], [0.31, -0.0157], [0.3172, -0.0154],
        [0.318, -0.013], [0.313, -0.0115], [0.313, 0.0115], [0.318, 0.013],
        [0.3172, 0.0154], [0.31, 0.0157], [0.298, 0.0148], [0.285, 0.0118], [0.2755, 0.0072], [0.2722, 0.004], [0.2715, 0],
      ],
      128,
    ),
  );

  // Hub: shell, two flanges and end caps that meet the dropouts.
  const flange = hub - 0.016;
  kit.add(
    materials.carbon,
    latheX(
      [
        [0.008, -hub], [0.011, -hub], [0.012, -flange - 0.006], [0.026, -flange - 0.003], [0.026, -flange + 0.002], [0.015, -flange + 0.012],
        [0.0135, 0], [0.015, flange - 0.012], [0.026, flange - 0.002], [0.026, flange + 0.003], [0.012, flange + 0.006], [0.011, hub], [0.008, hub],
      ],
      32,
    ),
  );

  // Spokes: 24, laced alternately to each flange and crossed.
  for (let i = 0; i < 24; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const lead = (i % 4 < 2 ? 1 : -1) * 0.95;
    const rimAngle = (i / 24) * Math.PI * 2;
    const hubAngle = rimAngle + lead;
    kit.add(
      materials.alloy,
      rod(v(side * flange, Math.cos(hubAngle) * 0.0245, Math.sin(hubAngle) * 0.0245), v(0, Math.cos(rimAngle) * 0.273, Math.sin(rimAngle) * 0.273), 0.0011, 5),
    );
  }

  // Brake rotor on the left: a 160 mm steel ring on a six-arm carrier.
  const rotorX = hub - 0.0105;
  const ring = new Shape();
  ring.absarc(0, 0, 0.08, 0, Math.PI * 2, false);
  const bore = new Path();
  bore.absarc(0, 0, 0.066, 0, Math.PI * 2, true);
  ring.holes.push(bore);
  kit.add(materials.steel, plate(ring, 0.0018), v(rotorX, 0, 0));
  const carrier = new Shape();
  for (let i = 0; i <= 72; i++) {
    const angle = (i / 72) * Math.PI * 2;
    const radius = 0.045 + 0.0225 * Math.max(0, Math.cos(angle * 6)) ** 0.6;
    if (i === 0) carrier.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    else carrier.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  for (let i = 0; i < 6; i++) {
    const angle = ((i + 0.5) / 6) * Math.PI * 2;
    const hole = new Path();
    hole.absarc(Math.cos(angle) * 0.031, Math.sin(angle) * 0.031, 0.0085, 0, Math.PI * 2, true);
    carrier.holes.push(hole);
  }
  kit.add(materials.alloy, plate(carrier, 0.002), v(rotorX, 0, 0));

  if (rear) {
    // Cassette: twelve sprockets, 10 to 44 teeth, largest at the spokes.
    [44, 38, 32, 28, 24, 21, 19, 17, 15, 13, 11, 10].forEach((teeth, index) => {
      kit.add(index < 3 ? materials.alloy : materials.steel, plate(sprocket(teeth), 0.0017), v(-0.0215 - index * 0.0036, 0, 0));
    });
    kit.add(materials.alloy, cylinderX(0.017, -0.064, -0.02));
  }

  const wheel = kit.build(rear ? 'rear-wheel' : 'front-wheel');

  // The rim's lettering, on a band that hugs each sidewall. The left side's band runs the other way round.
  const lettering = labelTexture(
    (context, width, height) => {
      context.fillStyle = '#e9e6e1';
      context.font = `700 ${height * 0.8}px "Archivo Variable", "Arial Narrow", sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('GC', width / 2, height / 2 + height * 0.04);
    },
    128,
    64,
  );
  const mirrored = lettering.clone();
  mirrored.repeat.set(-1, -1);
  mirrored.offset.set(1, 1);
  for (const side of [1, -1]) {
    const label = new MeshStandardMaterial({ map: side > 0 ? mirrored : lettering, transparent: true, roughness: 0.5, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    label.name = 'rim-label';
    for (const where of [0.25, 0.75]) {
      const arc = 0.19;
      const band = latheX(side > 0 ? [[0.307, 0.0159], [0.289, 0.01355]] : [[0.289, -0.01355], [0.307, -0.0159]], 10, where * Math.PI * 2 - arc / 2, arc);
      const mesh = new Mesh(band, label);
      mesh.name = 'rim-label';
      wheel.add(mesh);
    }
  }
  return wheel;
}

// ---------- chain ----------

interface Pulley {
  // Position in the bike's side view, as [z, y].
  at: [number, number];
  radius: number;
  // 1 when the chain passes with the pulley on its right, -1 on its left.
  wrap: 1 | -1;
  x: number;
}

// The chain's centre line around the chainring, a sprocket and the two derailleur pulleys.
function chainPath(pulleys: Pulley[]): Station[] {
  const count = pulleys.length;
  // The angle of each straight run's left-hand normal.
  const normals = pulleys.map((from, i) => {
    const to = pulleys[(i + 1) % count]!;
    const dz = to.at[0] - from.at[0];
    const dy = to.at[1] - from.at[1];
    return Math.atan2(dy, dz) + Math.acos((from.wrap * from.radius - to.wrap * to.radius) / Math.hypot(dz, dy));
  });
  const points: Station[] = [];
  pulleys.forEach((pulley, i) => {
    // Around this pulley, from where the last run arrives to where the next one leaves.
    const offset = pulley.wrap > 0 ? 0 : Math.PI;
    let from = normals[(i - 1 + count) % count]! + offset;
    let to = normals[i]! + offset;
    // The pulley is on the right, so the chain turns clockwise around it.
    if (pulley.wrap > 0) while (to > from) to -= Math.PI * 2;
    else while (to < from) to += Math.PI * 2;
    const steps = Math.max(2, Math.ceil(Math.abs(to - from) / 0.2));
    for (let step = 0; step <= steps; step++) {
      const angle = from + ((to - from) * step) / steps;
      points.push(station(pulley.x, pulley.at[1] + Math.sin(angle) * pulley.radius, pulley.at[0] + Math.cos(angle) * pulley.radius, 0.0062, 0.0082));
    }
    from = to;
  });
  return points;
}

// ---------- the bike ----------

// Something that goes onto the frame on its own when the bike is put together.
export interface Part {
  group: Group;
  // Where it sits on the finished bike.
  home: Vector3;
  // Where it waits before it is fitted, measured from home. It travels the same line back.
  apart: Vector3;
}

export const PARTS = ['fork', 'cockpit', 'seat', 'cranks', 'gears', 'rearWheel'] as const;

export interface Bike {
  // Everything, as it stands on the ground.
  root: Group;
  // Fork, bar and stem, saddle and post, cranks, derailleur and chain, and the rear wheel, which is centred on its axle.
  parts: Record<(typeof PARTS)[number], Part>;
  // Centred on its axle.
  frontWheel: Group;
  // The front thru-axle, centred on the hub.
  axle: Group;
  materials: Material[];
}

// How far from its dropouts each wheel stands before it is rolled in.
export const WHEEL_APART = 0.55;

export function buildBike(): Bike {
  const materials = createMaterials();
  // One kit per part that goes onto the bike on its own when it is put together.
  const frame = new Kit();
  const fork = new Kit();
  const cockpit = new Kit();
  const seat = new Kit();
  const cranks = new Kit();
  const gears = new Kit();
  const { paint, carbon, gloss, rubber, steel, alloy } = materials;

  // ----- frame -----
  frame.add(
    paint,
    loft([{ at: add(HEAD_TOP, STEER, -0.004), width: 0.05, depth: 0.066 }, { at: add(HEAD_TOP, STEER, 0.065), width: 0.047, depth: 0.061 }, { at: add(HEAD_BOTTOM, STEER, 0.008), width: 0.06, depth: 0.082 }], {
      smooth: 6,
      power: 2.6,
      around: 28,
    }),
  );
  const topFront = add(HEAD_TOP, STEER, 0.03);
  const topRear = seatTube(0.487);
  frame.add(
    paint,
    loft([{ at: topFront, width: 0.052, depth: 0.046 }, { at: mix(topFront, topRear, 0.45), width: 0.042, depth: 0.034 }, { at: topRear, width: 0.034, depth: 0.036 }], { power: 2.8, around: 24, smooth: 5 }),
  );
  const downFront = add(add(HEAD_BOTTOM, STEER, -0.04), AHEAD, -0.004);
  frame.add(
    paint,
    loft(
      [
        { at: downFront, width: 0.05, depth: 0.076 },
        { at: mix(downFront, BB, 0.45), width: 0.054, depth: 0.066 },
        { at: mix(downFront, BB, 0.86), width: 0.064, depth: 0.06 },
        { at: BB, width: 0.07, depth: 0.056 },
      ],
      { power: 2.8, around: 24, smooth: 5 },
    ),
  );
  // The seat tube bows forward in the middle to clear the rear tyre.
  frame.add(
    paint,
    loft(
      [
        { at: BB, width: 0.062, depth: 0.05 },
        { at: add(seatTube(0.19), SEAT_AHEAD, 0.007), width: 0.036, depth: 0.034 },
        { at: seatTube(0.36), width: 0.034, depth: 0.036 },
        { at: seatTube(0.508), width: 0.033, depth: 0.042 },
      ],
      { power: 2.6, around: 22, smooth: 6 },
    ),
  );
  frame.add(paint, cylinderX(0.037, -0.044, 0.044, 32), BB);
  frame.add(alloy, cylinderX(0.024, -0.0465, 0.0465, 24), BB);

  // Dropped seat stays and chainstays, both sides.
  frame.pair(paint, (side) =>
    loft(
      [
        station(side * 0.012, seatTube(0.34).y, seatTube(0.34).z - 0.004, 0.016, 0.024),
        station(side * 0.04, 0.565, -0.152, 0.014, 0.022),
        station(side * 0.059, 0.468, -0.288, 0.013, 0.019),
        station(side * 0.067, REAR_AXLE.y + 0.012, REAR_AXLE.z + 0.008, 0.012, 0.016),
      ],
      { smooth: 6, around: 14, power: 2.4 },
    ),
  );
  frame.pair(paint, (side) =>
    loft(
      [
        station(side * 0.033, BB.y, -0.012, 0.015, 0.032),
        station(side * 0.039, BB.y + 0.008, -0.105, 0.014, 0.03),
        station(side * 0.06, BB.y + 0.048, -0.3, 0.014, 0.025),
        station(side * 0.0685, REAR_AXLE.y - 0.002, REAR_AXLE.z + 0.006, 0.012, 0.022),
      ],
      { smooth: 6, around: 14, power: 2.6 },
    ),
  );
  frame.pair(paint, (side) => cylinderX(0.017, side * 0.0625, side * 0.0745, 20).translate(0, REAR_AXLE.y, REAR_AXLE.z));
  frame.add(alloy, cylinderX(0.008, 0.0745, 0.081, 16), REAR_AXLE);

  // ----- fork -----
  const forkAt = (t: number) => mix(HEAD_BOTTOM, FRONT_AXLE, t);
  const blade = (t: number, x: number, width: number, depth: number): Station => ({ at: forkAt(t).setX(x), width, depth });
  // One piece from the left dropout up over the crown and down to the right dropout.
  const half = (side: number): Station[] => [
    blade(0.99, side * 0.0562, 0.028, 0.0125),
    blade(0.62, side * 0.057, 0.04, 0.016),
    blade(0.26, side * 0.058, 0.05, 0.019),
    blade(0.11, side * 0.057, 0.06, 0.024),
    blade(0.035, side * 0.039, 0.07, 0.034),
  ];
  fork.add(paint, loft([...half(1), blade(0, 0, 0.076, 0.04), ...half(-1).reverse()], { side: AHEAD, smooth: 6, around: 18, power: 2.7 }));
  fork.pair(paint, (side) => cylinderX(0.0125, side * 0.05, side * 0.0625, 20).translate(0, FRONT_AXLE.y, FRONT_AXLE.z));

  // ----- cockpit -----
  cockpit.add(carbon, loft([{ at: add(HEAD_TOP, STEER, -0.004), width: 0.046, depth: 0.06 }, { at: add(HEAD_TOP, STEER, -0.016), width: 0.042, depth: 0.052 }], { power: 2.6, around: 24 }));
  const stemBase = add(HEAD_TOP, STEER, -0.03);
  const STEM = v(0, Math.sin(11 * DEG), Math.cos(11 * DEG));
  const clamp = add(stemBase, STEM, 0.1);
  cockpit.add(
    carbon,
    loft(
      [
        { at: add(stemBase, STEM, -0.03), width: 0.038, depth: 0.03 },
        { at: stemBase, width: 0.045, depth: 0.04 },
        { at: add(clamp, STEM, -0.03), width: 0.05, depth: 0.03 },
        { at: add(clamp, STEM, 0.006), width: 0.07, depth: 0.014 },
      ],
      { power: 3, around: 20, smooth: 5 },
    ),
  );
  // One-piece bar: aero tops, short reach, flared drops. Offsets are [out, up, forward] from the clamp.
  const BAR: [number, number, number, number, number][] = [
    [0, 0, 0, 0.02, 0.05],
    [0.09, 0, 0, 0.017, 0.042],
    [0.162, 0, 0.004, 0.02, 0.034],
    [0.191, -0.002, 0.034, 0.027, 0.029],
    [0.2, -0.008, 0.072, 0.03, 0.03],
    [0.204, -0.036, 0.096, 0.03, 0.03],
    [0.21, -0.082, 0.088, 0.03, 0.03],
    [0.216, -0.116, 0.05, 0.03, 0.03],
    [0.223, -0.127, -0.012, 0.03, 0.03],
  ];
  const barStation = (side: number, [out, up, forward, thickness, depth]: (typeof BAR)[number]): Station => ({ at: v(clamp.x + side * out, clamp.y + up, clamp.z + forward), width: thickness, depth });
  cockpit.add(carbon, loft([...BAR.slice(1).reverse().map((point) => barStation(1, point)), ...BAR.map((point) => barStation(-1, point))], { side: v(0, 1, 0), smooth: 6, around: 14, power: 2.3 }));
  // Hoods and brake levers.
  const hoodBase = v(0.2, clamp.y - 0.008, clamp.z + 0.072);
  cockpit.pair(rubber, (side) => {
    const at = (up: number, forward: number, width: number, depth: number) => station(side * (hoodBase.x - forward * 0.14), hoodBase.y + up, hoodBase.z + forward, width, depth);
    return loft([at(-0.004, -0.05, 0.03, 0.032), at(0.007, -0.01, 0.034, 0.042), at(0.017, 0.028, 0.034, 0.046), at(0.036, 0.052, 0.031, 0.048), at(0.058, 0.062, 0.027, 0.034), at(0.07, 0.064, 0.02, 0.018)], {
      smooth: 5,
      around: 16,
      power: 2.8,
    });
  });
  cockpit.pair(gloss, (side) => {
    const at = (up: number, forward: number, out: number, width: number, depth: number) => station(side * (hoodBase.x - 0.01 + out), hoodBase.y + up, hoodBase.z + forward, width, depth);
    return loft([at(0.034, 0.06, 0, 0.012, 0.016), at(-0.012, 0.07, 0.002, 0.014, 0.022), at(-0.06, 0.066, 0.008, 0.013, 0.02), at(-0.1, 0.05, 0.016, 0.011, 0.013)], { smooth: 5, around: 10, power: 2.4 });
  });

  // ----- seatpost and saddle -----
  seat.add(carbon, loft([{ at: seatTube(0.47), width: 0.026, depth: 0.039 }, { at: seatTube(0.7), width: 0.026, depth: 0.039 }], { power: 2.2, around: 18 }));
  const saddleY = seatTube(0.745).y;
  const saddleZ = seatTube(0.745).z;
  seat.add(carbon, cylinderX(0.013, -0.024, 0.024, 16), v(0, saddleY - 0.04, saddleZ + 0.004));
  seat.pair(steel, (side) => rod(v(side * 0.021, saddleY - 0.034, saddleZ - 0.08), v(side * 0.018, saddleY - 0.03, saddleZ + 0.095), 0.0035));
  seat.add(
    rubber,
    loft(
      [
        station(0, saddleY + 0.004, saddleZ - 0.132, 0.09, 0.014),
        station(0, saddleY + 0.001, saddleZ - 0.112, 0.146, 0.034),
        station(0, saddleY - 0.008, saddleZ - 0.04, 0.134, 0.04),
        station(0, saddleY - 0.011, saddleZ + 0.03, 0.08, 0.036),
        station(0, saddleY - 0.01, saddleZ + 0.092, 0.047, 0.032),
        station(0, saddleY - 0.012, saddleZ + 0.128, 0.032, 0.02),
      ],
      { smooth: 6, around: 22, power: 3 },
    ),
  );

  // ----- drivetrain -----
  const crank = v(0, -Math.sin(18 * DEG), Math.cos(18 * DEG));
  cranks.add(alloy, cylinderX(0.015, -0.072, 0.072, 20), BB);
  cranks.add(gloss, plate(sprocket(40, 8, 0.0065), 0.003), v(CHAINLINE, BB.y, BB.z));
  cranks.add(gloss, cylinderX(0.03, CHAINLINE - 0.004, CHAINLINE + 0.004, 28), BB);
  for (const side of [1, -1] as const) {
    const direction = crank.clone().multiplyScalar(-side);
    const x = side * 0.066;
    const arm = (distance: number, width: number, depth: number): Station => ({ at: add(BB, direction, distance).setX(x), width, depth });
    cranks.add(gloss, loft([arm(-0.022, 0.016, 0.034), arm(0, 0.016, 0.042), arm(0.08, 0.014, 0.03), arm(0.1725, 0.014, 0.027), arm(0.186, 0.014, 0.02)], { smooth: 4, around: 14, power: 3 }));
    const pedal = add(BB, direction, 0.1725);
    cranks.add(steel, cylinderX(0.006, x, x + side * 0.03, 12), v(0, pedal.y, pedal.z));
    cranks.add(alloy, new BoxGeometry(0.058, 0.017, 0.062), v(x + side * 0.05, pedal.y, pedal.z));
  }

  // Rear derailleur: mount, battery, cage and two pulleys.
  const guide: Pulley = { at: [REAR_AXLE.z + 0.022, REAR_AXLE.y - 0.078], radius: 0.0235, wrap: 1, x: -0.043 };
  const tension: Pulley = { at: [REAR_AXLE.z + 0.062, REAR_AXLE.y - 0.168], radius: 0.029, wrap: -1, x: -0.043 };
  for (const pulley of [guide, tension]) {
    gears.add(alloy, plate(sprocket(Math.round(pulley.radius / TEETH), 0, 0), 0.002), v(pulley.x, pulley.at[1], pulley.at[0]));
  }
  gears.pair(alloy, (side) =>
    loft([station(guide.x + side * 0.006, guide.at[1] + 0.012, guide.at[0] - 0.006, 0.002, 0.03), station(tension.x + side * 0.006, tension.at[1] - 0.014, tension.at[0] + 0.006, 0.002, 0.036)], { power: 3, around: 8 }),
  );
  gears.add(
    alloy,
    loft([station(-0.079, REAR_AXLE.y - 0.004, REAR_AXLE.z - 0.004, 0.02, 0.03), station(-0.074, REAR_AXLE.y - 0.045, REAR_AXLE.z - 0.012, 0.024, 0.044), station(-0.06, guide.at[1] + 0.004, guide.at[0] - 0.004, 0.022, 0.034)], { smooth: 4, around: 12, power: 3 }),
  );
  gears.add(gloss, new BoxGeometry(0.02, 0.026, 0.036).rotateX(20 * DEG), v(-0.083, REAR_AXLE.y - 0.038, REAR_AXLE.z - 0.04));

  // Chain: over the chainring, around the 19-tooth sprocket and through the cage.
  gears.add(
    alloy,
    loft(
      chainPath([
        { at: [BB.z, BB.y], radius: 40 * TEETH, wrap: -1, x: CHAINLINE },
        { at: [REAR_AXLE.z, REAR_AXLE.y], radius: 19 * TEETH, wrap: -1, x: -0.0431 },
        guide,
        tension,
      ]),
      { closed: true, around: 6, power: 3 },
    ),
  );

  // Brake calipers, both on the left.
  fork.add(alloy, new BoxGeometry(0.03, 0.05, 0.03).rotateX(-18 * DEG), v(0.047, FRONT_AXLE.y + 0.062, FRONT_AXLE.z - 0.056));
  frame.add(alloy, new BoxGeometry(0.03, 0.03, 0.05).rotateX(12 * DEG), v(0.056, REAR_AXLE.y + 0.043, REAR_AXLE.z + 0.074));

  // ----- bottle cages, on the down tube and the seat tube -----
  const cage = (base: Vector3, axis: Vector3, out: Vector3) => {
    // Local frame: y runs up the tube, z points away from it.
    const local = new Matrix4().makeBasis(new Vector3().crossVectors(axis, out), axis, out).setPosition(base);
    const place = (geometry: BufferGeometry) => geometry.applyMatrix4(local);
    frame.add(carbon, place(new BoxGeometry(0.024, 0.15, 0.005).translate(0, 0, 0.003)));
    frame.add(carbon, place(new BoxGeometry(0.034, 0.008, 0.052).translate(0, -0.073, 0.028)));
    // Two bands around the bottle, open at the front, the upper one dipping forwards.
    for (const [height, dip, width] of [[0.03, 0.03, 0.016], [-0.035, 0, 0.02]] as const) {
      const band: Station[] = [];
      for (let i = 0; i <= 16; i++) {
        // Measured from straight out, so the gap is centred on 0.
        const angle = 0.62 + (i / 16) * (Math.PI * 2 - 1.24);
        band.push(station(Math.sin(angle) * 0.0385, height - (dip * (1 + Math.cos(angle))) / 2, 0.041 + Math.cos(angle) * 0.0385, width, 0.0034));
      }
      frame.add(carbon, place(loft(band, { side: v(0, 1, 0), around: 8, power: 3 })));
    }
  };
  const downAxis = downFront.clone().sub(BB).normalize();
  const downOut = v(0, downAxis.z, -downAxis.y);
  cage(add(mix(BB, downFront, 0.42), downOut, 0.032), downAxis, downOut);
  cage(add(seatTube(0.27), SEAT_AHEAD, 0.021), SEAT, SEAT_AHEAD);

  const frameGroup = frame.build('frame');

  // The R on the head tube, on a patch that wraps the front of it.
  // How far the R leans, as a share of its height. Archivo's own italic leans about as much.
  const SLANT = 0.17;
  const badgeFrom = add(HEAD_TOP, STEER, 0.022);
  const badgeLength = 0.1;
  const badge = labelTexture(
    (context, width, height) => {
      context.fillStyle = '#4b3a3d';
      // Slanted here rather than set in italics: the italic face is a file of its own, which nothing else on the page
      // needs and which would arrive after this is drawn.
      context.transform(1, 0, -SLANT, 1, (SLANT * height) / 2, 0);
      context.font = `800 ${height * 0.92}px "Archivo Variable", "Arial Narrow", sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('R', width / 2, height / 2 + height * 0.05);
    },
    192,
    256,
  );
  // The patch runs top to bottom and right to left as seen from the front; turn the texture to match.
  badge.repeat.set(-1, -1 / badgeLength);
  badge.offset.set(1, 1);
  const badgeMaterial = new MeshStandardMaterial({ map: badge, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 });
  badgeMaterial.name = 'badge';
  const badgeMesh = new Mesh(
    loft([{ at: badgeFrom, width: 0.0485, depth: 0.063 }, { at: add(badgeFrom, STEER, badgeLength / 2), width: 0.049, depth: 0.066 }, { at: add(badgeFrom, STEER, badgeLength), width: 0.056, depth: 0.076 }], {
      smooth: 5,
      power: 2.6,
      around: 14,
      arc: [Math.PI / 2 - 0.78, Math.PI / 2 + 0.78],
      inflate: 0.0006,
    }),
    badgeMaterial,
  );
  badgeMesh.name = 'badge';
  frameGroup.add(badgeMesh);

  const part = (group: Group, apart: Vector3, home = v(0, 0, 0)): Part => {
    group.position.copy(home);
    return { group, home, apart };
  };
  const parts = {
    // Up into the head tube from below, and the bar down onto it from above.
    fork: part(fork.build('fork'), STEER.clone().multiplyScalar(0.3)),
    cockpit: part(cockpit.build('cockpit'), STEER.clone().multiplyScalar(-0.24)),
    seat: part(seat.build('seat'), SEAT.clone().multiplyScalar(0.3)),
    // Through the bottom bracket from the drive side, and the chain over chainring and sprocket from the same side.
    cranks: part(cranks.build('cranks'), v(-0.34, 0, 0)),
    gears: part(gears.build('gears'), v(-0.24, 0, 0)),
    rearWheel: part(buildWheel(materials, true), v(0, 0, -WHEEL_APART), REAR_AXLE.clone()),
  };

  const frontWheel = buildWheel(materials, false);
  frontWheel.position.copy(FRONT_AXLE);

  // Front thru-axle: 12 mm, with a head on the left that takes a hex key.
  const axleKit = new Kit();
  axleKit.add(steel, cylinderX(0.006, -0.062, 0.064, 16));
  axleKit.add(alloy, cylinderX(0.0105, 0.0625, 0.073, 6));
  const axle = axleKit.build('thru-axle');
  axle.position.copy(FRONT_AXLE);

  const root = new Group();
  root.name = 'backroad-ff';
  root.add(frameGroup, ...PARTS.map((name) => parts[name].group), frontWheel, axle);
  return { root, parts, frontWheel, axle, materials: Object.values(materials) };
}

// Where a point of the bike ends up when the bike is pitched about its x axis and its front dropout sits at `dropout`.
export function bikePose(dropout: Vector3, pitch: number): { position: Vector3; quaternion: Quaternion } {
  const quaternion = new Quaternion().setFromEuler(new Euler(pitch, 0, 0));
  const position = dropout.clone().sub(FRONT_AXLE.clone().applyQuaternion(quaternion));
  return { position, quaternion };
}
