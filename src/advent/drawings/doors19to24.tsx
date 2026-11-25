import { C, INK } from './colors';
import { Ball, Bike, Cloud, Crayon, Drops, Each, Fir, Ground, Limb, Person, Sheet, Star, Sun, Tree, Whoosh } from './kit';

const Rabbit = ({ x, y, s = 1, flip, color }: { x: number; y: number; s?: number; flip?: boolean; color: string }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <circle cx="-26" cy="4" r="8" fill={C.white} />
    <path d="M-24 14q-4-24 18-26 20 0 24 18l-4 12h-34z" fill={color} />
    <path d="M-24 18q0-9 12-9t13 9zM8 18q0-8 8-8t9 8z" fill={color} />
    <path d="M8-24Q-6-44-2-58q14 8 18 32zM18-24q-2-24 10-36 8 18 0 38z" fill={color} />
    <path d="M8-30q-5-10-5-18M22-30q0-12 4-20" stroke={C.pink} strokeWidth="4" />
    <circle cx="17" cy="-12" r="16" fill={color} />
    <path d="M13-15h0M25-15h0" strokeWidth="5.5" />
    <path d="M18-8h5l-2.5 3z" fill={C.pink} strokeWidth="2" />
    <path d="M14-3q4 5 6 0 3 5 7 0" strokeWidth="2.2" />
  </g>
);

export const NapoleonsRabbits = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Cloud x={120} y={36} />
    <Ground color={C.grass} edge="M-10 132Q80 112 180 128T370 118" />
    <Tree x={34} y={142} s={0.8} />
    {/* The coach, with its door open. */}
    <path d="M262 176h90" strokeWidth="6" />
    <path d="M270 92h90v70q-40 14-76 0-14-20-14-70z" fill={C.purple} />
    <path d="M264 92q50-26 106-8v10H264z" fill={C.gold} />
    <path d="M284 100h34v60h-34z" fill={INK} />
    <path d="M284 100l-24 8v58l24-6z" fill={C.purple} />
    <path d="M278 108l-12 4v18l12-3z" fill={C.sky} strokeWidth="2.4" />
    <path d="M328 102h30v26h-30z" fill={C.sky} />
    {[290, 350].map((x) => (
      <g key={x}>
        <circle cx={x} cy="188" r="21" fill={C.paper} strokeWidth="6" />
        <path d={`M${x - 18} 188h36M${x} 170v36M${x - 13} 175l26 26M${x + 13} 175l-26 26`} strokeWidth="2.4" />
        <circle cx={x} cy="188" r="5" fill={C.gold} />
      </g>
    ))}
    <Person
      x={218}
      y={122}
      s={1.18}
      turn={10}
      shirt={C.navy}
      pants={C.white}
      shoes={INK}
      mood="oh"
      look={-0.5}
      hair={C.bark}
      arms={[
        [-32, 2, -34, -18],
        [32, 4, 36, -14],
      ]}
      legs={[
        [-12, 50, -32, 48],
        [24, 42, 20, 60],
      ]}
      wear={
        <>
          <path d="M-5 0h10l3 36H-8z" fill={C.white} />
          <path d="M-12 2h0M12 2h0" stroke={C.gold} strokeWidth="9" />
        </>
      }
      hat={
        <>
          <path d="M-36-8Q-30-20-18-24 0-40 18-24 30-20 36-8 0-22-36-8z" fill={INK} />
          <circle cx="0" cy="-22" r="4.5" fill={C.red} strokeWidth="2" />
        </>
      }
    />
    <Drops at={[[184, 60], [252, 62], [176, 78]]} />
    <Rabbit x={66} y={152} s={0.72} color={C.tan} />
    <Rabbit x={118} y={150} s={0.78} color={C.white} />
    <Rabbit x={162} y={172} s={0.84} color={C.brown} />
    <Rabbit x={36} y={192} s={0.94} color={C.white} />
    <Rabbit x={100} y={198} s={1} color={C.grey} />
    <Rabbit x={210} y={214} s={0.9} color={C.white} />
    <Rabbit x={154} y={222} s={0.84} color={C.tan} />
    <Rabbit x={48} y={228} s={0.8} color={C.brown} />
    <Rabbit x={318} y={222} s={0.86} flip color={C.tan} />
    <path d="M262 226l22-5-4 8z" fill={C.orange} />
    <path d="M284 221l8-6M284 221l9 0M284 221l7 6" stroke={C.leaf} strokeWidth="3.5" />
    <path d="M152 126q-8-10 0-14M136 100q6 6 2 12" strokeWidth="2.6" strokeOpacity="0.5" />
  </Sheet>
);

