import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  Shape,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three';
import { FRONT_AXLE, REAR_AXLE, WHEEL_RADIUS } from './bike';
import type { Car } from './car';
import { loft, station, type Station } from './loft';

// A vacuum-cup roof rack like the one in the photos: a white board on four cups with a thru-axle fork mount, and a
// single cup behind it that the rear wheel is strapped to. It is fitted to the car's actual roof and rear window.

const UP = new Vector3(0, 1, 0);
// How far behind the middle of the car the board sits: on the painted roof, just behind the glass panel.
const BOARD_Z = -0.6;
const CUP_SPACING = 0.165;
const CUPS = [-1.5, -0.5, 0.5, 1.5].map((slot) => slot * CUP_SPACING);
const BOARD_CLEARANCE = 0.052;
const BOARD_THICKNESS = 0.012;
const AXLE_HEIGHT = 0.052;
// Tyre to rear window, with the cup and its cradle in between.
const CRADLE_HEIGHT = 0.064;

function mesh(geometry: BufferGeometry, material: Material, name: string): Mesh {
  const result = new Mesh(geometry, material);
  result.name = name;
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

function createMaterials() {
  return {
    board: new MeshStandardMaterial({ color: 0xeceae5, roughness: 0.55 }),
    rubber: new MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.7 }),
    plastic: new MeshStandardMaterial({ color: 0x151517, roughness: 0.45 }),
    alloy: new MeshStandardMaterial({ color: 0xb6b9bd, metalness: 1, roughness: 0.32 }),
    lever: new MeshStandardMaterial({ color: 0xc8202a, roughness: 0.4, metalness: 0.3 }),
    indicator: new MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.5 }),
    strap: new MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.95, transparent: true }),
  };
}

type Materials = ReturnType<typeof createMaterials>;

// One vacuum cup, standing on y = 0: the rubber skirt, its housing and the pump you press until the band disappears.
function cup(materials: Materials, pumpAngle: number): Group {
  const group = new Group();
  group.name = 'cup';
  const skirt = [[0.077, 0], [0.076, 0.004], [0.066, 0.011], [0.05, 0.017], [0.04, 0.021], [0.036, 0.026]] as const;
  group.add(mesh(new LatheGeometry(skirt.map(([radius, y]) => new Vector2(radius, y)), 48), materials.rubber, 'cup-skirt'));
  const housing = [[0.036, 0.022], [0.036, 0.04], [0.031, 0.045], [0, 0.045]] as const;
  group.add(mesh(new LatheGeometry(housing.map(([radius, y]) => new Vector2(radius, y)), 32), materials.plastic, 'cup-housing'));
  const pump = new Group();
  pump.add(mesh(new CylinderGeometry(0.0095, 0.0095, 0.04, 16).rotateZ(Math.PI / 2).translate(0.052, 0.033, 0), materials.plastic, 'cup-pump'));
  pump.add(mesh(new CylinderGeometry(0.0098, 0.0098, 0.004, 16).rotateZ(Math.PI / 2).translate(0.036, 0.033, 0), materials.indicator, 'cup-indicator'));
  pump.rotation.y = pumpAngle;
  group.add(pump);
  return group;
}

// The board's outline from above: four lobes, one per cup.
function boardShape(): Shape {
  const end = CUPS[CUPS.length - 1]!;
  const halfWidth = (x: number) => 0.054 - 0.013 * Math.cos((2 * Math.PI * x) / CUP_SPACING);
  const lobe = halfWidth(end);
  const shape = new Shape();
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const x = -end + (2 * end * i) / steps;
    if (i === 0) shape.moveTo(x, halfWidth(x));
    else shape.lineTo(x, halfWidth(x));
  }
  shape.absarc(end, 0, lobe, Math.PI / 2, -Math.PI / 2, true);
  for (let i = steps; i >= 0; i--) {
    const x = -end + (2 * end * i) / steps;
    shape.lineTo(x, -halfWidth(x));
  }
  shape.absarc(-end, 0, lobe, -Math.PI / 2, Math.PI / 2, true);
  return shape;
}

export interface Rack {
  // Board, four cups and the fork mount.
  roof: Group;
  // The cup and cradle under the rear wheel.
  tail: Group;
  // Holds the rear rim to the cradle. Hidden until the bike is on.
  strap: Mesh;
  // The fork mount's clamp lever, which swings about its x axis.
  lever: Group;
  // Where the fork's thru-axle goes, in car coordinates.
  mount: Vector3;
  // The bike's pitch once its rear tyre rests in the cradle, in radians. Negative is tail down.
  pitch: number;
}

