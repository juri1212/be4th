import { clamp, fbm, lerp, ridgedNoise, seededRandom, smoothstep, valueNoise } from './math';
import { FINISH_X, MARKERS, WORLD_MAX, WORLD_MIN, roadY, xAtKm } from './route';

const TILE = 1200;
const MARGIN = 2600;
const ROAD_STEP = 5;

// Parallax layers, far to near. `depth` is how much the layer dissolves into the haze.
export const LAYERS = [
  { p: 0.16, depth: 0.8, base: 150, step: 9, seed: 3, snow: 300 },
  { p: 0.24, depth: 0.66, base: 128, step: 8, seed: 7, snow: 250 },
  { p: 0.34, depth: 0.53, base: 106, step: 7, seed: 13, snow: 215 },
  { p: 0.47, depth: 0.4, base: 80, step: 6, seed: 19, snow: null },
  { p: 0.64, depth: 0.27, base: 50, step: 5, seed: 29, snow: null },
];

// Landscape character along the ride, keyed by world x.
const ZONES = [
  { x: -4000, amp: [10, 9, 8, 6, 4], ridge: 0, canopy: 0.8 },
  { x: 1800, amp: [12, 10, 9, 7, 5], ridge: 0, canopy: 0.8 },
  { x: 3600, amp: [40, 32, 26, 18, 12], ridge: 0, canopy: 1 },
  { x: 5600, amp: [150, 125, 100, 80, 55], ridge: 0.05, canopy: 1 },
  { x: 7600, amp: [180, 125, 90, 55, 30], ridge: 0.05, canopy: 0.35 },
  { x: 9800, amp: [240, 170, 115, 75, 40], ridge: 0.15, canopy: 0.35 },
  { x: 11800, amp: [420, 350, 270, 180, 100], ridge: 0.9, canopy: 0.8 },
  { x: 14000, amp: [470, 400, 310, 210, 120], ridge: 1, canopy: 0.8 },
  { x: 24000, amp: [450, 380, 300, 200, 110], ridge: 1, canopy: 0.9 },
];

function zoneAt(x) {
  let i = 0;
  while (i < ZONES.length - 2 && x > ZONES[i + 1].x) i++;
  const a = ZONES[i];
  const b = ZONES[i + 1];
  const t = smoothstep(a.x, b.x, x);
  return {
    amp: a.amp.map((value, index) => lerp(value, b.amp[index], t)),
    ridge: lerp(a.ridge, b.ridge, t),
    canopy: lerp(a.canopy, b.canopy, t),
  };
}

function canopy(lx, seed) {
  const crowns = Math.abs(Math.sin(lx * 0.12 + seed)) ** 0.5 * 2.4
    + Math.abs(Math.sin(lx * 0.047 + seed * 3)) ** 0.7 * 2.2;
  return crowns * smoothstep(0.35, 0.6, valueNoise(lx / 90, seed));
}

export function layerHeight(index, lx) {
  const layer = LAYERS[index];
  const zone = zoneAt(lx / layer.p);
  const f = lx / 380;
  const hills = clamp((fbm(f, layer.seed) - 0.2) / 0.6, 0, 1);
  const peaks = clamp((ridgedNoise(f * 0.8, layer.seed + 5) - 0.15) / 0.7, 0, 1);
  let height = zone.amp[index] * lerp(hills, peaks, zone.ridge);
  if (index >= 2) height += zone.canopy * canopy(lx, layer.seed) * (index - 1) * 1.6;
  return height;
}

export const layerSurface = (index, lx) => -(LAYERS[index].base + layerHeight(index, lx));

const f1 = (value) => Math.round(value * 10) / 10;

