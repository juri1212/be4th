import { C, INK } from './colors';
import { Cloud, Crayon, Each, Fir, Ground, Limb, Note, Person, Sheet, Star, Sun, Tree, Whoosh, type Bend } from './kit';

const Cloak = ({ color }: { color: string }) => <path d="M-10 2Q-46-40-34-70-18-84 0-76 18-84 34-70 46-40 10 2z" fill={color} />;

const RAISED: [Bend, Bend] = [
  [-32, 4, -30, -24],
  [32, 4, 30, -24],
];

const SPRAWLED: [Bend, Bend] = [
  [-16, 46, -26, 52],
  [16, 46, 24, 56],
];

export const FallingLords = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Cloud x={306} y={40} />
    <Cloud x={196} y={26} s={0.6} />
    <Ground color={C.grass} edge="M-10 212Q100 198 200 208T370 204" />
    <path d="M-10 230V36h16V20h18v16h16V20h18v16h16V20h18v16h18v194z" fill={C.stone} />
    <path d="M6 206h22M60 214h24M8 178h16M70 186h22M86 60h14M4 66h16M74 160h18" strokeOpacity="0.35" strokeWidth="4" />
    <path d="M22 146V98q0-26 30-26t30 26v48z" fill={C.yellow} />
    <path d="M52 72v74M22 112h60" strokeWidth="4" />
    <path d="M82 92q34-8 36 6v54q-8-8-36-6z" fill={C.sky} />
    <path d="M82 118q22-2 36 4" />
    <path d="M14 148h76" strokeWidth="8" />
    <Person x={52} y={117} s={0.8} shirt={C.red} hair={INK} mood="oh" look={0.6} arms={[[-20, 16, -20, 20], [24, 14, 28, 20]]} legs={[[-7, 28, -7, 28], [7, 28, 7, 28]]} />
    <path d="M14 150h76" strokeWidth="5" />
    <Person
      x={156}
      y={94}
      s={0.8}
      turn={14}
      shirt={C.purple}
      pants={C.yellow}
      hair={C.bark}
      mood="oh"
      arms={RAISED}
      legs={SPRAWLED}
      behind={<Cloak color={C.purple} />}
    />
    <Person
      x={232}
      y={142}
      s={0.86}
      turn={-10}
      shirt={C.teal}
      pants={C.navy}
      hair={C.orange}
      mood="laugh"
      arms={RAISED}
      legs={SPRAWLED}
      behind={<Cloak color={C.teal} />}
    />
    <Person
      x={310}
      y={142}
      s={1.02}
      shirt={C.red}
      pants={C.navy}
      hair={C.tan}
      mood="glad"
      arms={RAISED}
      behind={<path d="M-12 2Q-28 40-24 62L24 62Q28 40 12 2z" fill={C.red} />}
      hat={<path d="M-14-18l3-12 7 8 5-10 5 10 7-8 2 12z" fill={C.gold} strokeWidth="2.4" />}
    />
    <Whoosh d="M126 40v-18M190 46v-16M212 62v-18M268 70V50" />
  </Sheet>
);

const Medal = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-9-22 0-6 9-22" stroke={C.red} strokeWidth="5" />
    <circle r="10" fill={color} />
    <Star x={0} y={0} r={6} color={C.white} />
  </g>
);

