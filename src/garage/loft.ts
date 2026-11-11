import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from 'three';

// One cross-section of a tube: where its centre is, and how wide (along `side`) and deep (across it) it is there.
export interface Station {
  at: Vector3;
  width: number;
  depth: number;
}

export interface LoftOptions {
  // Roughly where the width axis points. It is carried along the path without twisting. Defaults to +x.
  side?: Vector3;
  // Vertices around each cross-section.
  around?: number;
  // Samples between stations; 0 keeps the path a straight polyline, more bends it smoothly through them.
  smooth?: number;
  // Superellipse exponent: 2 is an ellipse, 4 is close to a rounded box.
  power?: number;
  // Joins the last station back to the first, for loops like a chain.
  closed?: boolean;
  // Only this part of each cross-section, in radians from the width axis, for a patch that sits on a tube.
  arc?: [from: number, to: number];
  // Grows every cross-section by this much, so a patch clears the tube under it.
  inflate?: number;
}

const X = new Vector3(1, 0, 0);

// Sweeps a superellipse along a path. Bike tubes, bars, stays, saddle and chain are all this one shape.
export function loft(stations: Station[], options: LoftOptions = {}): BufferGeometry {
  const { side = X, around = 20, smooth = 0, power = 2.4, closed = false, arc, inflate = 0 } = options;

  // Resample the path.
  const rings: Station[] = [];
  if (smooth > 0 && stations.length > 2) {
    const curve = new CatmullRomCurve3(stations.map((station) => station.at), closed, 'centripetal');
    const spans = closed ? stations.length : stations.length - 1;
    const count = spans * smooth;
    for (let i = 0; i <= count - (closed ? 1 : 0); i++) {
      const t = i / count;
      const span = Math.min(Math.floor(t * spans), spans - 1);
      const local = t * spans - span;
      const a = stations[span]!;
      const b = stations[(span + 1) % stations.length]!;
      const ease = local * local * (3 - 2 * local);
      rings.push({ at: curve.getPoint(t), width: a.width + (b.width - a.width) * ease, depth: a.depth + (b.depth - a.depth) * ease });
    }
  } else {
    rings.push(...stations);
  }

  const n = rings.length;
  const tangents = rings.map((_, i) => {
    const before = rings[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)]!.at;
    const after = rings[closed ? (i + 1) % n : Math.min(i + 1, n - 1)]!.at;
    return after.clone().sub(before).normalize();
  });

  const [from, to] = arc ?? [0, Math.PI * 2];
  const full = !arc;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];

  const widthAxis = side.clone().addScaledVector(tangents[0]!, -side.dot(tangents[0]!)).normalize();
  const depthAxis = new Vector3();
  const turn = new Vector3();
  let along = 0;
  const exponent = 2 / power;
  const normalExponent = (2 * (power - 1)) / power;
  const spow = (value: number, e: number) => Math.sign(value) * Math.abs(value) ** e;

  for (let i = 0; i < n; i++) {
    const tangent = tangents[i]!;
    if (i > 0) {
      // Carry the width axis over to the new tangent with the smallest rotation that gets it there.
      const previous = tangents[i - 1]!;
      turn.crossVectors(previous, tangent);
      const sine = turn.length();
      if (sine > 1e-6) widthAxis.applyAxisAngle(turn.divideScalar(sine), Math.asin(Math.min(sine, 1)));
      widthAxis.addScaledVector(tangent, -widthAxis.dot(tangent)).normalize();
      along += rings[i]!.at.distanceTo(rings[i - 1]!.at);
    }
    depthAxis.crossVectors(tangent, widthAxis);
    const { at, width, depth } = rings[i]!;
    const a = width / 2 + inflate;
    const b = depth / 2 + inflate;
    for (let j = 0; j <= around; j++) {
      const angle = from + ((to - from) * j) / around;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = a * spow(cos, exponent);
      const y = b * spow(sin, exponent);
      positions.push(at.x + widthAxis.x * x + depthAxis.x * y, at.y + widthAxis.y * x + depthAxis.y * y, at.z + widthAxis.z * x + depthAxis.z * y);
      const nx = spow(cos, normalExponent) / a;
      const ny = spow(sin, normalExponent) / b;
      const length = Math.hypot(nx, ny) || 1;
      normals.push(
        (widthAxis.x * nx + depthAxis.x * ny) / length,
        (widthAxis.y * nx + depthAxis.y * ny) / length,
        (widthAxis.z * nx + depthAxis.z * ny) / length,
      );
      uvs.push(j / around, along);
    }
  }

  const stride = around + 1;
  const spans = closed ? n : n - 1;
  for (let i = 0; i < spans; i++) {
    const next = (i + 1) % n;
    for (let j = 0; j < around; j++) {
      const a = i * stride + j;
      const b = next * stride + j;
      index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  // Flat caps on open tubes.
  if (!closed && full) {
    for (const end of [0, n - 1]) {
      const { at } = rings[end]!;
      const facing = tangents[end]!.clone().multiplyScalar(end === 0 ? -1 : 1);
      const centre = positions.length / 3;
      positions.push(at.x, at.y, at.z);
      normals.push(facing.x, facing.y, facing.z);
      uvs.push(0.5, 0.5);
      for (let j = 0; j <= around; j++) {
        const source = (end * stride + j) * 3;
        positions.push(positions[source]!, positions[source + 1]!, positions[source + 2]!);
        normals.push(facing.x, facing.y, facing.z);
        uvs.push(0.5, 0.5);
      }
      for (let j = 0; j < around; j++) {
        if (end === 0) index.push(centre, centre + 2 + j, centre + 1 + j);
        else index.push(centre, centre + 1 + j, centre + 2 + j);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  return geometry;
}

export const station = (x: number, y: number, z: number, width: number, depth: number): Station => ({ at: new Vector3(x, y, z), width, depth });
