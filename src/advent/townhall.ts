// Plan of Bocholt's historic town hall as the calendar draws it, in units of the photo it was measured from:
// eight bays over an arcade, with a gable on the middle two.

export const VIEW = { x: 100, y: 0, width: 928, height: 880 } as const;
export const CENTER_X = 564;
export const GROUND_Y = 840;

const BAY = 104;
export const bayX = (bay: number) => 200 + BAY * bay;
export const BAYS = Array.from({ length: 8 }, (_, bay) => bayX(bay));
// The half columns between the bays, and the ones that close the facade on either side.
export const COLUMNS = Array.from({ length: 9 }, (_, index) => 148 + BAY * index);

export type DoorKind = 'window' | 'arched';

export interface Door {
  day: number;
  kind: DoorKind;
  // Centre, top edge and size of the opening.
  x: number;
  y: number;
  width: number;
  height: number;
  // The part of the facade that can be pressed to open it.
  hit: { left: number; right: number; top: number; bottom: number };
}

interface Floor {
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  // Bay and day of each door.
  doors: [bay: number, day: number][];
}

// The numbers hang where they do in Bocholt. The Christmas tree in the photo hides 9 and 18, which are in windows behind it.
const FLOORS: Floor[] = [
  { y: 300, width: 54, height: 68, top: 284, bottom: 386, doors: [[3, 11], [4, 10]] },
  { y: 414, width: 60, height: 76, top: 386, bottom: 500, doors: [[0, 17], [1, 8], [2, 14], [3, 3], [4, 20], [5, 23], [6, 12], [7, 6]] },
  { y: 534, width: 60, height: 88, top: 500, bottom: 640, doors: [[0, 7], [2, 19], [3, 15], [4, 22], [5, 4], [6, 9], [7, 16]] },
  { y: 714, width: 56, height: 84, top: 664, bottom: 840, doors: [[0, 2], [1, 21], [2, 13], [4, 5], [6, 18]] },
];

// The first and the last number share a bay, in a pair of arched windows.
const PAIR_X = bayX(1);
const arched = (day: number, side: -1 | 1): Door => ({
  day,
  kind: 'arched',
  x: PAIR_X + side * 21,
  y: 534,
  width: 36,
  height: 88,
  hit: { left: Math.min(PAIR_X, PAIR_X + (side * BAY) / 2), right: Math.max(PAIR_X, PAIR_X + (side * BAY) / 2), top: 500, bottom: 640 },
});

// Its number has a cake on it.
export const BIRTHDAY = 2;

export const DOORS: Door[] = [
  ...FLOORS.flatMap(({ doors, top, bottom, ...opening }) =>
    doors.map(([bay, day]): Door => ({ ...opening, day, kind: 'window', x: bayX(bay), hit: { left: bayX(bay) - BAY / 2, right: bayX(bay) + BAY / 2, top, bottom } })),
  ),
  arched(1, -1),
  arched(24, 1),
].sort((a, b) => a.day - b.day);

// The digit each leaf carries. As in Bocholt, a single digit hangs in the right one, except for the 1.
export function digitsOf(day: number): [string, string] {
  if (day === 1) return ['1', ''];
  return day < 10 ? ['', String(day)] : [String(day)[0]!, String(day)[1]!];
}
