// Flat silhouettes drawn around a base point at (0, 0), growing upwards.
// They inherit `fill` from their parent; `currentColor` is used for line work.

function Windows({ rects, light, glow }) {
  if (!glow) return null;
  return rects.map(([x, y, w, h]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={light} opacity={glow} />);
}

function Windmill({ spin = 0 }) {
  return (
    <>
      <path d="M-15 0L-10 -62H10L15 0Z" />
      <path d="M-23 -27H23V-23H-23Z" />
      <path d="M-12 -61Q0 -79 12 -61Z" />
      <g transform="translate(0 -68)">
        <g transform={`rotate(${spin})`}>
          {[0, 90, 180, 270].map((angle) => (
            <g key={angle} transform={`rotate(${angle + 20})`}>
              <path d="M-1.4 4H1.4V-56H-1.4Z" />
              <path d="M2.4 -11H12.5V-55H2.4Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2.4 -22H12.5M2.4 -33H12.5M2.4 -44H12.5M7.4 -11V-55" stroke="currentColor" strokeWidth="0.8" />
            </g>
          ))}
          <circle r="3.6" />
        </g>
      </g>
    </>
  );
}

function Poplar() {
  return (
    <>
      <path d="M-1.4 0V-12H1.4V0Z" />
      <path d="M0 -80C7 -66 8 -36 5 -15C3 -9 -3 -9 -5 -15C-8 -36 -7 -66 0 -80Z" />
    </>
  );
}

function RoundTree() {
  return (
    <>
      <path d="M-2 0V-18H2V0Z" />
      <circle cx="0" cy="-32" r="15" />
      <circle cx="-11" cy="-24" r="11" />
      <circle cx="12" cy="-25" r="11.5" />
      <circle cx="3" cy="-43" r="10" />
    </>
  );
}

function Pine() {
  return <path d="M0 -86L-8 -66H-4L-13 -48H-7L-17 -28H-8L-21 -9H-2V0H2V-9H21L8 -28H17L7 -48H13L4 -66H8Z" />;
}

function Cypress() {
  return <path d="M0 -88C5 -72 9 -46 6 -13L2 0H-2L-6 -13C-9 -46 -5 -72 0 -88Z" />;
}

function Olive() {
  return (
    <>
      <path d="M-2.5 0C-1 -8 -4 -12 -1 -19H2C4 -12 1 -8 3 0Z" />
      <ellipse cx="0" cy="-25" rx="20" ry="9" />
      <ellipse cx="-9" cy="-30" rx="11" ry="7.5" />
      <ellipse cx="10" cy="-30" rx="12" ry="8" />
    </>
  );
}

function DutchHouse({ light, glow }) {
  return (
    <>
      <path d="M-14 0V-26H-11V-31H-7V-36H-3V-41H3V-36H7V-31H11V-26H14V0Z" />
      <Windows rects={[[-8, -20, 4, 6], [4, -20, 4, 6]]} light={light} glow={glow} />
    </>
  );
}

function Farmhouse({ light, glow }) {
  return (
    <>
      <path d="M-34 0V-17L-4 -40L26 -17V0Z" />
      <path d="M8 -38H13V-26H8Z" />
      <Windows rects={[[-24, -11, 5, 6], [-12, -11, 5, 6], [8, -11, 5, 6]]} light={light} glow={glow} />
    </>
  );
}

function Church({ light, glow }) {
  return (
    <>
      <path d="M-28 0V-24L-13 -37L2 -24V0Z" />
      <path d="M1 0V-52H17V0Z" />
      <path d="M0 -51L9 -100L18 -51Z" />
      <path d="M9 -100V-110M5.5 -106H12.5" stroke="currentColor" strokeWidth="1.4" />
      <Windows rects={[[-20, -17, 3.5, 8], [-10, -17, 3.5, 8], [7, -38, 4, 7]]} light={light} glow={glow} />
    </>
  );
}

const BUILDINGS = [
  [24, 58], [18, 84], [26, 46], [20, 70], [28, 54], [16, 96], [22, 64], [26, 40],
];

function Building({ variant = 0, light, glow }) {
  const [width, height] = BUILDINGS[variant % BUILDINGS.length];
  return (
    <>
      <path d={`M${-width / 2} 0V${-height}H${width / 2}V0Z`} />
      <Windows
        rects={Array.from({ length: Math.floor(height / 16) }, (_, i) => [-width / 2 + 4, -height + 8 + i * 16, width - 8, 3])}
        light={light}
        glow={glow}
      />
    </>
  );
}

// Stuttgart's Fernsehturm on the Hoher Bopser.
function TvTower() {
  return (
    <>
      <path d="M-8 0L-3.6 -196H3.6L8 0Z" />
      <path d="M-10 -196H10V-201H-10Z" />
      <path d="M-12.5 -202H12.5L11 -222H-11Z" />
      <path d="M-8.5 -223H8.5V-229H-8.5Z" />
      <path d="M-1.8 -229H1.8V-312H-1.8Z" />
      <path d="M-3.4 -262H3.4V-258H-3.4Z" />
    </>
  );
}

function Chalet({ light, glow }) {
  return (
    <>
      <path d="M-26 0V-20H-31L0 -42L31 -20H26V0Z" />
      <path d="M-24 -14H24" stroke="currentColor" strokeWidth="1.5" />
      <Windows rects={[[-16, -10, 6, 6], [-3, -10, 6, 6], [10, -10, 6, 6], [-3, -30, 6, 6]]} light={light} glow={glow} />
    </>
  );
}

// The weather station and mast on the summit of Mont Ventoux.
export function Observatory() {
  return (
    <>
      <path d="M-48 0V-24H-14V-38H16V-24H40V0Z" />
      <path d="M26 -24A10 10 0 0 1 46 -24Z" />
      <path d="M-10 -38V-122H10V-38Z" />
      <path d="M-14 -121V-139H14V-121Z" />
      <path d="M-2 -139V-214H2V-139Z" />
      <path d="M-8 -164H8M-6 -186H6" stroke="currentColor" strokeWidth="2.2" />
    </>
  );
}

const n1 = (value) => Math.round(value * 10) / 10;

const PROFILE_911 = 'M2.5 -3.6C1 -5 0.2 -8 0.3 -10.5C0.4 -12.6 1 -14 2.4 -15C10 -18.5 20 -24.5 32 -27.4C38 -28.6 44 -28.9 49 -28.6C53 -28.3 56 -27.6 58.6 -26.2C62.5 -24 65.8 -21 69 -19.4C75 -18.5 81 -18 85 -17.6C87 -18.6 90 -18.8 92 -17.6C95.6 -15.6 98.6 -12.6 99.6 -9.2C100.2 -6.8 99.8 -4.8 98 -3.6H85.6A8.6 8.6 0 1 0 70.4 -3.6H31.6A8.6 8.6 0 1 0 16.4 -3.6Z';

function Wheel({ cx, cy, colors, rimOpacity = 1 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="7.4" fill={colors.dark} />
      <circle cx={cx} cy={cy} r="4.4" fill={colors.rim} opacity={rimOpacity} />
      <circle cx={cx} cy={cy} r="1.3" fill={colors.dark} />
    </>
  );
}

// A 911 in side view, facing right, its belly centred on the origin. Seen from
// below, the floor and the far wheels show beneath the sill.
function Porsche911Side({ colors }) {
  return (
    <g transform="translate(-51 0)">
      {[22, 76].map((cx) => <Wheel key={cx} cx={cx} cy={2.5} colors={colors} rimOpacity={0.55} />)}
      <path d="M3 -4C2 0 4 5 8 6.5H94C97.5 5 99 0 98 -4Z" fill={colors.under} />
      <path d="M14 -2H88V3.6H14Z" fill={colors.dark} opacity="0.85" />
      <path d={PROFILE_911} fill={colors.body} />
      <path d="M63.2 -20.6C60.6 -22.8 58.4 -24.6 56.2 -25.8C52 -27.1 47 -27.4 42.5 -27C35 -26.3 29 -23.8 23 -21C36 -20.8 50 -20.7 63.2 -20.6Z" fill={colors.dark} />
      <path d="M45 -20.6L43.6 -27.1" stroke={colors.body} strokeWidth="1.6" />
      <path d="M1 -13.4L2.6 -15.2L5 -15.6L4 -13Z" fill={colors.tail} />
      <ellipse cx="90" cy="-16.8" rx="2.6" ry="1.3" transform="rotate(-20 90 -16.8)" fill={colors.head} />
      <path d="M96.5 -8.5H99.1V-6.9H96.5Z" fill={colors.indicator} />
      {[24, 78].map((cx) => <Wheel key={cx} cx={cx} cy={-7.6} colors={colors} />)}
    </g>
  );
}

// A 911 seen from above, nose up: windscreen, roof, rear window, engine grille.
function Porsche911Top({ colors }) {
  return (
    <>
      <path d="M-15 -41C-8 -42.6 8 -42.6 15 -41C20 -40 22 -36 22 -30L21 -12C21 -4 23.5 4 23.5 14C23.5 28 22 36 18 40C10 42.2 -10 42.2 -18 40C-22 36 -23.5 28 -23.5 14C-23.5 4 -21 -4 -21 -12L-22 -30C-22 -36 -20 -40 -15 -41Z" fill={colors.body} />
      <path d="M-22 -21L-25.4 -19.8V-16.8L-22.2 -17.2Z M22 -21L25.4 -19.8V-16.8L22.2 -17.2Z" fill={colors.body} />
      <path d="M-15.5 -30C-6 -31.6 6 -31.6 15.5 -30L18 -22C6 -23.4 -6 -23.4 -18 -22Z" fill={colors.dark} />
      <path d="M-18 -22L-17.6 2H-15.8L-16 -21.2Z M18 -22L17.6 2H15.8L16 -21.2Z" fill={colors.dark} />
      <path d="M-12.5 3H12.5L11 17H-11Z" fill={colors.dark} />
      <path d="M-10 21.5H10V25.5H-10Z" fill={colors.dark} />
      <path d="M-21.5 32.5L-15 35.5V37.5L-20.5 35.5Z M21.5 32.5L15 35.5V37.5L20.5 35.5Z" fill={colors.tail} />
      <path d="M-19 -38.5L-13 -40V-37.5L-18.5 -36Z M19 -38.5L13 -40V-37.5L18.5 -36Z" fill={colors.head} />
    </>
  );
}

// Gerry Judah's "Inspiration 911" on the Porscheplatz roundabout in Zuffenhausen,
// traced from a photo: x runs from the middle of the lawn, y up from it. Flat white
// planks cross in an X; the wide ones twist as they climb, so their shaded edge
// grows towards the car, and they narrow into a neck that hides under the body.
const INSPIRATION_BLADES = [
  { foot: [-115, 0], top: [-4, -523], widths: [15, 24, 24], edge: -1, twist: 0.4 },
  { foot: [30, 0], top: [25, -523], widths: [20, 24, 24], edge: 1, twist: 0.35 },
  { foot: [-23, 0], top: [126, -508], widths: [46, 54, 30], edge: 1, twist: 0.4 },
  { foot: [83, 0], top: [-90, -528], widths: [34, 60, 32], edge: -1, twist: 0.45 },
];
const BLADE_SHOULDER = 0.84;

// The side cars sit nose-up with their roofs turned inwards; the middle one faces the street.
const INSPIRATION_CARS = [
  { at: [-98, -549], angle: -111.7, mirror: true },
  { at: [122, -525], angle: -74 },
];
const INSPIRATION_CAR_SCALE = 1.3;

function bladePaths({ foot, top, widths, edge, twist }) {
  const dx = top[0] - foot[0];
  const dy = top[1] - foot[1];
  const length = Math.hypot(dx, dy);
  const nx = -dy / length;
  const ny = dx / length;
  const stations = [0, BLADE_SHOULDER, 1];
  const at = (t, side) => `${n1(foot[0] + dx * t + nx * side)} ${n1(foot[1] + dy * t + ny * side)}`;
  const outline = (sides) => `M${stations.map((t, i) => at(t, sides[i])).join('L')}`;
  const back = (sides) => `L${stations.map((t, i) => at(t, sides[i])).reverse().join('L')}Z`;
  const half = widths.map((width) => width / 2);
  const shade = [0.15, twist, twist];
  return {
    face: outline(half) + back(half.map((value) => -value)),
    edge: outline(half.map((value) => edge * value)) + back(half.map((value, i) => edge * (value - widths[i] * shade[i]))),
  };
}

const BLADE_PATHS = INSPIRATION_BLADES.map(bladePaths);

export function Inspiration911({ colors }) {
  return (
    <>
      {BLADE_PATHS.map((paths, i) => (
        <g key={INSPIRATION_BLADES[i].foot[0]}>
          <path d={paths.face} fill={colors.body} />
          <path d={paths.edge} fill={colors.edge} />
        </g>
      ))}
      {INSPIRATION_CARS.map(({ at, angle, mirror }) => (
        <g
          key={at[0]}
          transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(${INSPIRATION_CAR_SCALE} ${mirror ? -INSPIRATION_CAR_SCALE : INSPIRATION_CAR_SCALE}) translate(0 14)`}
        >
          <Porsche911Side colors={colors} />
        </g>
      ))}
      <g transform="translate(17 -572)">
        <Porsche911Top colors={colors} />
      </g>
    </>
  );
}

export function Gantry({ label, textColor, accent }) {
  const squares = Array.from({ length: 19 }, (_, i) => i);
  return (
    <>
      <path d="M-74 0V-156H-68V0Z" />
      <path d="M68 0V-156H74V0Z" />
      <path d="M-82 -164H82V-128H-82Z" />
      {squares.map((i) => (
        <rect key={i} x={-82 + i * (164 / 19)} y={i % 2 ? -128 : -124} width={164 / 19} height="4" fill={textColor} opacity="0.9" />
      ))}
      <text x="0" y="-140" textAnchor="middle" className="scene-gantry" fill={textColor}>
        {label}
      </text>
      <path d="M-82 -164H82" stroke={accent} strokeWidth="3" />
    </>
  );
}

export function Lamp({ glow, light }) {
  return (
    <>
      <path d="M-1.6 0V-112H1.6V0Z" />
      <path d="M0 -110Q0 -122 12 -122H22" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="M15 -125H31L28 -119H18Z" />
      {glow > 0 && (
        <>
          <circle cx="23" cy="-116" r="64" fill="url(#lampGlow)" opacity={glow} />
          <rect x="18" y="-120" width="10" height="2" fill={light} opacity={glow} />
        </>
      )}
    </>
  );
}

const SHAPES = {
  windmill: Windmill,
  poplar: Poplar,
  roundTree: RoundTree,
  pine: Pine,
  cypress: Cypress,
  olive: Olive,
  dutchHouse: DutchHouse,
  farmhouse: Farmhouse,
  church: Church,
  building: Building,
  tvTower: TvTower,
  chalet: Chalet,
};

export function Prop({ kind, x, y, scale = 1, ...rest }) {
  const Shape = SHAPES[kind];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Shape {...rest} />
    </g>
  );
}