export function buildRack(car: Car): Rack {
  const materials = createMaterials();

  // ----- on the roof -----
  const centre = car.under(0, BOARD_Z);
  if (!centre) throw new Error('No roof under the rack');
  const roof = new Group();
  roof.name = 'rack';
  roof.position.copy(centre.point);
  // Lean with the roof, which falls away towards the tail here.
  roof.quaternion.setFromUnitVectors(UP, centre.normal.clone().setX(0).normalize());
  roof.updateMatrixWorld(true);
  const toRoof = roof.quaternion.clone().invert();

  CUPS.forEach((x, index) => {
    const hit = car.under(x, BOARD_Z + (index % 2 === 0 ? 0.004 : -0.004)) ?? centre;
    const foot = roof.worldToLocal(hit.point.clone());
    const normal = hit.normal.clone().applyQuaternion(toRoof);
    const part = cup(materials, index < 2 ? Math.PI * 0.75 : Math.PI * 0.25);
    part.position.copy(foot);
    part.quaternion.setFromUnitVectors(UP, normal);
    roof.add(part);
    // A post from the cup up to the board.
    const top = BOARD_CLEARANCE + 0.001;
    const post = mesh(new CylinderGeometry(0.02, 0.024, top - foot.y - 0.04, 20), materials.plastic, 'cup-post');
    post.position.set(foot.x, (top + foot.y + 0.04) / 2, foot.z);
    roof.add(post);
  });

  const board = mesh(
    new ExtrudeGeometry(boardShape(), { depth: BOARD_THICKNESS - 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 16 }).rotateX(-Math.PI / 2),
    materials.board,
    'board',
  );
  board.position.y = BOARD_CLEARANCE + 0.002;
  roof.add(board);

  // Fork mount: a base, two cheeks and the tube the thru-axle passes through.
  const deck = BOARD_CLEARANCE + BOARD_THICKNESS;
  const base = mesh(new BoxGeometry(0.086, 0.02, 0.062), materials.plastic, 'mount-base');
  base.position.set(0, deck + 0.01, 0);
  roof.add(base);
  const body = mesh(
    loft([station(0, deck + 0.018, 0, 0.074, 0.05), station(0, deck + AXLE_HEIGHT - 0.012, 0, 0.068, 0.036), station(0, deck + AXLE_HEIGHT + 0.012, 0, 0.06, 0.03)], { power: 3.4, around: 20 }),
    materials.plastic,
    'mount-body',
  );
  roof.add(body);
  const tube = mesh(new CylinderGeometry(0.0098, 0.0098, 0.1, 20).rotateZ(Math.PI / 2), materials.alloy, 'mount-tube');
  tube.position.set(0, deck + AXLE_HEIGHT, 0);
  roof.add(tube);
  const lever = new Group();
  lever.name = 'mount-lever';
  lever.position.set(0, deck + 0.026, 0.026);
  lever.add(mesh(loft([station(0, 0, 0, 0.022, 0.012), station(0, 0.004, 0.03, 0.02, 0.008), station(0, 0.012, 0.056, 0.016, 0.006)], { power: 3, around: 10, smooth: 4 }), materials.lever, 'mount-lever'));
  roof.add(lever);

  roof.updateMatrixWorld(true);
  const mount = roof.localToWorld(new Vector3(0, deck + AXLE_HEIGHT, 0));

  // ----- under the rear wheel -----
  // The car's centre line behind the rack, to find where the rear tyre comes to rest.
  const profile: Vector3[] = [];
  for (let z = mount.z - 1.6; z <= mount.z - 0.45; z += 0.015) {
    const hit = car.under(0, z);
    if (hit) profile.push(hit.point);
  }
  const wheelbase = FRONT_AXLE.z - REAR_AXLE.z;
  const rearAxle = (pitch: number) => new Vector3(0, mount.y + wheelbase * Math.sin(pitch), mount.z - wheelbase * Math.cos(pitch));
  const nearest = (pitch: number) => {
    const axle = rearAxle(pitch);
    let best = profile[0]!;
    for (const point of profile) if (point.distanceToSquared(axle) < best.distanceToSquared(axle)) best = point;
    return { axle, point: best, gap: best.distanceTo(axle) - WHEEL_RADIUS };
  };
  // Raising the tail opens the gap, so home in on the pitch that leaves room for exactly the cup and cradle.
  let low = -0.7;
  let high = 0.5;
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2;
    if (nearest(middle).gap < CRADLE_HEIGHT) low = middle;
    else high = middle;
  }
  const pitch = (low + high) / 2;
  const rest = nearest(pitch);
  const out = rest.axle.clone().sub(rest.point).normalize();
  const across = new Vector3(1, 0, 0);
  const around = new Vector3().crossVectors(across, out);

  const tail = new Group();
  tail.name = 'rack-tail';
  tail.position.copy(rest.point);
  tail.quaternion.setFromUnitVectors(UP, out);
  tail.add(cup(materials, Math.PI / 2));
  const cradle = mesh(
    loft([station(-0.032, CRADLE_HEIGHT - 0.004, 0, 0.07, 0.02), station(-0.014, CRADLE_HEIGHT - 0.014, 0, 0.074, 0.02), station(0.014, CRADLE_HEIGHT - 0.014, 0, 0.074, 0.02), station(0.032, CRADLE_HEIGHT - 0.004, 0, 0.07, 0.02)], {
      side: new Vector3(0, 0, 1),
      smooth: 4,
      around: 12,
      power: 3,
    }),
    materials.plastic,
    'cradle',
  );
  tail.add(cradle);

  // The strap: a loop from under the cradle, up both sides of the tyre and over the rim.
  const tyre = rest.axle.clone().addScaledVector(out, -WHEEL_RADIUS);
  const loop: Station[] = [];
  const bottom = -0.026;
  const top = 0.086;
  const half = 0.027;
  const corner = 0.014;
  const corners: [number, number, number][] = [
    [half - corner, bottom + corner, -Math.PI / 2],
    [half - corner, top - corner, 0],
    [-half + corner, top - corner, Math.PI / 2],
    [-half + corner, bottom + corner, Math.PI],
  ];
  for (const [u, w, start] of corners) {
    for (let i = 0; i <= 4; i++) {
      const angle = start + (i / 4) * (Math.PI / 2);
      const at = tyre.clone().addScaledVector(across, u + Math.cos(angle) * corner).addScaledVector(out, w + Math.sin(angle) * corner);
      loop.push({ at, width: 0.026, depth: 0.0028 });
    }
  }
  const strap = mesh(loft(loop, { side: around, closed: true, around: 8, power: 4 }), materials.strap, 'strap');
  strap.castShadow = false;

  return { roof, tail, strap, lever, mount, pitch };
}