export const PicklesTheDog = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <Cloud x={70} y={36} s={0.9} />
    <path d="M220-10H370V150H220z" fill="#e79a6f" />
    <path d="M234 22h22M276 46h24M236 80h20M330 20h22M336 74h20M300 110h22" stroke="#bd6c45" strokeWidth="5" />
    <path d="M276-10h60v84h-60z" fill={C.paper} />
    <path d="M276 30h60M306-10v84" />
    <Ground color={C.grass} edge="M-10 164Q100 152 200 160T370 156" />
    <path d="M100 168q-30-10-18-36 0-28 30-28 10-28 42-18 22-26 52-4 30-14 44 12 34-6 36 24 30 4 24 34 2 20-26 18z" fill={C.leaf} />
    <path d="M112 136q8-10 18 0M164 112q8-10 18 0M220 118q8-10 18 0M256 140q8-8 16 0M150 146q8-8 16 0" stroke="#3f8a55" />
    <path d="M128 116h0M196 100h0M246 108h0M210 140h0M274 124h0" stroke={C.pink} strokeWidth="8" />
    {/* The cup, half out of its newspaper. */}
    <g transform="translate(244 168) rotate(14)">
      <path d="M-18-30q-24-6-22-34 14-4 20 10M18-30q24-6 22-34-14-4-20 10" strokeWidth="6" />
      <path d="M-18-30q-24-6-22-34 14-4 20 10M18-30q24-6 22-34-14-4-20 10" stroke={C.gold} strokeWidth="2" />
      <path d="M-24-70h48q2 44-18 52v20H-6v-20q-20-8-18-52z" fill={C.yellow} />
      <path d="M-24-70h48" strokeWidth="5" />
      <path d="M-14-60q0 20 8 30" stroke={C.white} strokeWidth="5" />
      <path d="M-38-22l18 8 14-10 16 10 16-8 12 10-6 50q-34 10-66 0z" fill={C.paper} />
      <path d="M-28 0h24M-26 10h20M-26 20h20M6-2h20M6 8h18M6 18h16" strokeWidth="2.4" strokeOpacity="0.7" />
    </g>
    <path d="M206 78l-8-8M226 66l-2-12M296 92l12-6M290 72l8-10" stroke={C.gold} strokeWidth="5" />
    {/* Pickles. */}
    <g>
      <path d="M44 154Q18 146 22 118" strokeWidth="15" />
      <path d="M44 154Q18 146 22 118" stroke={C.white} strokeWidth="9" />
      <path d="M38 214q-8-60 34-70 40-8 70 10 10 20 4 60z" fill={C.white} />
      <path d="M52 150q20-14 44-8 4 22-16 32-24 2-28-24z" fill={INK} stroke="none" />
      <path d="M42 216q-2-16 12-16t14 16zM66 216q0-14 12-14t12 14zM112 216q0-16 12-16t12 16zM136 216q0-16 12-16t12 16z" fill={C.white} />
      <path d="M124 168q22 8 46-4" stroke={C.red} strokeWidth="8" />
      <circle cx="148" cy="130" r="38" fill={C.white} />
      <path d="M122 102q-22 2-20 40 2 18 14 12 12-14 14-46zM172 100q24 2 22 38-2 18-14 12-12-12-16-44z" fill={INK} />
      <path d="M152 94q24-2 28 22 0 16-14 18-14-6-14-40z" fill={INK} stroke="none" />
      <path d="M136 122h0" strokeWidth="8" />
      <circle cx="164" cy="121" r="5" fill={C.white} stroke="none" />
      <path d="M164 122h0" strokeWidth="4.5" />
      <ellipse cx="150" cy="138" rx="9" ry="6.5" fill={INK} />
      <path d="M150 144v5q-10 10-18-1M150 149q10 10 18-1" strokeWidth="2.6" />
      <path d="M144 154q0 16 7 16t7-15q-7 1-14-1z" fill={C.pink} strokeWidth="2.6" />
    </g>
    <circle cx="146" cy="178" r="6" fill={C.gold} strokeWidth="2.4" />
    <Whoosh d="M6 112q-6 10 0 20M38 106q8 8 4 18" />
  </Sheet>
);

