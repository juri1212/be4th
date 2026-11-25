import { C, INK } from './colors';
import { Ball, Cloud, Crayon, Drops, Each, Ground, Limb, Note, Person, Puff, SPIRAL, Sheet, Star, Sun, Whoosh } from './kit';

export const MooseAtDinner = () => (
  <Sheet>
    <Crayon color="#f0cf9c" />
    <path d="M238 26h92v84h-92z" fill={C.night} />
    <Star x={258} y={48} r={9} />
    <Star x={308} y={42} r={6} />
    <Star x={256} y={92} r={7} />
    <path d="M276 60q-4 14 10 16-18 6-20-8 0-8 10-8z" fill={C.yellow} strokeWidth="2" />
    <path d="M284 26v84M238 68h92" strokeWidth="4" />
    <path d="M232 110h104" strokeWidth="7" />
    <Ground color={C.brown} edge="M-10 206H370" />
    {/* The stairs, for later. */}
    <path d="M-10 210v-64h26v20h24v20h24v24z" fill={C.wood} />
    <path d="M-10 84 62 154" strokeWidth="7" />
    <path d="M-4 92v50M22 116v46M46 140v42" strokeWidth="5" />
    <Person
      x={288}
      y={132}
      s={1.18}
      shirt={C.navy}
      mood="oh"
      look={-0.4}
      hair={C.orange}
      legs={[
        [-7, 44, -7, 52],
        [7, 44, 7, 52],
      ]}
      arms={[
        [-28, 16, -24, 28],
        [34, 4, 32, -14],
      ]}
      hat={
        <>
          <ellipse cx="-2" cy="2" rx="5" ry="4.5" fill={C.gold} strokeWidth="2.2" />
          <path d="M-14 8q4 2 10 0M6 8q-4 2-8 0" stroke={C.orange} strokeWidth="3.5" />
          <path d="M-9 16q9 12 18 0z" fill={C.orange} />
        </>
      }
      wear={
        <g fill={C.white} strokeWidth="2.4">
          <path d="M-17-2q4-6 9-2 4-5 8 0 4-5 8 0 5-4 9 2-4 7-9 3-4 5-8 1-4 4-8-1-6 3-9-3z" />
        </g>
      }
    />
    <path d="M322 86l4-10M332 92l10-6M318 82l-4-8" stroke={C.gold} />
    {/* The moose. */}
    <g>
      <path d="M84 206q-4-60 22-76 30-16 54 6 20 26 12 70z" fill={C.brown} />
      <path d="M112 92Q94 72 72 80 48 72 44 46q10 10 16 8-6-16 2-26 4 16 12 20-2-18 8-26 2 18 10 28 16 8 24 32z" fill={C.tan} />
      <path d="M152 92Q170 72 192 80 216 72 220 46q-10 10-16 8 6-16-2-26-4 16-12 20 2-18-8-26-2 18-10 28-16 8-24 32z" fill={C.tan} />
      <path d="M104 92q-18-8-24 4 8 14 26 8zM160 92q18-8 24 4-8 14-26 8z" fill={C.brown} />
      <path d="M132 74q32 0 30 34 12 10 10 28-6 22-40 22t-40-22q-2-18 10-28-2-34 30-34z" fill={C.brown} />
      <path d="M96 134q4-18 36-18t36 18q0 22-36 22t-36-22z" fill={C.tan} />
      <path d="M118 128h0M146 128h0" strokeWidth="7" />
      <path d="M116 140q16 14 32 0 4 2 4 6" />
      {[117, 147].map((x) => (
        <g key={x} transform={`translate(${x} 99)`}>
          <circle r="11" fill={C.white} />
          <path transform="scale(1.6)" d={SPIRAL} strokeWidth="1.5" />
        </g>
      ))}
      <g fill={C.pink} stroke="none" opacity="0.8">
        <ellipse cx="106" cy="114" rx="7" ry="5" />
        <ellipse cx="158" cy="114" rx="7" ry="5" />
      </g>
      <path d="M102 162q30 14 60 0l-8 30-22 12-22-12z" fill={C.white} />
      <path d="M110 176h44M116 188h32" stroke={C.red} strokeWidth="3" />
    </g>
    <path d="M132 58q-8-10 2-14t10 6M152 50q8-8 2-14M118 56q-8-6-2-14" strokeWidth="2.6" strokeOpacity="0.6" />
    <path d="M74 192h286v16H74z" fill={C.wood} />
    <path d="M98 208v40M336 208v40" stroke={INK} strokeWidth="13" />
    <path d="M98 208v40M336 208v40" stroke={C.wood} strokeWidth="7" />
    <Limb d="M168 168Q190 176 196 170" color={C.brown} w={13} />
    <g transform="translate(212 160)">
      <path d="M14 2q16-2 15 14t-15 12" strokeWidth="5" />
      <path d="M-15-6h30v38h-30z" fill={C.gold} />
      <path d="M-6 4v20M5 4v20" strokeOpacity="0.4" />
      <path d="M-18-4q-4-10 6-12 4-8 12-4 8-6 14 2 10 2 6 12-6 6-10 2-4 8-10 2-6 6-10 0-6 4-8-2z" fill={C.white} />
    </g>
    <path d="M252 190q0-8 26-8t26 8z" fill={C.white} />
    <path d="M264 182q4-12 14-10 12-4 14 10z" fill={C.red} />
  </Sheet>
);

