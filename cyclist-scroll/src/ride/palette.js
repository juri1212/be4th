import { smoothstep } from './math';

// Time of day drifts from dawn in the lowlands to blue hour at the finish.
const KEYFRAMES = [
  { t: 0.0, skyTop: '#1b2440', skyMid: '#5f6f93', haze: '#f0c4a0', ink: '#10151f', sun: '#ffd8a6' },
  { t: 0.18, skyTop: '#2c5786', skyMid: '#89a9c6', haze: '#e6dccd', ink: '#141f2a', sun: '#fff1d6' },
  { t: 0.36, skyTop: '#29679f', skyMid: '#8fbcdb', haze: '#d9e6e8', ink: '#13222c', sun: '#ffffff' },
  { t: 0.55, skyTop: '#2e5d8f', skyMid: '#a1bfd3', haze: '#efdfc6', ink: '#1a1f24', sun: '#fff3da' },
  { t: 0.76, skyTop: '#32406e', skyMid: '#b2898b', haze: '#f6bc8a', ink: '#191622', sun: '#ffd08a' },
  { t: 0.9, skyTop: '#1c2047', skyMid: '#7a4e73', haze: '#ee875c', ink: '#13101b', sun: '#ff9a5c' },
  { t: 1.0, skyTop: '#070b1d', skyMid: '#232852', haze: '#7a5579', ink: '#09091a', sun: '#ff8a5c' },
];

// Juri's kit and his pink gravel bike, picked from a race photo. Scene
// shades these toward the landscape ink as the light fades.
export const RIDER_KIT = {
  frame: [240, 204, 200],
  parts: [28, 28, 32],
  tire: [46, 44, 42],
  sidewall: [128, 122, 112],
  rim: [24, 24, 28],
  bottle: [238, 238, 234],
  helmet: [246, 246, 244],
  vent: [34, 34, 38],
  lens: [240, 120, 200],
  lensDeep: [150, 70, 210],
  hair: [212, 178, 124],
  mouth: [96, 30, 36],
  teeth: [250, 248, 244],
  skin: [234, 190, 160],
  jersey: [52, 50, 52],
  lettering: [236, 236, 232],
  panel: [26, 92, 76],
  panelCuff: [70, 150, 120],
  cuff: [190, 36, 52],
  bib: [20, 20, 24],
  glove: [196, 44, 66],
  sock: [246, 246, 246],
  shoe: [240, 240, 238],
};

const parse = (hex) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));

const FRAMES = KEYFRAMES.map(({ t, ...colors }) => ({
  t,
  colors: Object.fromEntries(Object.entries(colors).map(([key, value]) => [key, parse(value)])),
}));

export const mixRgb = (a, b, t) => a.map((value, index) => value + (b[index] - value) * t);

export function rgb(color, alpha) {
  const channels = color.map((value) => Math.round(value)).join(' ');
  return alpha === undefined ? `rgb(${channels})` : `rgb(${channels} / ${alpha})`;
}

export function paletteAt(t) {
  let index = 0;
  while (index < FRAMES.length - 2 && t > FRAMES[index + 1].t) index++;
  const from = FRAMES[index];
  const to = FRAMES[index + 1];
  const local = smoothstep(from.t, to.t, t);
  return Object.fromEntries(
    Object.keys(from.colors).map((key) => [key, mixRgb(from.colors[key], to.colors[key], local)]),
  );
}
