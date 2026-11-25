// What the drawings are put together from: the sheet they are drawn on, people with bendy limbs, and things that turn up
// in more than one story. Everything is outlined in the same thick line, and nothing is smaller than a child would draw it.
import { Children, type ReactNode } from 'react';
import { C, INK } from './colors';

/* ---------- the sheet ---------- */

export const Sheet = ({ children }: { children: ReactNode }) => (
  <svg className="advent-drawing__art" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
    {children}
  </svg>
);

interface CrayonProps {
  color: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // How strongly the strokes stand out from the colour below them.
  strength?: number;
}

// An area filled in with a crayon held flat: one colour, with the zigzag of the hand still visible.
export function Crayon({ color, x = 0, y = 0, width = 360, height = 240, strength = 0.22 }: CrayonProps) {
  const step = 13;
  let d = `M${x - 10} ${y + 8}`;
  for (let i = 0; i * step < width + height; i++) {
    // Along the diagonal, with ends that never line up quite.
    const at = i * step;
    const wobble = ((i * 7) % 5) - 2;
    d += i % 2 ? `L${x - 6} ${y + at + wobble}` : `L${x + at + wobble} ${y - 6}`;
  }
  return (
    <>
      <path d={`M${x} ${y}h${width}v${height}h${-width}z`} fill={color} stroke="none" />
      <path d={d} stroke="#fff" strokeOpacity={strength} strokeWidth="6" />
    </>
  );
}

// The ground, from its upper edge down to the bottom of the sheet.
export const Ground = ({ color, edge }: { color: string; edge: string }) => <path d={`${edge}V250H-10z`} fill={color} />;

/* ---------- people ---------- */

export interface LimbProps {
  d: string;
  color: string;
  w?: number;
}

export const Limb = ({ d, color, w = 9 }: LimbProps) => (
  <>
    <path d={d} strokeWidth={w + 5} />
    <path d={d} stroke={color} strokeWidth={w} />
  </>
);

export type Mood = 'happy' | 'laugh' | 'sad' | 'oh' | 'sleep' | 'cross' | 'glad' | 'dizzy' | 'sing';

const MOUTHS: Record<Mood, string> = {
  happy: 'M-6 6q6 6 12 0',
  laugh: 'M-7 5q7 2 14 0-1 9-7 9t-7-9z',
  glad: 'M-7 5q7 2 14 0-1 9-7 9t-7-9z',
  sad: 'M-5 10q5-5 10 0',
  oh: 'M0 5a3.6 4.4 0 1 0 .1 0z',
  sing: 'M0 3a5 6 0 1 0 .1 0z',
  sleep: 'M-3 8q3 2 6 0',
  cross: 'M-5 9q5-4 10 0',
  dizzy: 'M-7 8q2.5-3 4.7 0t4.7 0 4.6 0',
};

// A dizzy eye around 0,0.
export const SPIRAL = 'M0-1q2-2 3 .5t-3.5 2.5-3.5-4.5 6-3 5.5 4';

interface FaceProps {
  mood?: Mood;
  // Which way the face is turned, from -1 to 1.
  look?: number;
}

// Eyes, cheeks and mouth around 0,0, for a head with a radius of 19.
export function Face({ mood = 'happy', look = 0 }: FaceProps) {
  const open = mood === 'laugh' || mood === 'glad' || mood === 'oh' || mood === 'sing';
  return (
    <g transform={`translate(${look * 5} 0)`}>
      <g fill={C.pink} stroke="none" opacity="0.75">
        <ellipse cx="-11" cy="5" rx="4" ry="3" />
        <ellipse cx="11" cy="5" rx="4" ry="3" />
      </g>
      {mood === 'sleep' && <path d="M-10-2q3 3 6 0M4-2q3 3 6 0" strokeWidth="2.4" />}
      {mood === 'glad' && <path d="M-10 0q3-5 6 0M4 0q3-5 6 0" strokeWidth="2.4" />}
      {mood === 'dizzy' && [-7.5, 7.5].map((x) => <path key={x} transform={`translate(${x} 0)`} d={SPIRAL} strokeWidth="1.8" />)}
      {mood === 'cross' && <path d="M-11-8l7 3M11-8l-7 3" strokeWidth="2.6" />}
      {mood !== 'sleep' && mood !== 'glad' && mood !== 'dizzy' && (
        <g fill={INK} stroke="none">
          <ellipse cx="-6.5" cy="-1.5" rx="2.4" ry="3" />
          <ellipse cx="6.5" cy="-1.5" rx="2.4" ry="3" />
        </g>
      )}
      <path d={MOUTHS[mood]} fill={open ? '#9c2b26' : 'none'} strokeWidth="2.4" />
    </g>
  );
}