export const ArtOlympics = () => (
  <Sheet>
    <Crayon color="#ffe6bf" />
    <path d="M30 20q150 34 300 0" strokeWidth="2.4" />
    <path d="M52 25l24 5-16 22zM108 34l24 3-14 22zM220 37l24-3-10 24zM276 30l24-5-8 26z" fill={C.red} />
    <path d="M108 34l24 3-14 22zM220 37l24-3-10 24z" fill={C.teal} />
    <Ground color={C.grass} edge="M-10 222H370" />
    <path d="M24 188h102v44H24z" fill={C.grey} />
    <path d="M234 198h102v34H234z" fill={C.tan} />
    <path d="M122 166h116v66H122z" fill={C.gold} />
    <path d="M174 184l8-5v36M172 215h20M64 200q10-8 18 0 4 6-18 22h22M276 206q16-4 16 4-2 6-10 5 12 0 12 6-4 8-20 4" strokeWidth="5" stroke={C.white} />
    <Person
      x={74}
      y={116}
      s={1.06}
      shirt={C.blue}
      pants={C.bark}
      hair={C.bark}
      mood="happy"
      look={0.4}
      arms={[
        [-28, 18, -30, 12],
        [28, 12, 30, -10],
      ]}
      hat={<path d="M-24-8Q-22-26 4-26 30-22 24-10 0-18-24-8zM2-26l2-7" fill={C.red} />}
    >
      <path d="M-52 8q4-18 24-16 18 4 14 18-4 12-18 12-6 0-6-6-12 4-14-8z" fill={C.wood} />
      <path d="M-42 4h0" stroke={C.red} strokeWidth="7" />
      <path d="M-32 0h0" stroke={C.yellow} strokeWidth="7" />
      <path d="M-24 6h0" stroke={C.blue} strokeWidth="7" />
      <path d="M26-4 42-32" strokeWidth="4" />
      <path d="M40-30q-2-10 8-14 4 8-2 16z" fill={C.teal} strokeWidth="2.4" />
    </Person>
    <Person
      x={286}
      y={128}
      s={1.04}
      skin={C.tan}
      shirt={C.purple}
      pants={C.navy}
      hair={INK}
      mood="sing"
      look={-0.3}
      arms={[
        [-30, 16, -28, 0],
        [26, 20, 2, 22],
      ]}
    >
      <g transform="translate(-14 14) rotate(-24)">
        <path d="M-10 0h-22" strokeWidth="5" />
        <path d="M-10-7q8-5 12 1 6-6 13 0 6 6 0 12-7 6-13 1-5 6-12 0-5-7 0-14z" fill={C.brown} />
      </g>
      <path d="M-30 34 14 4" strokeWidth="3.5" />
    </Person>
    <Person
      x={180}
      y={92}
      s={1.12}
      shirt={INK}
      pants={C.slate}
      mood="glad"
      hair={C.grey}
      arms={[
        [-30, 18, -9, 22],
        [34, 2, 36, -20],
      ]}
      wear={<path d="M-7-2 0 14 7-2z" fill={C.white} />}
      hat={<path d="M0 3q-6-3-11 1-5 2-8-2 2 8 10 8 6 0 9-4 3 4 9 4 8 0 10-8-3 4-8 2-5-4-11-1z" fill={C.grey} strokeWidth="2.2" />}
    >
      <Medal x={0} y={26} color={C.yellow} />
      <path d="M26-44q10-8 22 0l4 34q-12-6-22 0z" fill={C.paper} />
      <path d="M33-36l12-1M34-28l13-1M36-20l11-1" strokeWidth="2" />
    </Person>
    <Note x={332} y={78} color={C.purple} />
    <Note x={252} y={76} color={C.red} />
  </Sheet>
);

const HELMET = (
  <>
    <path d="M-20-6Q-20-26 0-26T20-6Q0-12-20-6z" fill={C.navy} />
    <path d="M-23-5Q0-14 23-5" strokeWidth="4.5" />
    <path d="M0-26v-9" stroke={C.red} strokeWidth="6" />
  </>
);

export const OneMoreSoldier = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Sun x={322} y={36} />
    <path d="M-10 160 60 40l48 74 44-60 54 76 46-50 58 62 60-40v110H-10z" fill="#9fb3c8" />
    <path d="M60 40l22 34-12-4-10 12-12-10-10 4zM152 54l20 28-10-2-10 10-8-8-8 4zM252 80l20 22-10-2-10 8-8-6-8 2z" fill={C.white} />
    <Ground color={C.grass} edge="M-10 172Q100 150 200 164T370 156" />
    <Fir x={28} y={176} s={0.62} />
    <Fir x={342} y={166} s={0.56} />
    <path d="M-10 214Q160 196 370 208" stroke={C.sand} strokeWidth="26" />
    {[290, 228, 166].map((x, i) => (
      <Person
        key={x}
        x={x}
        y={128 + (i % 2) * 3}
        s={0.98}
        shirt={C.blue}
        pants={C.navy}
        mood={i === 1 ? 'laugh' : 'happy'}
        look={i === 2 ? -0.6 : 0.5}
        hair={[C.bark, C.orange, C.yellow][i]}
        hat={HELMET}
        arms={[
          [-26, 18, -20, 30],
          i === 2 ? [-20, 30, -36, 16] : [28, 18, 22, 30],
        ]}
        legs={[
          [-10, 46, -18, 54],
          [16, 44, 16, 58],
        ]}
        wear={<path d="M0 8h0M0 18h0M0 28h0" stroke={C.yellow} strokeWidth="5" />}
      />
    ))}
    <path d="M308 162V62" strokeWidth="5" />
    <path d="M308 62q18-8 32 0t32 0v16H308z" fill={C.blue} />
    <path d="M308 78q18-8 32 0t32 0v16H308z" fill={C.red} />
    <Person
      x={92}
      y={130}
      s={1.04}
      shirt={C.red}
      pants={C.leaf}
      shoes={C.brown}
      hair={C.bark}
      mood="glad"
      look={0.4}
      hat={
        <>
          <path d="M-18-10Q-16-32 0-32T18-10z" fill={C.leaf} />
          <path d="M-27-8Q0-18 27-8 0-2-27-8z" fill={C.leaf} />
          <path d="M14-18q4-16 12-18 2 12-6 20z" fill={C.white} strokeWidth="2.2" />
          <path d="M-11 8q5-6 11-1 6-5 11 1-5 3-11 1-6 2-11-1z" fill={C.bark} strokeWidth="1.6" />
        </>
      }
      arms={[
        [-34, 4, -32, -24],
        [26, 20, 33, 18],
      ]}
      legs={[
        [-12, 46, -20, 54],
        [16, 44, 16, 58],
      ]}
    >
      <path d="M-7-1v36M7-1v36" stroke={C.yellow} strokeWidth="4" />
    </Person>
  </Sheet>
);

