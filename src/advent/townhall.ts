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

export type DoorKind = 'window' | 'arched' | 'portal';

export interface Door {
  day: number;
  kind: DoorKind;
  // Centre, top edge and size of the opening.
  x: number;
  y: number;
  width: number;
  height: number;
  // The part of the facade that can be pressed to open it.
  hit: { top: number; bottom: number };
}

interface Floor {
  y: number;
  width: number;
  height: number;
  hit: Door['hit'];
  // Bay and day of each door.
  doors: [bay: number, day: number][];
}

// The numbers hang where they do in Bocholt, as far as the Christmas tree in the photo lets you see them. The others are
// spread over the windows behind it, and the last one is the portal.
const FLOORS: Floor[] = [
  { y: 300, width: 54, height: 68, hit: { top: 284, bottom: 386 }, doors: [[3, 10], [4, 11]] },
  { y: 414, width: 60, height: 76, hit: { top: 386, bottom: 500 }, doors: [[0, 17], [1, 2], [2, 15], [3, 8], [4, 20], [5, 23], [6, 12], [7, 6]] },
  { y: 534, width: 60, height: 88, hit: { top: 500, bottom: 640 }, doors: [[0, 7], [1, 1], [2, 13], [3, 19], [4, 22], [5, 4], [6, 9], [7, 16]] },
  { y: 714, width: 56, height: 84, hit: { top: 664, bottom: 840 }, doors: [[0, 3], [1, 21], [2, 14], [4, 5], [6, 18]] },
];

const ARCHED_DAY = 1;

export const DOORS: Door[] = [
  ...FLOORS.flatMap(({ doors, ...floor }) => doors.map(([bay, day]): Door => ({ ...floor, day, x: bayX(bay), kind: day === ARCHED_DAY ? 'arched' : 'window' }))),
  { day: 24, kind: 'portal' as const, x: bayX(3), y: 742, width: 56, height: 98, hit: { top: 664, bottom: 840 } },
].sort((a, b) => a.day - b.day);

// The digit each leaf carries. As in Bocholt, a single digit hangs in the right one.
export const digitsOf = (day: number): [string, string] => (day < 10 ? ['', String(day)] : [String(day)[0]!, String(day)[1]!]);
