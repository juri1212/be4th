import { C, INK } from './colors';
import { Bike, Cloud, Crayon, Drops, Each, Ground, Limb, Person, Puff, Sheet, Sun, Whoosh } from './kit';

const Emu = ({ x, y, s = 1, flip }: { x: number; y: number; s?: number; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <Limb d="M-6 14Q-20 26-10 34T-26 48" color={C.slate} w={5} />
    <Limb d="M6 14Q24 24 20 34T30 50" color={C.slate} w={5} />
    <path d="M-30 50h8M26 53h10" strokeWidth="6" />
    <path d="M28-8Q22-34 34-56" strokeWidth="15" />
    <path d="M28-8Q22-34 34-56" stroke={C.tan} strokeWidth="9.5" />
    <path d="M-40 10q-6-26 16-32 24-8 44 4 14 12 4 28-12 14-34 12-8 0-12-4-4 4-8 0-6 0-10-8z" fill={C.brown} />
    <path d="M-26-8q4 10 2 18M-12-12q4 12 1 24M2-14q4 12 0 26M14-10q3 8 0 18" strokeWidth="2.2" stroke={C.bark} />
    <path d="M30-72l-2-10M35-73l3-9M33-73v-12" strokeWidth="3" />
    <path d="M46-64q16-2 22 4-10 6-22 4z" fill={C.orange} />
    <path d="M46-59q8 4 16 2" strokeWidth="2" />
    <circle cx="36" cy="-62" r="13" fill={C.tan} />
    <circle cx="39" cy="-65" r="5" fill={C.white} strokeWidth="2" />
    <circle cx="41" cy="-65" r="2.2" fill={INK} stroke="none" />
    <ellipse cx="35" cy="-56" rx="3.5" ry="2.5" fill={C.pink} stroke="none" />
  </g>
);

const Wheat = () => <path d="M0 0V-26M0-8l-6-6M0-8l6-6M0-16l-6-6M0-16l6-6M0-26v-5" stroke="#b8892c" strokeWidth="3.5" />;

export const Emus = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Sun x={320} y={38} />
    <Cloud x={160} y={34} />
    <Ground color={C.sand} edge="M-10 150Q90 136 190 148T370 142" />
    <Each at={[[20, 172], [52, 166, 0.8], [268, 190, 0.9], [348, 176]]}>
      <Wheat />
    </Each>
    <Emu x={142} y={112} s={0.64} />
    <Emu x={304} y={120} s={0.76} />
    <Emu x={200} y={176} s={1.08} />
    <Whoosh d="M140 176h-20M144 192h-26" />
    <Person
      x={72}
      y={132}
      s={1.18}
      skin={C.skin}
      shirt="#b3a15f"
      pants="#b3a15f"
      mood="oh"
      look={0.8}
      arms={[
        [-26, -4, -28, -24],
        [24, 18, 12, 24],
      ]}
      hat={
        <>
          <path d="M-13-12q0-16 13-16t13 16z" fill="#94844a" />
          <path d="M-29-9q29-9 58 0-8 5-29 5t-29-5z" fill="#94844a" />
        </>
      }
    >
      <path d="M-28-18V-66" strokeWidth="5" />
      <path d="M-28-66q12-7 22 0t20-1v24q-10 7-20 1t-22 1z" fill={C.white} />
    </Person>
    <Drops at={[[46, 92], [102, 88]]} />
  </Sheet>
);

const Snail = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-30 8q2-8 14-8h24q4-16 16-14 10 4 6 14-4 10-18 10h-38q-4 0-4-2z" fill={C.yellow} />
    <path d="M19-13l-4-13M27-12l5-12" />
    <circle cx="15" cy="-27" r="3.5" fill={INK} stroke="none" />
    <circle cx="33" cy="-25" r="3.5" fill={INK} stroke="none" />
    <path d="M22 1q4 3 7-1" strokeWidth="2.2" />
    <circle cx="-4" cy="-13" r="18" fill={C.pink} />
    <path d="M-4-13q4-4 5 2t-8 5-7-12 14-8 10 14" strokeWidth="2.6" />
  </g>
);