export const FirstBikeBan = () => (
  <Sheet>
    <Crayon color={C.sky} />
    <path d="M-10 170V60l34-30 34 30v110zM58 170V48l40-32 40 32v122zM222 170V56l38-30 38 30v114zM298 170V44l36-28 46 28v126z" fill="#f2cf9c" />
    <path d="M-14 62 24 26l38 36zM54 50 98 12l44 38zM218 58 260 22l42 36zM294 46 334 12l50 34z" fill="#b5553f" />
    <path d="M14 76h20v24H14zM76 66h18v24H76zM104 66h18v24h-18zM250 72h20v24h-20zM324 60h20v26h-20z" fill={C.paper} />
    <path d="M-10 150H370V190H-10z" fill={C.stone} />
    <path d="M40 152v36M110 152v36M180 152v36M250 152v36M320 152v36" strokeOpacity="0.3" />
    <Ground color={C.brown} edge="M-10 192H370" />
    <path d="M-10 212q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0M-10 230q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0" stroke={C.bark} strokeWidth="5" />
    <Person
      x={300}
      y={110}
      s={1.18}
      shirt={C.navy}
      mood="cross"
      look={-0.5}
      arms={[
        [-30, 10, -34, -4],
        [32, 4, 28, -18],
      ]}
      wear={<path d="M0 8h0M0 18h0M0 28h0" stroke={C.yellow} strokeWidth="5" />}
      hat={
        <>
          <path d="M-32-10Q-28-30 0-32 28-30 32-10 0-20-32-10z" fill={INK} />
          <path d="M-9 9q4-5 9-1 5-4 9 1-5 2-9 1-4 1-9-1z" fill={C.bark} strokeWidth="1.6" />
        </>
      }
    >
      <path d="M28-18V-30" strokeWidth="4" />
    </Person>
    <g transform="translate(333 60)">
      <circle r="24" fill={C.white} />
      <circle r="21" stroke={C.red} strokeWidth="6" />
      <Bike x={0} y={11} s={0.42} color={INK} />
      <path d="M-15-15 15 15" stroke={C.red} strokeWidth="5" />
    </g>
    <path d="M333 85v10" strokeWidth="6" />
    {/* Off the pavement, quick. */}
    <Person
      x={196}
      y={96}
      s={0.98}
      turn={14}
      robe
      long
      shirt={C.pink}
      hair={C.orange}
      mood="oh"
      look={-0.5}
      arms={[
        [-30, 2, -34, -16],
        [30, 2, 34, -16],
      ]}
      hat={<path d="M-22-6Q-24-30 0-30T22-6Q26 6 16 14 22-14 0-16-22-14-16 14-26 6-22-6z" fill={C.yellow} />}
    />
    <path d="M188 168q14 8 30 2" strokeOpacity="0.4" strokeWidth="6" />
    <Whoosh d="M24 134H4M30 152H2M26 168H8" />
    <Limb d="M78 148Q68 168 54 182" color={C.white} />
    <path d="M46 188q-1-9 6-9 4 0 5 3 7 0 8 6z" fill={INK} transform="rotate(20 52 184)" />
    <Bike x={104} y={188} s={1.14} color={C.wood} wheel={C.bark} />
    <Person
      x={102}
      y={102}
      s={1}
      turn={10}
      shirt={C.teal}
      pants={C.white}
      shoes={INK}
      hair={C.bark}
      mood="glad"
      look={0.5}
      arms={[
        [2, 30, 24, 24],
        [24, 24, 34, 22],
      ]}
      legs={[
        [0, 40, -6, 44],
        [22, 50, 30, 74],
      ]}
      behind={<path d="M-15 20Q-26 34-34 50l14 2 12-16z" fill={C.teal} />}
      hat={
        <>
          <path d="M-14-16v-30q14-5 28 0v30z" fill={INK} />
          <path d="M-25-15Q0-8 25-15" strokeWidth="6" />
          <path d="M-13-22q13 4 26 0" stroke={C.red} strokeWidth="5" />
        </>
      }
    />
  </Sheet>
);

