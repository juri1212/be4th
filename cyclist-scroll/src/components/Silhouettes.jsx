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