export const SlowMarathon = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Sun x={320} y={42} />
    <Cloud x={70} y={46} s={0.9} />
    <Ground color={C.grass} edge="M-10 150Q100 138 200 148T370 144" />
    <path d="M-10 180Q160 168 370 178V232Q180 224-10 234z" fill="#dd8a5e" />
    <path d="M-10 206Q170 196 370 204" stroke={C.white} strokeDasharray="20 14" />
    <path d="M196 182V58M300 176V58" stroke={INK} strokeWidth="11" />
    <path d="M196 182V58M300 176V58" stroke={C.red} strokeWidth="6" />
    <path d="M186 40h124v30H186z" fill={C.white} />
    <path d={[0, 1].map((row) => [0, 1, 2, 3].map((i) => `M${186 + i * 31 + row * 15.5} ${40 + row * 15}h15.5v15h-15.5z`).join('')).join('')} fill={INK} stroke="none" />
    <path d="M190 156Q240 130 300 118" stroke={C.red} strokeWidth="7" />
    <Person
      x={172}
      y={114}
      s={1.3}
      turn={8}
      shirt={C.blue}
      pants={C.navy}
      sleeve={C.skin}
      bare
      shoes={C.red}
      mood="laugh"
      look={0.7}
      arms={[
        [-30, 6, -34, -14],
        [32, 4, 36, -16],
      ]}
      legs={[
        [-12, 50, -32, 48],
        [24, 42, 22, 58],
      ]}
      wear={<path d="M-14 24h29" stroke={C.red} strokeWidth="7" />}
      hat={
        <>
          <path d="M-18-6q-7-2-4-9 2-6 8-5M18-8q8-2 5-9-3-4-7-3" fill={C.white} />
          <path d="M-7 13q10-3 22 0l5-7q4 8 2 18-4 18-18 26-14-10-18-26-2-8 0-15z" fill={C.white} />
          <path d="M-3 14q7-5 14 0-7 6-14 0z" fill="#9c2b26" strokeWidth="2" />
          <path d="M-2 22q2 8 5 14M12 22q-1 8-4 14" strokeWidth="2" strokeOpacity="0.5" />
        </>
      }
    />
    <Whoosh d="M118 132h-26M112 150h-34M122 168h-24" />
    <g fill={C.paper} strokeWidth="2.6">
      <path d="M30 96l26-6 6 28-26 6z" />
      <path d="M70 68l24 8-8 26-24-8z" />
      <path d="M14 134l24 4-4 26-24-4z" />
      <path d="M30 96l26-6 1 7-26 6zM70 68l24 8-2 7-24-8zM14 134l24 4-1 7-24-4z" fill={C.red} />
    </g>
    <Snail x={262} y={206} s={1.1} />
  </Sheet>
);