export const PeachBasket = () => (
  <Sheet>
    <Crayon color="#ffe6bf" />
    <path d="M-10-10H370V30H-10z" fill={C.wood} />
    <path d="M60-10v40M130-10v40M200-10v40M270-10v40" strokeOpacity="0.35" />
    <Ground color={C.wood} edge="M-10 192H370" />
    <path d="M-10 212H370M80 194v18M200 194v18M320 194v18M140 214v30M260 214v30" strokeOpacity="0.35" />
    {/* The basket is nailed to the balcony. */}
    <path d="M196 34h68v58h-68z" fill={C.paper} />
    <path d="M204 66h52l-8 40h-36z" fill={C.tan} />
    <path d="M208 78h44M210 90h40M218 68l4 36M230 68v38M242 68l-4 36" stroke={C.bark} strokeWidth="2.4" />
    <Ball x={230} y={54} r={17} color={C.orange} />
    <path d="M202 66h56" strokeWidth="9" />
    <path d="M202 66h56" stroke={C.wood} strokeWidth="4.5" />
    {/* The caretaker. */}
    <path d="M276 226 300 60M318 226 328 60" strokeWidth="9" />
    <path d="M276 226 300 60M318 226 328 60" stroke={C.yellow} strokeWidth="4.5" />
    <path d="M281 200h38M285 174h36M289 146h34M293 118h32M297 90h30" strokeWidth="6" />
    <Person
      x={306}
      y={96}
      s={1.1}
      turn={-6}
      shirt={C.blue}
      pants={C.slate}
      mood="sad"
      look={-0.5}
      hair={C.grey}
      arms={[
        [-34, -2, -44, -20],
        [26, 18, 18, 24],
      ]}
      legs={[
        [-12, 46, -10, 62],
        [12, 44, 10, 52],
      ]}
      hat={
        <>
          <path d="M-20-6Q-18-27 4-26 22-24 20-6q-30-5-50 3z" fill={C.bark} />
          <path d="M-10 8q5-6 10-1 5-5 10 1-5 3-10 1-5 2-10-1z" fill={C.grey} strokeWidth="1.6" />
        </>
      }
      wear={<path d="M-8 0v14h16V0M-8 14v24h16V14z" fill={C.slate} strokeWidth="2.4" />}
    />
    <Drops at={[[284, 50], [338, 58]]} />
    <Person
      x={54}
      y={124}
      s={1.14}
      shirt={C.white}
      pants={C.red}
      bare
      shoes={INK}
      hair={C.yellow}
      mood="laugh"
      look={0.5}
      arms={[
        [-34, 4, -32, -22],
        [34, 4, 34, -22],
      ]}
    />
    <Person
      x={128}
      y={130}
      s={1.1}
      skin={C.umber}
      shirt={C.teal}
      pants={C.navy}
      bare
      shoes={INK}
      hair={INK}
      mood="happy"
      look={0.6}
      arms={[
        [-26, 18, -26, 28],
        [32, 0, 34, -24],
      ]}
    />
    <Person
      x={206}
      y={146}
      s={0.98}
      skin={C.tan}
      shirt={C.white}
      pants={C.red}
      bare
      shoes={INK}
      hair={C.bark}
      mood="happy"
      arms={[
        [-28, 22, -4, 26],
        [28, 20, 6, 22],
      ]}
    />
    <path d="M86 62l8 6M78 52h10M96 52l-2 10" stroke={C.gold} strokeWidth="4" />
  </Sheet>
);