const Racket = ({ x, y, turn = 0 }: { x: number; y: number; turn?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${turn})`}>
    <path d="M0 0V-18" strokeWidth="6" />
    <ellipse cx="0" cy="-32" rx="11" ry="14" fill={C.paper} strokeWidth="4" />
    <path d="M-5-43v22M0-45v26M5-43v22M-9-38h18M-10-32h20M-9-26h18" strokeWidth="1" />
  </g>
);

export const TennisScoreboard = () => (
  <Sheet>
    <Crayon color="#ffd9a0" />
    <path d="M300 96a28 28 0 0 0-56 0z" fill={C.orange} stroke="none" />
    <Ground color={C.grass} edge="M-10 98H370" />
    <path d="M-10 112H370M40 98 10 250M320 98 350 250" stroke={C.white} strokeWidth="5" />
    <path d="M128 92V106M232 92V106" strokeWidth="8" />
    <path d="M102 16h156v78H102z" fill={C.navy} strokeWidth="4" />
    <path d="M112 26h62v46h-62zM186 26h62v46h-62z" fill={INK} />
    <path d="M122 34v16h16M136 34v30M150 34h16l-9 30M196 34v16h16M210 34v30M224 34h16l-9 30" stroke={C.yellow} strokeWidth="5" />
    <path d="M180 42h0M180 58h0" stroke={C.yellow} strokeWidth="6" />
    <path d="M116 80q10-6 18 2t18-2 18 2" stroke={C.grey} />
    <path d="M258 30q14-8 8 4t10 4-2 10 14 4" stroke={C.slate} strokeWidth="3.5" />
    <path d="M102 60l-14 6 10 5-16 8" stroke={C.yellow} strokeWidth="4" />
    <Puff x={236} y={12} s={0.8} color={C.grey} />
    <Puff x={270} y={14} s={0.6} color={C.grey} />
    <path d="M-10 136H370V172H-10z" fill={C.white} fillOpacity="0.35" strokeWidth="2" />
    <path d="M-10 148H370M-10 160H370M0 136v36M14 136v36M28 136v36M42 136v36M56 136v36M70 136v36M84 136v36M98 136v36M112 136v36M126 136v36M140 136v36M154 136v36M168 136v36M182 136v36M196 136v36M210 136v36M224 136v36M238 136v36M252 136v36M266 136v36M280 136v36M294 136v36M308 136v36M322 136v36M336 136v36M350 136v36" strokeWidth="1.2" strokeOpacity="0.5" />
    <path d="M-10 136H370" strokeWidth="9" />
    <path d="M-10 136H370" stroke={C.white} strokeWidth="4.5" />
    {/* Both of them are done for. */}
    <Person
      x={74}
      y={142}
      s={1.22}
      turn={-8}
      shirt={C.white}
      sleeve={C.white}
      pants={C.white}
      bare
      shoes={C.red}
      hair={C.brown}
      mood="dizzy"
      arms={[
        [-28, 20, -24, 46],
        [26, 22, 30, 42],
      ]}
      hat={<path d="M-19-9Q0-17 19-9" stroke={C.red} strokeWidth="5" />}
    >
      <Racket x={32} y={44} turn={150} />
    </Person>
    <Person
      x={284}
      y={142}
      s={1.18}
      turn={8}
      skin={C.tan}
      shirt={C.yellow}
      pants={C.navy}
      bare
      shoes={C.white}
      hair={INK}
      mood="dizzy"
      arms={[
        [-26, 22, -30, 42],
        [28, 20, 24, 46],
      ]}
      hat={<path d="M-19-9Q0-17 19-9" stroke={C.white} strokeWidth="5" />}
    >
      <Racket x={-32} y={44} turn={-150} />
    </Person>
    <Drops at={[[44, 94], [40, 112], [108, 104], [114, 122], [318, 100], [322, 118], [246, 102], [242, 120]]} />
    <Each at={[[166, 226], [196, 220, 0.9], [120, 228, 0.8]]}>
      <circle r="8" fill="#d9ec4f" />
      <path d="M-7-3q7 3 14 0" stroke={C.white} strokeWidth="2" />
    </Each>
  </Sheet>
);

export const MoneyDoesNotStink = () => (
  <Sheet>
    <Crayon color="#f8dcc4" />
    <Each at={[[34, 0], [326, 0]]}>
      <path d="M-18-4h36v226h-36z" fill={C.paper} />
      <path d="M-7 22v180M7 22v180" strokeOpacity="0.4" />
      <path d="M-26-4h52v22h-52zM-26 200h52v22h-52z" fill={C.paper} />
    </Each>
    <path d="M60-4h240v16q-20 18-40 0-20 18-40 0-20 18-40 0-20 18-40 0-20 18-40 0-20 18-40 0z" fill={C.red} />
    <Ground color={C.stone} edge="M-10 210H370" />
    <Person
      x={116}
      y={122}
      s={1.36}
      robe
      shirt={C.purple}
      sleeve={C.skin}
      mood="laugh"
      look={0.6}
      arms={[
        [-30, 18, -22, 30],
        [30, 10, 40, -6],
      ]}
      wear={<path d="M11-1Q-10 24-18 60L-8 64Q-2 30 17 18z" fill={C.gold} />}
      hat={
        <g fill={C.gold} strokeWidth="2">
          <path d="M-20-6q-6-8 0-12 6 4 0 12zM-13-15q-4-9 4-11 4 6-4 11zM20-6q6-8 0-12-6 4 0 12zM13-15q4-9-4-11-4 6 4 11z" />
        </g>
      }
    >
      <circle cx="50" cy="-16" r="13" fill={C.yellow} />
      <path d="M47-22h6M50-22v12M46-10h8" strokeWidth="2.4" />
    </Person>
    <path d="M196 72l8-8M204 84h11M194 64l2-11" stroke={C.gold} strokeWidth="4" />
    <Person
      x={258}
      y={128}
      s={1.24}
      robe
      shirt={C.white}
      sleeve={C.skin}
      hair={C.bark}
      mood="cross"
      look={-0.5}
      arms={[
        [-30, 6, -6, -13],
        [36, 2, 34, -20],
      ]}
      wear={<path d="M-11-1Q10 24 18 60L8 64Q2 30-17 18z" fill={C.red} />}
      hat={<ellipse cx="-3" cy="3" rx="4.5" ry="3.5" fill="#f2a184" strokeWidth="2" />}
    />
    {/* What it is all about. */}
    <g transform="translate(192 196)">
      <path d="M-14-16q-18-2-17 14M14-16q18-2 17 14" strokeWidth="5" />
      <path d="M-16-24h32q-4 8 4 14 14 16-4 34h-32q-18-18-4-34 8-6 4-14z" fill="#d9703f" />
      <path d="M-25 4q8 7 16 0t16 0 17 0" strokeWidth="2.6" stroke={C.yellow} />
      <ellipse cx="0" cy="-24" rx="21" ry="6" fill={C.yellow} />
    </g>
    <path d="M180 166q-8-8 0-16t0-16M196 164q-8-8 0-16t0-16M212 166q-8-8 0-16t0-14" stroke="#9aa83a" strokeWidth="4" />
  </Sheet>
);

export const MoonGolf = () => (
  <Sheet>
    <Crayon color="#2d3570" strength={0.1} />
    <Star x={30} y={36} r={7} />
    <Star x={86} y={22} r={5} />
    <Star x={112} y={62} r={6} />
    <Star x={206} y={22} r={8} />
    <Star x={338} y={120} r={6} />
    <Star x={22} y={108} r={5} />
    <circle cx="300" cy="54" r="34" fill={C.water} />
    <path d="M276 38q12-18 30-14 4 10-10 16 2 12-12 14-8-6-8-16zM306 60q14-10 26-2-2 18-14 24-14-6-12-22z" fill={C.leaf} strokeWidth="2.4" />
    <path d="M290 62h0M312 48h0" strokeWidth="5" />
    <path d="M294 70q8 6 14-2" strokeWidth="2.4" />
    <Ground color={C.stone} edge="M-10 176Q80 158 180 170T370 160" />
    <g fill="#b9b6b6">
      <ellipse cx="46" cy="200" rx="26" ry="9" />
      <ellipse cx="256" cy="222" rx="34" ry="9" />
      <ellipse cx="312" cy="184" rx="18" ry="6" />
    </g>
    <path d="M60 170V104" strokeWidth="4" />
    <path d="M60 104h34l-8 11 8 11H60z" fill={C.red} />
    <g transform="translate(146 118) rotate(-6)">
      <path d="M-30-6h22v44h-22z" fill={C.grey} />
      <Limb d="M-8 42Q-14 58-20 66" color={C.white} w={14} />
      <Limb d="M10 42Q16 58 24 66" color={C.white} w={14} />
      <path d="M-34 78q-1-14 14-14 12 0 12 14zM14 78q-1-14 14-14 12 0 12 14z" fill={C.grey} />
      <path d="M-18-2Q0-8 18-2 24 12 20 42 0 50-20 42-24 12-18-2z" fill={C.white} />
      <path d="M-8 16h18v14H-8z" fill={C.red} />
      <path d="M-4 23h0M5 23h0" stroke={C.yellow} strokeWidth="5" />
      <circle cx="0" cy="-30" r="31" fill={C.white} />
      <path d="M-18-32q0-20 20-20 22 0 22 20 0 18-22 18-20 0-20-18z" fill={C.skin} />
      <g transform="translate(3 -32)">
        <path d="M-8-3h0M8-3h0" strokeWidth="6" />
        <path d="M-6 5q6 8 13 0z" fill="#9c2b26" strokeWidth="2.4" />
        <path d="M-13 4h0M14 4h0" stroke={C.pink} strokeWidth="7" />
      </g>
      <path d="M44 2 74-38" strokeWidth="5" />
      <path d="M68-44l18 4-8 14-8-6z" fill={C.grey} />
      <Limb d="M16 10Q34 18 44 4" color={C.white} w={12} />
      <circle cx="46" cy="2" r="8" fill={C.white} />
      <Limb d="M-18 10Q-34 22-36 34" color={C.white} w={12} />
      <circle cx="-36" cy="36" r="8" fill={C.white} />
    </g>
    <path d="M176 178Q214 110 250 128" stroke={C.white} strokeDasharray="2 10" strokeWidth="4" />
    <circle cx="258" cy="134" r="10" fill={C.white} />
    <path d="M254 131h0M261 130h0M257 138h0M264 137h0" strokeWidth="2.6" strokeOpacity="0.5" />
  </Sheet>
);

export const DancingPlague = () => (
  <Sheet>
    <Crayon color="#ffe3b0" />
    <path d="M-10 170V84l26-30 26 30v86zM42 170V70l30-36 30 36v100zM258 170V78l28-34 28 34v92zM314 170V62l30-34 30 34v108z" fill="#f2b98c" />
    <path d="M-12 86 16 52l28 34zM40 72 72 32l32 40zM256 80 286 42l30 38zM312 64 344 26l34 38z" fill={C.red} />
    <path d="M8 100h16v20H8zM64 92h16v22H64zM278 96h16v22h-16zM336 84h16v22h-16z" fill={C.sky} />
    <path d="M42 96l60 60M102 96l-60 60M258 100l56 56M314 100l-56 56" strokeWidth="4" strokeOpacity="0.35" />
    <path d="M-10 168H370V250H-10z" fill={C.wood} />
    <path d="M-10 190H370M60 168v22M140 168v22M220 168v22M300 168v22M20 190v60M100 190v60M180 190v60M260 190v60M340 190v60" strokeOpacity="0.35" />
    <Person
      x={58}
      y={112}
      s={1.1}
      turn={-10}
      shirt={C.red}
      pants={C.yellow}
      hair={C.bark}
      mood="glad"
      arms={[
        [-34, 2, -32, -22],
        [34, 2, 34, -20],
      ]}
      legs={[
        [-22, 36, -30, 50],
        [12, 48, 8, 62],
      ]}
    />
    <Person
      x={140}
      y={122}
      s={1.18}
      turn={8}
      robe
      long
      shirt={C.teal}
      hair={C.orange}
      mood="dizzy"
      arms={[
        [-30, -4, -38, 6],
        [30, 0, 38, -18],
      ]}
      wear={<path d="M-20 46Q0 54 20 46" stroke={C.yellow} strokeWidth="5" />}
    />
    <Person
      x={212}
      y={112}
      s={1.1}
      turn={-6}
      skin={C.tan}
      shirt={C.purple}
      pants={C.teal}
      mood="laugh"
      arms={[
        [-34, 8, -38, -10],
        [30, 20, 38, 22],
      ]}
      legs={[
        [-8, 50, -6, 62],
        [20, 34, 22, 50],
      ]}
      hat={
        <>
          <path d="M-21-5Q-20-25 0-26 20-25 21-5 0-14-21-5z" fill={C.leaf} />
          <path d="M14-20q16-14 20-2-8 4-16 8z" fill={C.red} />
        </>
      }
    />
    <Person
      x={312}
      y={122}
      s={1.14}
      shirt={C.yellow}
      pants={C.navy}
      mood="sing"
      look={-0.4}
      hair={C.brown}
      arms={[
        [-30, 22, -30, 4],
        [24, 22, -2, 18],
      ]}
      hat={<path d="M-24-7Q0-18 24-7 16-30 0-28-18-30-24-7z" fill={C.blue} />}
    >
      <g transform="translate(-16 10) rotate(-28)">
        <path d="M-10 0h-22" strokeWidth="5" />
        <path d="M-10-7q8-5 12 1 6-6 13 0 6 6 0 12-7 6-13 1-5 6-12 0-5-7 0-14z" fill={C.brown} />
        <path d="M-8 0h18" strokeWidth="1.6" />
      </g>
      <path d="M-30 34 14 0" strokeWidth="3.5" />
    </Person>
    <Note x={252} y={58} color={C.purple} />
    <Note x={182} y={46} color={C.red} />
    <Note x={112} y={34} color={C.blue} />
    <Note x={226} y={28} color={C.teal} />
    <Whoosh d="M14 138q-8 12 0 24M98 134q8 8 4 20M98 190q40 14 84 0M184 122q8 10 0 22" />
  </Sheet>
);

export const TwoBalls = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Sun x={48} y={40} />
    <Cloud x={274} y={34} s={0.9} />
    <Ground color={C.grass} edge="M-10 122Q100 112 200 120T370 116" />
    <path d="M116 120V48H244V120" strokeWidth="9" />
    <path d="M116 120V48H244V120" stroke={C.white} strokeWidth="4.5" />
    <path d="M132 52v66M148 52v66M164 52v66M180 52v66M196 52v66M212 52v66M228 52v66M120 64h120M120 80h120M120 96h120M120 112h120" stroke={C.white} strokeWidth="1.6" />
    <path d="M-10 214H370" stroke={C.white} strokeWidth="5" />
    <Person
      x={66}
      y={126}
      s={1.3}
      turn={4}
      shirt={C.white}
      sleeve={C.white}
      pants={INK}
      bare
      shoes={C.bark}
      hair={C.bark}
      mood="cross"
      look={0.6}
      arms={[
        [-26, 18, -24, 30],
        [26, 22, 34, 12],
      ]}
      wear={<path d="M-10 0v36M0-1v38M10 0v36" stroke={C.water} strokeWidth="5" />}
    >
      <Ball x={42} y={2} r={15} color={C.yellow} />
    </Person>
    <Person
      x={294}
      y={126}
      s={1.3}
      turn={-4}
      skin={C.tan}
      shirt={C.water}
      pants={INK}
      bare
      shoes={C.bark}
      hair={INK}
      mood="cross"
      look={-0.6}
      arms={[
        [-26, 22, -34, 12],
        [26, 18, 24, 30],
      ]}
    >
      <Ball x={-42} y={2} r={15} color={C.brown} />
    </Person>
    <Person
      x={180}
      y={130}
      s={1.12}
      shirt={INK}
      pants={C.white}
      mood="oh"
      arms={[
        [-26, 18, -27, -2],
        [26, 18, 27, -2],
      ]}
      wear={<path d="M-4 2l4 6 4-6z" fill={C.red} strokeWidth="2" />}
      hat={<path d="M-20-6Q-18-28 4-26 22-24 20-6l10 3q-18-6-50-3z" fill={C.slate} />}
    />
    <path transform="translate(-2 -8)" d="M166 70q-2-10 6-10 8 2 2 10-4 2-4 7M170 84h0M194 62q-2-9 5-9 8 2 2 9-4 2-4 6M197 74h0" stroke={C.red} strokeWidth="4" />
  </Sheet>
);