export const CoffeeSniffer = () => (
  <Sheet>
    <Crayon color="#f6dfc0" />
    <path d="M196 250V22h200v228z" fill="#e79a6f" />
    <path d="M208 48h22M214 76h18M206 180h24M344 60h20M340 200h24M300 214h22M236 206h18" stroke="#bd6c45" strokeWidth="5" />
    <path d="M186 26Q290 10 370 24V-10H186z" fill="#8c4a3a" />
    <path d="M236 62h100v96H236z" fill={C.yellow} />
    <path d="M222 60q18-2 20 24 2 40-6 74l-16 2z" fill={C.red} />
    <path d="M350 60q-18-2-20 24-2 40 6 74l16 2z" fill={C.red} />
    <Person
      x={290}
      y={126}
      s={1.05}
      shirt={C.purple}
      mood="oh"
      look={-0.8}
      hair={C.tan}
      arms={[
        [-22, 16, -28, 12],
        [22, 18, 26, 22],
      ]}
      legs={[
        [-7, 30, -7, 30],
        [7, 30, 7, 30],
      ]}
      hat={<path d="M-20-6Q-22-24 0-26 20-26 24-6 34 6 28 14 20 8 18-8 0-14-20-6z" fill={C.white} />}
    />
    <path d="M228 158h118v14H228z" fill={C.stone} />
    <g transform="translate(262 128)">
      <path d="M-14 28l4-38h20l4 38z" fill={C.blue} />
      <path d="M14-4q16 4 6 24l-7 2M-11 2q-12-2-14-12" strokeWidth="4" />
      <path d="M-10-10q10-8 20 0z" fill={C.blue} />
    </g>
    <path d="M232 108q-16-16-30-4t-28 0-32 6" stroke={C.bark} strokeWidth="5" strokeOpacity="0.75" />
    <path d="M232 92q-18-14-32-2t-30-2-28 4" stroke={C.bark} strokeWidth="5" strokeOpacity="0.45" />
    <Ground color={C.stone} edge="M-10 208Q100 200 200 208T370 206" />
    <path d="M20 224h24M70 230h26M130 222h26M196 230h28M260 222h24M310 230h26" strokeOpacity="0.35" />
    <Person
      x={92}
      y={136}
      s={1.28}
      turn={5}
      shirt={C.blue}
      pants={C.white}
      shoes={INK}
      mood="glad"
      look={0.7}
      hair={C.white}
      arms={[
        [-26, 18, -22, 30],
        [26, 14, 30, 2],
      ]}
      legs={[
        [-10, 46, -18, 56],
        [12, 42, 18, 54],
      ]}
      behind={<path d="M-14-20q-12 10-9 34 5 5 9-2z" fill={C.white} />}
      wear={
        <>
          <path d="M0 0V36" stroke={C.red} strokeWidth="9" />
          <path d="M-8 10h0M-8 20h0M8 10h0M8 20h0" stroke={C.yellow} strokeWidth="5" />
        </>
      }
      hat={
        <>
          <ellipse cx="13" cy="1" rx="16" ry="12" fill="#f5a78c" />
          <path d="M16 7q4-4 7 0" strokeWidth="2.6" />
          <ellipse cx="9" cy="-4" rx="4" ry="2.5" fill={C.white} stroke="none" opacity="0.6" />
          <path d="M-30-12Q0-22 32-16 24-34 2-32-20-36-30-12z" fill={C.navy} />
          <path d="M-30-12Q0-22 32-16" stroke={C.gold} strokeWidth="4" />
        </>
      }
    />
  </Sheet>
);

export const TrainCyclists = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Cloud x={60} y={30} s={0.8} />
    <Ground color="#b9df93" edge="M-10 108Q60 74 130 104T260 90 370 104" />
    <Ground color={C.grass} edge="M-10 138H370" />
    <path d="M-10 140H370" strokeWidth="5" />
    <path d={Array.from({ length: 14 }, (_, i) => `M${8 + i * 28} 143v9`).join('')} stroke={C.bark} strokeWidth="6" />
    <Bike x={72} y={66} s={0.72} color={C.teal} />
    <Bike x={150} y={66} s={0.72} color={C.purple} />
    <path d="M14 66h190v58H14z" fill={C.red} />
    <path d="M8 66h202" strokeWidth="7" />
    <path d="M32 78h60v32H32zM126 78h60v32h-60z" fill={C.paper} />
    <clipPath id="train-windows">
      <path d="M32 40h60v70H32zM126 40h60v70h-60z" />
    </clipPath>
    <g clipPath="url(#train-windows)">
      <Person x={60} y={114} s={0.82} shirt={C.teal} hair={C.bark} mood="glad" look={0.3} arms={[[-22, 10, -22, 20], [28, 4, 30, -18]]} />
      <Person x={152} y={114} s={0.82} shirt={C.purple} hair={C.orange} mood="laugh" look={-0.3} arms={[[-30, 4, -30, -18], [22, 10, 22, 20]]} />
    </g>
    <path d="M32 110h60M126 110h60" strokeWidth="4" />
    <path d="M204 118h24" strokeWidth="6" />
    <path d="M228 62h46v62h-46zM274 82h58q10 4 10 20v22h-68z" fill={C.teal} />
    <path d="M222 60h58" strokeWidth="8" />
    <path d="M238 72h26v22h-26z" fill={C.paper} />
    <path d="M308 82l-4-28h24l-4 28z" fill={INK} />
    <path d="M286 82q0-14 8-14t8 14z" fill={C.gold} />
    <path d="M342 124l16 14h-30z" fill={C.red} />
    <Puff x={300} y={36} s={0.9} />
    <Puff x={262} y={22} s={0.75} />
    <Puff x={228} y={16} s={0.55} />
    <g fill={C.yellow}>
      <Each at={[[44, 126], [80, 126], [140, 126], [176, 126], [244, 124, 1.2], [286, 126], [320, 126]]}>
        <circle r="12" />
        <circle r="3" fill={INK} />
      </Each>
    </g>
    <path d="M-10 180Q160 168 370 178V232Q180 226-10 236z" fill={C.sand} />
    <Whoosh d="M58 190h-24M52 206h-30M60 222h-22" />
    <Bike x={122} y={228} s={1.1} color={C.blue} />
    <Person
      x={120}
      y={144}
      s={0.98}
      turn={14}
      shirt={C.yellow}
      pants={C.navy}
      hair="#e0a53a"
      mood="happy"
      look={0.7}
      arms={[
        [8, 26, 26, 24],
        [26, 18, 34, 22],
      ]}
      legs={[
        [22, 34, 8, 64],
        [34, 40, 18, 56],
      ]}
      wear={<path d="M-5 10h9q-7 6-1 7 5 5-5 8" strokeWidth="2.4" stroke={C.red} />}
    />
    <Drops at={[[92, 100], [104, 84], [82, 120]]} />
    <path d="M276 172q10-22 22-4 8-20 20-2 12-12 20 6z" fill={C.leaf} />
    <path d="M296 156h0M316 154h0M330 164h0" stroke={C.red} strokeWidth="7" />
  </Sheet>
);

