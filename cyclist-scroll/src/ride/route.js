import { clamp } from './math';

// World units run horizontally along the ride; elevation is in metres.
export const VERTICAL_SCALE = 0.275;
export const FINISH_X = 17400;
export const WORLD_MIN = -2400;
export const WORLD_MAX = 19800;

const SAMPLE_STEP = 5;

// `rough` is the amplitude (m) of natural undulation on the segment that follows.
const KEYPOINTS = [
  { x: WORLD_MIN, km: -80, ele: 1, rough: 2 },
  { x: 0, km: 0, ele: 2, rough: 3 },
  { x: 2600, km: 95, ele: 4, rough: 6 },
  { x: 3200, km: 118, ele: 28, rough: 8 },
  { x: 3900, km: 140, ele: 42, rough: 14 },
  { x: 4500, km: 170, ele: 250, rough: 16 },
  { x: 4850, km: 182, ele: 420, rough: 14 },
  { x: 5200, km: 194, ele: 265, rough: 16 },
  { x: 5550, km: 206, ele: 480, rough: 14 },
  { x: 5900, km: 220, ele: 245, rough: 16 },
  { x: 6250, km: 232, ele: 483, rough: 14 },
  { x: 6650, km: 246, ele: 300, rough: 10 },
  { x: 7400, km: 290, ele: 310, rough: 10 },
  { x: 8000, km: 296, ele: 530, rough: 12 },
  { x: 9000, km: 305.5, ele: 1420, rough: 12 },
  { x: 9600, km: 311.5, ele: 1910, rough: 26 },
  { x: 10800, km: 332.5, ele: 350, rough: 6 },
  { x: 11400, km: 370, ele: 320, rough: 14 },
  { x: 12300, km: 440, ele: 720, rough: 12 },
  { x: 12700, km: 444, ele: 1100, rough: 14 },
  { x: 13700, km: 453.8, ele: 1850, rough: 14 },
  { x: 14300, km: 460, ele: 1900, rough: 12 },
  { x: 14900, km: 466, ele: 1999, rough: 30 },
  { x: 16100, km: 492, ele: 760, rough: 8 },
  { x: 16900, km: 510, ele: 735, rough: 4 },
  { x: FINISH_X, km: 520, ele: 720, rough: 3 },
  { x: WORLD_MAX, km: 580, ele: 716, rough: 0 },
];

export const MARKERS = [
  { x: 3200, name: 'Bocholt', ele: 28 },
  { x: 5900, name: 'Stuttgart', ele: 245 },
  { x: 7400, name: 'Bédoin', ele: 310 },
  { x: 9600, name: 'Mont Ventoux', ele: 1910 },
  { x: 10800, name: 'Malaucène', ele: 350 },
  { x: 12300, name: 'Bourg d’Oisans', ele: 720 },
  { x: 13700, name: 'Alpe d’Huez', ele: 1850 },
  { x: 14900, name: 'Col de Sarenne', ele: 1999 },
];

// Fritsch–Carlson tangents keep the profile smooth without overshooting summits.
function monotoneTangents(xs, ys) {
  const n = xs.length;
  const slopes = [];
  for (let i = 0; i < n - 1; i++) slopes.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const tangents = new Array(n);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];
  for (let i = 1; i < n - 1; i++) {
    tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      tangents[i] = t * a * slopes[i];
      tangents[i + 1] = t * b * slopes[i];
    }
  }
  return tangents;
}

function undulation(x) {
  return Math.sin(x * 0.0137 + 1.3) * 0.5
    + Math.sin(x * 0.0291 + 0.2) * 0.32
    + Math.sin(x * 0.0663 + 2.1) * 0.18;
}

const samples = (() => {
  const xs = KEYPOINTS.map((point) => point.x);
  const ys = KEYPOINTS.map((point) => point.ele);
  const tangents = monotoneTangents(xs, ys);
  const count = Math.ceil((WORLD_MAX - WORLD_MIN) / SAMPLE_STEP) + 1;
  const values = new Float32Array(count);
  let segment = 0;
  for (let i = 0; i < count; i++) {
    const x = WORLD_MIN + i * SAMPLE_STEP;
    while (segment < xs.length - 2 && x > xs[segment + 1]) segment++;
    const h = xs[segment + 1] - xs[segment];
    const t = clamp((x - xs[segment]) / h, 0, 1);
    const t2 = t * t;
    const t3 = t2 * t;
    const base = (2 * t3 - 3 * t2 + 1) * ys[segment]
      + (t3 - 2 * t2 + t) * h * tangents[segment]
      + (-2 * t3 + 3 * t2) * ys[segment + 1]
      + (t3 - t2) * h * tangents[segment + 1];
    values[i] = base + KEYPOINTS[segment].rough * Math.sin(Math.PI * t) * undulation(x);
  }
  return values;
})();

export function elevationAt(x) {
  const position = (clamp(x, WORLD_MIN, WORLD_MAX) - WORLD_MIN) / SAMPLE_STEP;
  const index = Math.min(Math.floor(position), samples.length - 2);
  const t = position - index;
  return samples[index] + (samples[index + 1] - samples[index]) * t;
}

export const roadY = (x) => -elevationAt(x) * VERTICAL_SCALE;

export function kmAt(x) {
  const clamped = clamp(x, WORLD_MIN, WORLD_MAX);
  let i = 0;
  while (i < KEYPOINTS.length - 2 && clamped > KEYPOINTS[i + 1].x) i++;
  const a = KEYPOINTS[i];
  const b = KEYPOINTS[i + 1];
  return a.km + (b.km - a.km) * ((clamped - a.x) / (b.x - a.x));
}

export function xAtKm(km) {
  let i = 0;
  while (i < KEYPOINTS.length - 2 && km > KEYPOINTS[i + 1].km) i++;
  const a = KEYPOINTS[i];
  const b = KEYPOINTS[i + 1];
  return a.x + (b.x - a.x) * ((km - a.km) / (b.km - a.km));
}

export function gradeAt(x, window = 30) {
  const metres = (kmAt(x + window) - kmAt(x - window)) * 1000;
  if (metres <= 0) return 0;
  return ((elevationAt(x + window) - elevationAt(x - window)) / metres) * 100;
}

// The camera follows a softened version of the road so the rider can drift on screen.
export function cameraY(x) {
  let sum = 0;
  let weight = 0;
  for (let offset = -320; offset <= 320; offset += 80) {
    const w = 1 - Math.abs(offset) / 400;
    sum += roadY(x + offset) * w;
    weight += w;
  }
  return sum / weight;
}

export function segmentStats(from, to) {
  let gain = 0;
  let loss = 0;
  let maxGrade = 0;
  let minGrade = 0;
  let high = -Infinity;
  let previous = elevationAt(from);
  for (let x = from; x <= to; x += SAMPLE_STEP) {
    const ele = elevationAt(x);
    if (ele > previous) gain += ele - previous;
    else loss += previous - ele;
    previous = ele;
    high = Math.max(high, ele);
  }
  for (let x = from + 60; x <= to - 60; x += 20) {
    const grade = gradeAt(x, 60);
    maxGrade = Math.max(maxGrade, grade);
    minGrade = Math.min(minGrade, grade);
  }
  return { distance: kmAt(to) - kmAt(from), gain, loss, maxGrade, minGrade, high };
}

export function profilePoints(step = 20) {
  const points = [];
  for (let x = 0; x <= FINISH_X; x += step) points.push([x, elevationAt(x)]);
  return points;
}