export const CorporalBear = () => (
  <Sheet>
    <Crayon color="#ffe1b0" />
    <Sun x={52} y={44} />
    <path d="M-10 160 70 90l50 40 60-70 70 70 50-34 80 60v90H-10z" fill="#d9b98a" />
    <Ground color={C.sand} edge="M-10 170Q100 158 200 166T370 162" />
    <path d="M262 160V74l46-28 52 28v96z" fill="#8f9a5b" />
    <path d="M308 46v124M308 170l-22-60M308 170l24-60" strokeOpacity="0.5" />
    <path d="M308 46V18" strokeWidth="5" />
    <path d="M308 18h40v13h-40z" fill={C.white} />
    <path d="M308 31h40v13h-40z" fill={C.red} />
    <Person
      x={304}
      y={142}
      s={1}
      shirt="#b3a15f"
      pants="#8f7f45"
      mood="laugh"
      look={-0.5}
      hair={C.orange}
      arms={[
        [-30, 8, -14, -16],
        [26, 18, 24, 30],
      ]}
      hat={<path d="M-19-8Q-10-28 18-22L22-10Q0-18-19-8z" fill="#8f9a5b" />}
    />
    {/* Wojtek. */}
    <path d="M118 210q-4 12-20 12h40l4-20zM196 210q4 12 20 12h-40l-4-20z" fill={C.brown} />
    <path d="M104 206q-18-70 20-92h66q38 22 20 92-50 16-106 0z" fill={C.brown} />
    <ellipse cx="157" cy="176" rx="34" ry="34" fill={C.tan} />
    <circle cx="116" cy="50" r="17" fill={C.brown} />
    <circle cx="198" cy="50" r="17" fill={C.brown} />
    <circle cx="116" cy="51" r="8" fill={C.tan} stroke="none" />
    <circle cx="198" cy="51" r="8" fill={C.tan} stroke="none" />
    <path d="M157 34q50 0 50 48 0 44-50 44t-50-44q0-48 50-48z" fill={C.brown} />
    <path d="M122 42q32-34 74-12l4 16q-38-18-78 4z" fill="#8f9a5b" />
    <Star x={160} y={31} r={8} color={C.white} />
    <path d="M136 76h0M178 76h0" strokeWidth="9" />
    <g fill={C.pink} stroke="none" opacity="0.75">
      <ellipse cx="122" cy="92" rx="8" ry="6" />
      <ellipse cx="192" cy="92" rx="8" ry="6" />
    </g>
    <ellipse cx="157" cy="100" rx="22" ry="18" fill={C.tan} />
    <ellipse cx="157" cy="91" rx="9" ry="6.5" fill={INK} />
    <path d="M157 98v5q-8 8-14 0M157 103q8 8 14 0" strokeWidth="2.6" />
    <path d="M110 144h94v46h-94z" fill={C.wood} />
    <path d="M110 160h94M110 176h94M122 144v46M192 144v46" stroke={C.bark} />
    <path d="M122 144v46M192 144v46" stroke={C.bark} strokeWidth="5" />
    <Limb d="M110 130Q80 150 104 178" color={C.brown} w={22} />
    <Limb d="M204 130Q234 150 210 178" color={C.brown} w={22} />
    <path d="M96 172l-2 6M103 180l0 7M112 180l4 5M204 180l-3 6M212 182v6M220 176l4 4" strokeWidth="3" />
    <path d="M84 138l10 6 8-10M82 147l11 7 9-11" stroke={C.yellow} strokeWidth="4" />
    <Each at={[[34, 206], [66, 196, 0.7]]}>
      <path d="M-16 8q0-14 14-14t18 14z" fill={C.grey} />
    </Each>
  </Sheet>
);