const Eyepatch = () => (
  <>
    <path d="M-18-10 18 0" strokeWidth="2.6" />
    <circle cx="-5" cy="-3" r="5.5" fill={INK} />
  </>
);

const Bandana = ({ color }: { color: string }) => (
  <>
    <path d="M-20-4Q-20-24 0-24T20-4Q0-12-20-4z" fill={color} />
    <path d="M-18-6l-12 2 4 8 10-6z" fill={color} />
    <path d="M-8-17h0M4-18h0M12-12h0M-13-11h0" stroke={C.white} strokeWidth="4" />
  </>
);

export const CaesarsPoems = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Sun x={326} y={40} />
    <path d="M140 158V20" strokeWidth="11" />
    <path d="M140 158V20" stroke={C.brown} strokeWidth="6" />
    <path d="M140 24Q88 40 92 98q26-12 48 0zM144 24q56 14 54 74-28-12-54 0z" fill={C.paper} />
    <path d="M124 20q18-12 32 0l-2-12z" fill={C.red} />
    <g transform="translate(168 66)">
      <path d="M-10 4q-2-18 12-18T14 4l-4 2v5H-6V6z" fill={INK} stroke="none" />
      <path d="M-3-3h0M8-3h0" stroke={C.white} strokeWidth="5" />
      <path d="M-11 15 15 22M15 15-11 22" strokeWidth="4" />
    </g>
    <path d="M28 150Q180 168 334 146 326 206 284 214H92Q46 206 28 150z" fill={C.wood} />
    <path d="M40 176Q180 190 322 174M54 198Q180 206 306 196" stroke={C.bark} />
    <Person
      x={74}
      y={122}
      s={0.98}
      skin={C.tan}
      shirt={C.teal}
      pants={C.bark}
      mood="sad"
      arms={[
        [-34, 4, -19, -18],
        [34, 4, 19, -18],
      ]}
      hat={
        <>
          <Bandana color={C.red} />
          <path d="M-5 15q6 14 12 0" fill={C.bark} />
        </>
      }
    />
    <Person
      x={136}
      y={128}
      s={0.95}
      turn={-8}
      shirt={C.white}
      pants={C.purple}
      mood="sleep"
      hair={C.bark}
      wear={<path d="M-14 8h28M-15 18h30M-15 28h30" stroke={C.blue} strokeWidth="5" />}
      hat={
        <>
          <Bandana color={C.blue} />
          <Eyepatch />
        </>
      }
    />
    <path d="M104 84h-9l9 9h-9M90 60h-12l12 12h-12" transform="translate(16 -10)" stroke={C.navy} strokeWidth="3" />
    <Person
      x={250}
      y={112}
      s={1.15}
      robe
      shirt={C.white}
      sleeve={C.skin}
      hair={C.brown}
      mood="sing"
      look={-0.4}
      arms={[
        [-30, 12, -24, 18],
        [34, 0, 34, -24],
      ]}
      wear={<path d="M11-1Q-10 24-18 60L-8 64Q-2 30 17 18z" fill={C.red} />}
      hat={
        <g fill={C.leaf} strokeWidth="2">
          <path d="M-20-6q-6-8 0-12 6 4 0 12zM-13-15q-4-9 4-11 4 6-4 11zM20-6q6-8 0-12-6 4 0 12zM13-15q4-9-4-11-4 6 4 11z" />
        </g>
      }
    >
      <path d="M-46-2q12 4 30-2v36q-18 6-30 2z" fill={C.paper} />
      <path d="M-40 9l18-2M-40 17l18-2M-40 25l12-1" strokeWidth="2.2" />
    </Person>
    <Ground color={C.water} edge="M-10 204q15-12 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0" />
    <path d="M30 224q10-7 20 0M110 228q10-7 20 0M210 222q10-7 20 0M290 228q10-7 20 0" stroke={C.white} />
  </Sheet>
);

