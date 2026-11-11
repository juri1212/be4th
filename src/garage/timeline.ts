// The loading sequence as a function of time, so it can be scrubbed as well as played.

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
// How far `time` is through [from, to], 0 before and 1 after.
export const span = (time: number, from: number, to: number) => clamp01((time - from) / (to - from));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// When each move happens, in seconds.
export const MOVES = {
  rack: [0.5, 2.3],
  tailCup: [1.5, 3.0],
  axleOut: [4.0, 6.2],
  forkUp: [6.8, 7.6],
  wheelRoll: [7.4, 8.8],
  wheelStow: [8.7, 10.6],
  lift: [11.2, 16.2],
  axleIn: [16.9, 18.9],
  lever: [18.7, 19.3],
  strap: [20.0, 21.2],
} as const satisfies Record<string, readonly [number, number]>;

export const DURATION = 25;

export interface Step {
  title: string;
  text: string;
  // The step is current from here until the next one starts.
  from: number;
}

export const STEPS: Step[] = [
  { from: 0, title: 'Rack on the roof', text: 'A board on four vacuum cups, and a fifth cup on the rear window. Pump each one until its orange band is gone.' },
  { from: 3.4, title: 'Thru-axle out', text: 'Undo the front axle and pull it clear of the hub. Keep hold of it: it is needed again in a minute.' },
  { from: 6.6, title: 'Front wheel off', text: 'Lift the fork off the wheel and roll the wheel away. It travels inside the car.' },
  { from: 10.8, title: 'Bike onto the roof', text: 'Up and over, fork above the mount, rear wheel towards the tail.' },
  { from: 16.5, title: 'Axle through the mount', text: 'The same axle goes through the fork and the mount. Tighten it, then close the lever.' },
  { from: 19.6, title: 'Rear wheel strapped', text: 'The tyre sits in the cradle on the fifth cup. One strap around the rim holds it there.' },
];

export const stepAt = (time: number) => Math.max(0, STEPS.findLastIndex((step) => time >= step.from));
