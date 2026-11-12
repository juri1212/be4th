// The loading sequence as a function of time, so it can be scrubbed as well as played.

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
// How far `time` is through [from, to], 0 before and 1 after.
export const span = (time: number, from: number, to: number) => clamp01((time - from) / (to - from));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
// Slows at a steady rate, the way something braking does.
export const easeOutQuad = (t: number) => 1 - (1 - t) ** 2;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// When each move happens, in seconds.
export const MOVES = {
  // Putting the bike together. It is drawn by code, so this can play while the car is still being downloaded.
  fork: [0.4, 1.3],
  cockpit: [0.9, 1.8],
  seat: [1.3, 2.2],
  cranks: [1.8, 2.7],
  rearWheel: [2.3, 3.2],
  gears: [3.0, 3.8],
  frontWheel: [3.4, 4.3],
  axleFit: [4.1, 4.9],
  // The car rolls in, and the bike goes onto it.
  arrive: [5.0, 8.0],
  rack: [8.4, 10.3],
  tailCup: [9.4, 11.0],
  axleOut: [12.0, 14.2],
  forkUp: [14.8, 15.6],
  wheelRoll: [15.4, 16.8],
  wheelStow: [16.7, 18.6],
  lift: [19.2, 24.2],
  axleIn: [24.9, 26.9],
  lever: [26.7, 27.3],
  strap: [28.0, 29.2],
} as const satisfies Record<string, readonly [number, number]>;

// From here on the sequence needs the car. If it hasn't arrived by then, the sequence waits at this point.
export const CAR_DUE = MOVES.arrive[0];

export const DURATION = 33;

export interface Step {
  title: string;
  text: string;
  // The step is current from here until the next one starts.
  from: number;
}

export const STEPS: Step[] = [
  { from: 0, title: 'Bike together', text: 'Fork, bar and saddle onto the frame, then cranks, chain and both wheels. The car rolls in once it is done.' },
  { from: 8.0, title: 'Rack on the roof', text: 'A board on four vacuum cups, and a fifth cup on the rear window. Pump each one until its orange band is gone.' },
  { from: 11.4, title: 'Thru-axle out', text: 'Undo the front axle and pull it clear of the hub. Keep hold of it: it is needed again in a minute.' },
  { from: 14.6, title: 'Front wheel off', text: 'Lift the fork off the wheel and roll the wheel away. It travels inside the car.' },
  { from: 18.8, title: 'Bike onto the roof', text: 'Up and over, fork above the mount, rear wheel towards the tail.' },
  { from: 24.5, title: 'Axle through the mount', text: 'The same axle goes through the fork and the mount. Tighten it, then close the lever.' },
  { from: 27.6, title: 'Rear wheel strapped', text: 'The tyre sits in the cradle on the fifth cup. One strap around the rim holds it there.' },
];

export const stepAt = (time: number) => Math.max(0, STEPS.findLastIndex((step) => time >= step.from));