export const ChristmasMatch = () => (
  <Sheet>
    <Crayon color={C.night} strength={0.1} />
    <Each at={[[28, 30], [84, 18, 0.7], [134, 48, 0.8], [226, 22, 0.8], [282, 46], [336, 20, 0.7]]}>
      <Star x={0} y={0} r={8} />
    </Each>
    <Ground color={C.snow} edge="M-10 152Q80 132 180 146T370 138" />
    <path d="M30 206q40 10 80 0M220 222q50 8 100-2M140 186q20 6 44 0" stroke="#c3d6ee" strokeWidth="5" />
    <g>
      <Fir x={180} y={158} s={1.2} snow />
      <path d="M170 92h0M190 98h0M162 116h0M182 122h0M200 124h0M156 138h0M176 142h0M204 140h0" stroke={C.yellow} strokeWidth="8" />
      <path d="M180 108h0M194 112h0M168 130h0M190 136h0" stroke={C.red} strokeWidth="8" />
      <Star x={180} y={48} r={14} />
    </g>
    <path d="M16 148l6-44M58 150l-5-46M16 106h42" strokeWidth="6" stroke={C.bark} />
    <path d="M304 146l5-42M348 146l-6-42M304 106h44" strokeWidth="6" stroke={C.bark} />
    {/* A German with a scarf. */}
    <Person
      x={88}
      y={128}
      s={1.18}
      turn={6}
      shirt={C.slate}
      pants={C.slate}
      shoes={INK}
      mood="laugh"
      look={0.5}
      hair={C.yellow}
      arms={[
        [-34, 6, -34, -14],
        [32, 6, 34, -12],
      ]}
      legs={[
        [-10, 46, -14, 58],
        [26, 40, 40, 42],
      ]}
      wear={<path d="M0 8h0M0 18h0M0 28h0" stroke={C.yellow} strokeWidth="5" />}
      hat={
        <>
          <path d="M-20-7Q-20-27 0-27T20-7Q0-14-20-7z" fill={C.slate} />
          <path d="M-20-9Q0-16 20-9" stroke={C.red} strokeWidth="5" />
        </>
      }
    >
      <path d="M-14-1Q0 8 14-1" stroke={INK} strokeWidth="12" />
      <path d="M-14-1Q0 8 14-1M-8 4l-6 18" stroke={C.red} strokeWidth="7" />
    </Person>
    {/* A Scot in a kilt, in the wind. */}
    <Person
      x={270}
      y={126}
      s={1.18}
      turn={-6}
      shirt="#b3a15f"
      sleeve="#b3a15f"
      pants={C.skin}
      shoes={INK}
      mood="glad"
      look={-0.5}
      hair={C.orange}
      arms={[
        [-34, 4, -34, -20],
        [34, 4, 34, -20],
      ]}
      legs={[
        [-12, 46, -16, 58],
        [12, 46, 16, 58],
      ]}
      wear={
        <>
          <path d="M0 8h0M0 17h0" stroke={C.yellow} strokeWidth="5" />
          <path d="M-16 26h32q8 12 18 16-4 10-14 12-6-6-12 0-8-6-14 0-8-4-12 0z" fill={C.red} />
          <path d="M-14 38q14 4 40 2M-6 28l-3 24M6 28l3 24M14 30l10 18" stroke={C.navy} strokeWidth="2.6" />
        </>
      }
      hat={
        <>
          <path d="M-22-7Q-22-24 4-26 28-22 22-8 0-16-22-7z" fill={C.navy} />
          <circle cx="4" cy="-27" r="5" fill={C.red} />
        </>
      }
    />
    <Whoosh d="M306 190q14-8 24 0M314 178q12-8 22 0" />
    <Ball x={178} y={194} r={17} color={C.wood} />
    <Whoosh d="M152 188h-12M154 200h-16" />
    <g fill={C.white} stroke="none">
      <Each at={[[52, 60], [110, 84], [148, 22], [214, 76], [250, 60], [318, 78], [24, 84], [300, 18], [66, 98], [346, 60]]}>
        <circle r="3.5" />
      </Each>
    </g>
  </Sheet>
);
