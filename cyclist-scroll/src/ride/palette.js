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