const Skater = ({ x, y, turn, color, hair, skin, s = 0.86 }: { x: number; y: number; turn: number; color: string; hair: string; skin?: string; s?: number }) => (
  <Person
    x={x}
    y={y}
    s={s}
    turn={turn}
    shirt={color}
    pants={color}
    skin={skin}
    hair={hair}
    shoes={INK}
    mood="dizzy"
    arms={[
      [-30, 4, -32, -16],
      [30, 10, 34, -6],
    ]}
    legs={[
      [-18, 42, -28, 44],
      [16, 46, 24, 52],
    ]}
  />
);

export const LastThenFirst = () => (
  <Sheet>
    <Crayon color="#dfeefb" />
    <path d="M-10-10H370V72H-10z" fill={C.navy} />
    <g strokeWidth="2.4">
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i} transform={`translate(${18 + i * 33} ${40 + (i % 3) * 4})`}>
          <path d="M-14 40q0-26 14-26t14 26z" fill={[C.red, C.yellow, C.teal, C.purple][i % 4]} />
          <circle r="11" fill={[C.skin, C.tan, C.umber][i % 3]} />
          <path d="M-4-1h0M4-1h0" strokeWidth="4" />
          <path d="M-4 4q4 4 8 0" strokeWidth="2" />
        </g>
      ))}
    </g>
    <path d="M-10 68H370V98H-10z" fill={C.yellow} />
    <path d="M-10 98H370" strokeWidth="5" />
    <path d="M298 100l-26 150" stroke={C.red} strokeWidth="8" />
    <path d="M20 214q60 14 120 2M40 232h70M180 120q40-10 70 2" stroke="#a9cdea" strokeWidth="4" />
    {/* The four who were faster. */}
    <Skater x={48} y={142} turn={-74} color={C.red} hair={C.bark} />
    <Skater x={132} y={132} turn={64} color={C.blue} hair={INK} skin={C.tan} />
    <Skater x={64} y={198} turn={-108} color={C.orange} hair={C.yellow} />
    <Skater x={128} y={192} turn={98} color={C.purple} hair={C.orange} skin={C.umber} />
    <Star x={92} y={116} r={9} />
    <Star x={156} y={168} r={8} />
    <Star x={28} y={112} r={7} />
    <Person
      x={252}
      y={130}
      s={1.24}
      turn={6}
      shirt={C.leaf}
      pants={C.leaf}
      shoes={INK}
      mood="glad"
      look={0.4}
      hair="#e5b04a"
      arms={[
        [-34, 2, -34, -22],
        [34, 2, 34, -22],
      ]}
      legs={[
        [-16, 46, -26, 50],
        [12, 48, 12, 60],
      ]}
      wear={<path d="M-14 18h29" stroke={C.yellow} strokeWidth="7" />}
      hat={<path d="M-20-4Q-20-25 0-26 20-25 20-4 0-12-20-4z" fill={C.yellow} />}
    />
    <path d="M204 198l34 8M244 216h36" stroke={C.slate} strokeWidth="4" />
    <Whoosh d="M202 138h-16M206 154h-22M200 170h-18" />
  </Sheet>
);