function buildLayerTiles(index) {
  const layer = LAYERS[index];
  const start = Math.floor((WORLD_MIN * layer.p - MARGIN) / TILE) * TILE;
  const end = WORLD_MAX * layer.p + MARGIN;
  const tiles = [];
  for (let x0 = start; x0 < end; x0 += TILE) {
    const x1 = x0 + TILE;
    let shape = `M${x0 - layer.step} 3000`;
    let snow = '';
    let run = null;
    const closeRun = () => {
      if (run && run.top.length > 2) {
        snow += `M${run.top.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}L${run.bottom.reverse().map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`;
      }
      run = null;
    };
    for (let x = x0 - layer.step; x <= x1 + layer.step; x += layer.step) {
      const height = layerHeight(index, x);
      const y = -(layer.base + height);
      shape += `L${f1(x)} ${f1(y)}`;
      if (layer.snow !== null && height > layer.snow) {
        const jag = (valueNoise(x / 16, layer.seed) - 0.5) * 30;
        run ??= { top: [], bottom: [] };
        run.top.push([x, y]);
        run.bottom.push([x, -(layer.base + Math.min(height, layer.snow + jag))]);
      } else {
        closeRun();
      }
    }
    closeRun();
    shape += `L${x1 + layer.step} 3000Z`;
    tiles.push({ x0, x1, shape, snow });
  }
  return tiles;
}

function buildRoadTiles() {
  const tiles = [];
  for (let x0 = WORLD_MIN; x0 < WORLD_MAX; x0 += TILE) {
    const x1 = Math.min(x0 + TILE, WORLD_MAX);
    const points = [];
    for (let x = x0; x <= x1 + ROAD_STEP; x += ROAD_STEP) points.push(`${x} ${f1(roadY(x))}`);
    const line = `M${points.join('L')}`;
    tiles.push({ x0, x1, line, ground: `${line}L${x1 + ROAD_STEP} 1600L${x0} 1600Z` });
  }
  return tiles;
}

// Objects placed on parallax layers, given in world x so they appear alongside the right stage.
const LAYER_PROPS = {
  4: [
    ...[650, 1850, 2700].map((x) => ({ kind: 'windmill', x, scale: 0.72 })),
    ...[1150, 1205, 2350].map((x) => ({ kind: 'dutchHouse', x, scale: 0.7 })),
    ...[400, 1000, 1550, 2150, 2550].flatMap((x) => row('poplar', x, 5, 15, 0.62)),
    { kind: 'church', x: 3350, scale: 0.68 },
    ...[3550, 3800].map((x) => ({ kind: 'farmhouse', x, scale: 0.66 })),
    ...[3100, 3450, 3950, 4300, 4600, 5050, 5400, 6450].flatMap((x) => row('roundTree', x, 3, 20, 0.62)),
    ...[5760, 5800, 5845, 5885, 5930, 5975, 6020].map((x, i) => ({ kind: 'building', x, scale: 0.62, variant: i })),
    ...[7000, 7350, 7700, 8100].flatMap((x) => row('cypress', x, 3, 11, 0.62)),
    { kind: 'farmhouse', x: 7550, scale: 0.64 },
    ...[7200, 7850].flatMap((x) => row('olive', x, 3, 24, 0.6)),
    ...[10400, 11000, 11300, 11600, 12050, 12500, 13000, 15400, 15900].flatMap((x) => row('pine', x, 4, 12, 0.6)),
    ...[11900, 12250].map((x) => ({ kind: 'chalet', x, scale: 0.64 })),
    ...[16880, 16930, 16990, 17060, 17260, 17330].map((x) => ({ kind: 'chalet', x, scale: 0.6, lit: true })),
    { kind: 'church', x: 17160, scale: 0.62, lit: true },
  ],
  3: [
    ...[1300, 2300].map((x) => ({ kind: 'windmill', x, scale: 0.5 })),
    ...[700, 2000].flatMap((x) => row('poplar', x, 6, 11, 0.46)),
    { kind: 'church', x: 3200, scale: 0.48 },
    { kind: 'tvTower', x: 6250, scale: 0.55 },
    ...[5700, 5760, 5820, 5900, 5960].map((x, i) => ({ kind: 'building', x, scale: 0.46, variant: i + 3 })),
    ...[7200, 7900].flatMap((x) => row('cypress', x, 4, 9, 0.46)),
    ...[11900, 12800, 14500, 16200].flatMap((x) => row('pine', x, 5, 9, 0.44)),
  ],
  2: [...[900, 2500].map((x) => ({ kind: 'windmill', x, scale: 0.36 }))],
};