const BigBoot = ({ x, y, s = 1, turn = 0 }: { x: number; y: number; s?: number; turn?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${s})`}>
    <path d="M10-22H-10v16q-16 0-18 12l1 8h37q4-18 0-36z" fill={INK} />
    <path d="M-29 10h40v7h-40z" fill={C.grey} />
    <path d="M-12-6h8M-8-12h8M-8-18h8" stroke={C.white} strokeWidth="2.2" />
  </g>
);

export const TugOfWar = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Cloud x={186} y={36} s={0.9} />
    <Ground color={C.grass} edge="M-10 166Q100 158 200 164T370 162" />
    <path d="M176 166l-6 70" stroke={C.white} strokeWidth="6" />
    <path d="M-10 144Q60 140 120 140T230 138 370 140" strokeWidth="10" />
    <path d="M-10 144Q60 140 120 140T230 138 370 140" stroke={C.wood} strokeWidth="5" />
    {[
      { x: 64, hair: C.bark, shirt: C.white },
      { x: 124, hair: C.orange, shirt: C.white },
    ].map(({ x, hair, shirt }) => (
      <Person
        key={x}
        x={x}
        y={122}
        s={1.06}
        turn={14}
        shirt={shirt}
        pants={C.blue}
        hair={hair}
        mood="cross"
        look={0.5}
        shoes={C.white}
        arms={[
          [4, 26, 26, 14],
          [30, 22, 42, 10],
        ]}
        legs={[
          [4, 52, 10, 58],
          [26, 46, 34, 48],
        ]}
        wear={<path d="M-14 8h28M-15 18h30M-15 28h30" stroke={C.red} strokeWidth="4.5" />}
      />
    ))}
    {[230, 312].map((x) => (
      <g key={x}>
        <Person
          x={x}
          y={110}
          s={1.1}
          turn={16}
          shirt={C.navy}
          pants={C.navy}
          mood="glad"
          look={-0.5}
          shoes="none"
          arms={[
            [-28, 24, -38, 24],
            [0, 30, -20, 28],
          ]}
          legs={[
            [-12, 46, -22, 56],
            [16, 48, 18, 58],
          ]}
          wear={<path d="M0 8h0M0 18h0M0 28h0" stroke={C.yellow} strokeWidth="5" />}
          hat={
            <>
              <path d="M-19-8Q-19-34 0-34T19-8Q0-14-19-8z" fill={C.navy} />
              <path d="M-25-6Q0-18 25-6" strokeWidth="5" />
              <path d="M0-28l3 5 5 1-4 4 1 5-5-2-5 2 1-5-4-4 5-1z" fill={C.yellow} strokeWidth="1.6" />
              <path d="M-9 8q4-5 9-1 5-4 9 1-5 2-9 1-4 1-9-1z" fill={C.bark} strokeWidth="1.6" />
            </>
          }
        />
        <BigBoot x={x - 40} y={180} turn={6} />
        <BigBoot x={x + 6} y={190} turn={6} />
      </g>
    ))}
    <path d="M180 138l-12 28 13-6 8 9 5-31z" fill={C.red} />
    <Drops at={[[38, 80], [98, 76], [90, 92], [156, 80]]} />
  </Sheet>
);