// A control point and an end point, both seen from the neck.
export type Bend = [cx: number, cy: number, x: number, y: number];

interface PersonProps extends FaceProps {
  // Where the neck is.
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  turn?: number;
  skin?: string;
  // Left out for a bald head.
  hair?: string;
  long?: boolean;
  shirt: string;
  // Of a different colour than the shirt, or bare arms.
  sleeve?: string;
  pants?: string;
  bare?: boolean;
  shoes?: string;
  // Replaces the trousers with a garment down to the feet.
  robe?: boolean;
  arms?: [Bend, Bend];
  legs?: [Bend, Bend];
  // Drawn first, on the torso, and around the centre of the head.
  behind?: ReactNode;
  wear?: ReactNode;
  hat?: ReactNode;
  // Drawn last, in the hands.
  children?: ReactNode;
}

export function Person({
  x,
  y,
  s = 1,
  flip,
  turn = 0,
  skin = C.skin,
  hair,
  long,
  shirt,
  sleeve = shirt,
  pants = C.navy,
  bare,
  shoes = C.bark,
  robe,
  arms = [
    [-24, 14, -24, 30],
    [24, 14, 24, 30],
  ],
  legs = [
    [-8, 48, -9, 60],
    [8, 48, 9, 60],
  ],
  behind,
  wear,
  hat,
  mood,
  look,
  children,
}: PersonProps) {
  const [left, right] = arms;
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${flip ? -s : s} ${s})`}>
      {behind}
      {legs.map(([cx, cy, ex, ey], i) => (
        <g key={i}>
          <Limb d={`M${i ? 7 : -7} 32Q${cx} ${cy} ${ex} ${ey}`} color={bare ? skin : pants} />
          {bare && <Limb d={`M${i ? 7 : -7} 32Q${(cx + (i ? 7 : -7)) / 2} ${(cy + 32) / 2} ${(ex + 2 * cx + (i ? 7 : -7)) / 4} ${(ey + 2 * cy + 32) / 4}`} color={pants} w={11} />}
          <path d={`M${ex - 6} ${ey + 5}q-1-9 6-9 4 0 5 3 7 0 8 6z`} fill={shoes} />
        </g>
      ))}
      <path d={robe ? 'M-11-1Q0-4 11-1 16 4 17 24L22 62Q0 68-22 62L-17 24Q-16 4-11-1z' : 'M-11-1Q0-4 11-1 15 4 15 20L15 36Q0 41-15 36L-15 20Q-15 4-11-1z'} fill={shirt} />
      {wear}
      {long && hair && <path d="M-19-22Q-26 4-18 8L18 8Q26 4 19-22z" fill={hair} />}
      <circle cx="0" cy="-19" r="19" fill={skin} />
      <g transform="translate(0 -19)">
        <Face mood={mood} look={look} />
        {hair && <path d="M-19-1Q-21-21 0-22 21-21 19-1 15-10 6-12-6-6-13-9-18-7-19-1z" fill={hair} />}
        {hat}
      </g>
      {[left, right].map(([cx, cy, ex, ey], i) => (
        <g key={i}>
          <Limb d={`M${i ? 12 : -12} 7Q${cx} ${cy} ${ex} ${ey}`} color={sleeve} w={8} />
          <circle cx={ex} cy={ey} r="5.5" fill={skin} />
        </g>
      ))}
      {children}
    </g>
  );
}

/* ---------- things ---------- */

export const Sun = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={Array.from({ length: 10 }, (_, i) => `M${(Math.cos((i * Math.PI) / 5) * 24).toFixed(1)} ${(Math.sin((i * Math.PI) / 5) * 24).toFixed(1)}L${(Math.cos((i * Math.PI) / 5) * 32).toFixed(1)} ${(Math.sin((i * Math.PI) / 5) * 32).toFixed(1)}`).join('')} stroke={C.gold} strokeWidth="5" />
    <circle r="18" fill={C.yellow} stroke={C.gold} />
  </g>
);

export const Cloud = ({ x, y, s = 1, color = C.white }: { x: number; y: number; s?: number; color?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M-26 10q-12 0-11-10t12-9q3-13 16-12 10 1 13 9 10-4 16 4 12-1 12 9t-12 9z" fill={color} stroke="none" />
);

export const Tree = ({ x, y, s = 1, children }: { x: number; y: number; s?: number; children?: ReactNode }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-7 0q3-30-2-50h18q-4 22 0 50z" fill={C.brown} />
    <path d="M-30-46q-18-2-16-18 2-12 14-13-1-18 16-21 8-12 22-6 14-3 17 10 15 0 16 15 10 10 0 21-6 13-20 11-24 9-49 1z" fill={C.leaf} />
    {children}
  </g>
);

export const Fir = ({ x, y, s = 1, snow }: { x: number; y: number; s?: number; snow?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-5 0v-14h10v14z" fill={C.brown} />
    <path d="M0-92 18-64 10-65 26-40 16-41 34-12Q0-4-34-12L-16-41-26-40-10-65-18-64z" fill="#3f8a55" />
    {snow && <path d="M0-92 18-64q-6 4-9-1-4 7-9 1-5 6-9-1-4 4-9 1z" fill={C.white} />}
  </g>
);

export const Star = ({ x, y, r = 8, color = C.yellow }: { x: number; y: number; r?: number; color?: string }) => (
  <path
    transform={`translate(${x} ${y})`}
    d={`M${Array.from({ length: 10 }, (_, i) => {
      const radius = i % 2 ? r * 0.45 : r;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      return `${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`;
    }).join('L')}z`}
    fill={color}
    strokeWidth="2"
  />
);

// A leather ball. The darker one has a second seam.
export const Ball = ({ x, y, r = 12, color = C.wood }: { x: number; y: number; r?: number; color?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${r / 12})`}>
    <circle r="12" fill={color} />
    <path d="M-11-4Q0 2 11-4M-11 5Q0 9 11 5M0-12Q-4-6-1-1" strokeWidth="2" />
  </g>
);