function row(kind, x, count, gap, scale) {
  const random = seededRandom(x * 7 + count);
  return Array.from({ length: count }, (_, i) => ({
    kind,
    x: x + (i - (count - 1) / 2) * gap * (0.8 + random() * 0.4) * 1.6,
    scale: scale * (0.82 + random() * 0.3),
  }));
}

function buildLayerProps(index) {
  const layer = LAYERS[index];
  return (LAYER_PROPS[index] ?? []).map((prop, i) => {
    const lx = prop.x * layer.p;
    return { ...prop, key: `${index}-${i}`, lx, y: layerSurface(index, lx) + 2 };
  });
}

// Roadside trees on the rider's own plane.
const ROADSIDE = [
  { from: 300, to: 2900, kind: 'poplar', every: 360, scale: [2.1, 2.7] },
  { from: 3000, to: 4300, kind: 'roundTree', every: 300, scale: [2.2, 2.8] },
  { from: 4300, to: 7000, kind: 'roundTree', every: 280, scale: [2, 2.8] },
  { from: 7000, to: 8000, kind: 'cypress', every: 240, scale: [2.2, 2.8] },
  { from: 8000, to: 9150, kind: 'pine', every: 150, scale: [2.2, 3.2] },
  { from: 10050, to: 10800, kind: 'pine', every: 200, scale: [2.2, 3] },
  { from: 10800, to: 12300, kind: 'roundTree', every: 320, scale: [2, 2.6] },
  { from: 12300, to: 13300, kind: 'pine', every: 170, scale: [2.2, 3.2] },
  { from: 15300, to: 16100, kind: 'pine', every: 180, scale: [2.2, 3.1] },
  { from: 16100, to: 16450, kind: 'roundTree', every: 170, scale: [2, 2.6] },
];

const CLEAR_ZONES = [0, ...MARKERS.map((marker) => marker.x), FINISH_X];

function buildRoadside() {
  const random = seededRandom(4242);
  const trees = [];
  for (const zone of ROADSIDE) {
    for (let x = zone.from; x < zone.to; x += zone.every * (0.7 + random() * 0.6)) {
      if (CLEAR_ZONES.some((clear) => Math.abs(clear - x) < 140)) continue;
      const scale = lerp(zone.scale[0], zone.scale[1], random());
      trees.push({ kind: zone.kind, x, y: roadY(x) + 4, scale, key: `tree-${trees.length}` });
    }
  }
  return trees;
}

const KM_TICKS = Array.from({ length: 52 }, (_, i) => {
  const km = (i + 1) * 10;
  const x = xAtKm(km);
  return { km, x, y: roadY(x) };
}).filter((tick) => tick.x < FINISH_X - 40);

const LAMPS = Array.from({ length: 7 }, (_, i) => {
  const x = 16420 + i * 150;
  return { x, y: roadY(x) + 2 };
});

const STARS = (() => {
  const random = seededRandom(99);
  return Array.from({ length: 110 }, (_, i) => ({
    key: i,
    x: random(),
    y: random() ** 1.5,
    r: 0.5 + random() * 1.3,
    alpha: 0.35 + random() * 0.65,
  }));
})();

const CLOUDS = (() => {
  const random = seededRandom(17);
  return Array.from({ length: 26 }, (_, i) => ({
    key: i,
    lx: -400 + i * 140 + random() * 90,
    y: 0.1 + random() * 0.32,
    w: 90 + random() * 160,
    h: 7 + random() * 10,
  }));
})();

export const SCENERY = {
  layers: LAYERS.map((layer, index) => ({ ...layer, tiles: buildLayerTiles(index), props: buildLayerProps(index) })),
  road: buildRoadTiles(),
  roadside: buildRoadside(),
  kmTicks: KM_TICKS,
  lamps: LAMPS,
  stars: STARS,
  clouds: CLOUDS,
};