const Rat = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-12 22q-20 4-24-10" strokeWidth="3.5" />
    <path d="M-16 24q-4-26 14-26t16 26z" fill={C.grey} />
    <circle cx="-12" cy="-22" r="8" fill={C.pink} />
    <circle cx="10" cy="-22" r="8" fill={C.pink} />
    <path d="M-17-8q0-14 16-14T16-8Q16 4 0 8-17 4-17-8z" fill={C.grey} />
    <path d="M-6-10h0M6-10h0" strokeWidth="5.5" />
    <path d="M-2-2h4l-2 3z" fill={C.pink} strokeWidth="2" />
    <path d="M-6 0l-12-3M-6 2l-11 3M6 0l12-3M6 2l11 3" strokeWidth="1.4" />
  </g>
);

const Cat = ({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M24 34q24 2 22-18-2-14 8-16" strokeWidth="13" />
    <path d="M24 34q24 2 22-18-2-14 8-16" stroke={color} strokeWidth="8" />
    <path d="M-26 40q-6-46 26-46t26 46z" fill={color} />
    <path d="M-24-12-22-44-8-34Q0-36 8-34L22-44 24-12Q22 6 0 6T-24-12z" fill={color} />
    <path d="M-10-34v8M0-35v9M10-34v8" strokeWidth="2.4" />
    <path d="M-14-16q4-5 8 0M6-16q4-5 8 0" strokeWidth="2.6" />
    <path d="M-3-8h6l-3 3z" fill={C.pink} strokeWidth="2" />
    <path d="M-8-3q4 5 8-1 4 6 8 1" strokeWidth="2.4" />
    <path d="M-14-6l-16-4M-14-3l-16 2M14-6l16-4M14-3l16 2" strokeWidth="1.6" />
    <path d="M-10 40V28M10 40V28" strokeWidth="2.4" />
  </g>
);

export const RatsOnTrial = () => (
  <Sheet>
    <Crayon color="#f3dcb8" />
    <Ground color={C.stone} edge="M-10 186H370" />
    {/* The court. */}
    <Person
      x={316}
      y={78}
      s={1.08}
      shirt={INK}
      mood="cross"
      look={-0.4}
      arms={[
        [-30, 6, -34, 12],
        [22, 10, 22, 12],
      ]}
      legs={[
        [-7, 20, -7, 12],
        [7, 20, 7, 12],
      ]}
      wear={<path d="M-5 0h10l3 14-8-4-8 4z" fill={C.white} />}
      hat={
        <g fill={C.white} strokeWidth="2.4">
          <path d="M-19-2Q-24-26 0-26T19-2Q12-14 0-14T-19-2z" />
          <circle cx="-20" cy="2" r="6" />
          <circle cx="20" cy="2" r="6" />
          <circle cx="-20" cy="13" r="6" />
          <circle cx="20" cy="13" r="6" />
        </g>
      }
    >
      <path d="M-34 14-40-8" strokeWidth="4" />
      <path d="M-52-12l22-6 4 12-22 6z" fill={C.wood} />
    </Person>
    <path d="M262 98h108v100H262z" fill={C.brown} />
    <path d="M276 116h84v68h-84z" stroke={C.bark} />
    <path d="M254 94h116v12H254z" fill={C.wood} />
    <Person
      x={216}
      y={126}
      s={1.12}
      robe
      shirt={C.red}
      mood="sing"
      look={0.3}
      hair={C.bark}
      arms={[
        [-30, 4, -38, 0],
        [28, 18, 30, 24],
      ]}
      wear={<path d="M-4 0h8l4 60h-16z" fill={INK} />}
      hat={<path d="M-20-8h40l4-12h-48zM-12-20q12-10 24 0" fill={INK} />}
    />
    <Cat x={152} y={166} s={0.94} color={C.orange} />
    <Cat x={112} y={192} s={0.98} color={C.slate} />
    {/* The accused stay at home. */}
    <path d="M-10 50H86Q94 120 86 202H-10z" fill="#e3bd86" />
    <path d="M6 202V126q0-38 36-38t36 38v76z" fill={C.bark} />
    <Rat x={46} y={146} s={1.16} />
    <Rat x={26} y={172} s={0.92} />
    <Rat x={58} y={182} s={0.78} />
    <path d="M14 150V108" stroke={C.gold} strokeWidth="3.5" />
    <path d="M14 126l-7-8M14 126l7-8M14 116l-7-8M14 116l7-8M14 108v-9" stroke={C.gold} strokeWidth="4" />
    <path d="M-10 52Q40 22 102 54L90 68H-10z" fill={C.red} />
  </Sheet>
);

const SITTING: [Bend, Bend] = [
  [-7, 34, -7, 40],
  [7, 34, 7, 40],
];

export const CarMarathon = () => (
  <Sheet>
    <Crayon color="#ffe3b4" />
    <Sun x={314} y={40} />
    <Ground color="#c7dd8d" edge="M-10 118Q60 92 150 112T370 102" />
    <path d="M-10 164Q160 150 370 160V232Q180 224-10 232z" fill={C.sand} />
    <Tree x={60} y={166} s={1.3}>
      <path d="M-26-60h0M-8-80h0M22-74h0M34-56h0M4-54h0" stroke={C.red} strokeWidth="10" />
    </Tree>
    {/* Taking a nap. */}
    <g>
      <Limb d="M78 190Q110 178 120 192" color={C.skin} />
      <Limb d="M82 198Q112 204 138 198" color={C.skin} />
      <path d="M116 198q-2-12 10-12l8 10zM134 204l2-14 10 2q4 8-2 12z" fill={C.bark} />
      <path d="M44 148q22-6 34 16 10 20 6 36-20 8-36-2z" fill={C.white} />
      <path d="M72 178q12 4 14 22-14 4-26 0z" fill={C.navy} />
      <circle cx="46" cy="140" r="21" fill={C.skin} />
      <g transform="translate(47 142) rotate(-12)">
        <path d="M-10-2q3 3 6 0M4-2q3 3 6 0" strokeWidth="2.4" />
        <path d="M-10 10q5-6 10-1 5-5 10 1-5 3-10 1-5 2-10-1z" fill={INK} strokeWidth="1.6" />
      </g>
      <path d="M24 138q-3-20 22-22 24 2 22 20Q46 122 24 138z" fill={C.red} />
      <Limb d="M64 168Q72 190 88 180" color={C.skin} w={8} />
      <circle cx="90" cy="179" r="6" fill={C.red} />
    </g>
    <path d="M84 116h10l-10 10h10M104 96h13l-13 13h13M128 70h16l-16 16h16" stroke={C.navy} />
    {/* Taking the car. */}
    <Person
      x={236}
      y={128}
      s={1.02}
      shirt={C.white}
      sleeve={C.skin}
      hair={C.bark}
      mood="glad"
      look={0.3}
      arms={[
        [-34, 0, -30, -26],
        [28, 14, 36, 14],
      ]}
      legs={SITTING}
      wear={<path d="M-6 12l3-2v14M3 12h7l-5 13" stroke={C.red} strokeWidth="2.4" />}
    />
    <Person
      x={284}
      y={132}
      s={0.96}
      shirt={C.bark}
      mood="happy"
      look={0.6}
      arms={[
        [22, 14, 30, 14],
        [30, 10, 34, 8],
      ]}
      legs={SITTING}
      hat={
        <>
          <path d="M-20-6Q-18-27 4-26 22-24 20-6l10 3q-18-6-50-3z" fill={C.wood} />
          <path d="M-12-2h24" strokeWidth="2" />
          <circle cx="-4" cy="-2" r="6.5" fill={C.sky} strokeWidth="2.4" />
          <circle cx="11" cy="-2" r="6.5" fill={C.sky} strokeWidth="2.4" />
        </>
      }
    />
    <path d="M318 146 310 128M302 124l16 6" strokeWidth="5" />
    <path d="M196 150q0-10 10-10h14v18h72v-10h34q24 4 24 30v10H196z" fill={C.red} />
    <path d="M196 170h154" stroke={C.gold} strokeWidth="4" />
    <circle cx="346" cy="160" r="8" fill={C.yellow} />
    {[226, 320].map((x) => (
      <g key={x}>
        <circle cx={x} cy="192" r="23" fill={C.paper} strokeWidth="6" />
        <path d={`M${x - 20} 192h40M${x} 172v40M${x - 14} 178l28 28M${x + 14} 178l-28 28`} strokeWidth="2.4" />
        <circle cx={x} cy="192" r="6" fill={C.gold} />
      </g>
    ))}
    <Whoosh d="M190 160h-22M188 178h-30M190 196h-20" />
    <Each at={[[176, 210, 0.8], [154, 206, 0.6]]}>
      <path d="M-14 9q-12-1-10-11t11-8q4-11 15-8 10 1 11 9 12 1 10 11t-13 7q-12 5-24 0z" fill={C.white} />
    </Each>
  </Sheet>
);