export const Note = ({ x, y, color = INK }: { x: number; y: number; color?: string }) => (
  <g transform={`translate(${x} ${y})`} stroke={color}>
    <ellipse rx="5" ry="4" fill={color} transform="rotate(-18)" strokeWidth="1" />
    <path d="M4.5-1V-20q6 2 7 8" />
  </g>
);

// Lines that say: this is fast.
export const Whoosh = ({ d }: { d: string }) => <path d={d} strokeWidth="2.6" strokeOpacity="0.55" />;

export const Drops = ({ at }: { at: [number, number][] }) => (
  <g fill={C.water} strokeWidth="2">
    {at.map(([x, y]) => (
      <path key={`${x} ${y}`} d={`M${x} ${y}q5 7 0 9-5-2 0-9z`} />
    ))}
  </g>
);

export const Puff = ({ x, y, s = 1, color = C.white }: { x: number; y: number; s?: number; color?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M-14 9q-12-1-10-11t11-8q4-11 15-8 10 1 11 9 12 1 10 11t-13 7q-12 5-24 0z" fill={color} />
);

// A bicycle standing on the ground at 0,0, under its bottom bracket. Without chain it is a Laufmaschine.
export function Bike({ x, y, s = 1, flip, color, wheel = INK }: { x: number; y: number; s?: number; flip?: boolean; color: string; wheel?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {[-27, 27].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="-17" r="16" stroke={wheel} strokeWidth="4" />
          <path d={`M${cx - 14}-17h28M${cx}-31v28M${cx - 10}-27l20 20M${cx + 10}-27l-20 20`} strokeWidth="1.2" strokeOpacity="0.6" />
        </g>
      ))}
      <path d="M-27-17-12-43H18L27-17M-12-43 0-17H-27M0-17 18-43" stroke={INK} strokeWidth="7" />
      <path d="M-27-17-12-43H18L27-17M-12-43 0-17H-27M0-17 18-43" stroke={color} strokeWidth="3.5" />
      <path d="M-12-43l-2-8M-21-52h14" strokeWidth="4.5" />
      <path d="M18-43l-2-10q9-3 11 5" strokeWidth="3.5" />
    </g>
  );
}

// Several things in a row, so a herd or a crowd needs one line.
export const Each = ({ at, children }: { at: [x: number, y: number, s?: number][]; children: ReactNode }) =>
  at.map(([x, y, s = 1]) => (
    <g key={`${x} ${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
      {Children.toArray(children)}
    </g>
  ));
