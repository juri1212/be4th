export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const lerp = (a, b, t) => a + (b - a) * t;

export function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

// Smooth 1D value noise in the range 0..1.
export function valueNoise(x, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 101.3), hash(i + 1 + seed * 101.3), u);
}

export function fbm(x, seed = 0, octaves = 4) {
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  let norm = 0;
  for (let octave = 0; octave < octaves; octave++) {
    sum += amplitude * valueNoise(x * frequency, seed + octave * 17);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return sum / norm;
}

// Sharp-crested noise for alpine ridgelines.
export function ridgedNoise(x, seed = 0, octaves = 5) {
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  let norm = 0;
  for (let octave = 0; octave < octaves; octave++) {
    const n = 1 - Math.abs(valueNoise(x * frequency, seed + octave * 13) * 2 - 1);
    sum += amplitude * n * n;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return sum / norm;
}

export function seededRandom(seed) {
  let state = Math.max(1, Math.floor(seed)) % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}
