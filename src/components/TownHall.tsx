import { memo, type ReactNode } from 'react';
import { BAYS, CENTER_X, COLUMNS, DOORS, GROUND_Y, VIEW, type Door } from '../advent/townhall';
import { seededRandom } from '../ride/math';

const r1 = (value: number) => Math.round(value * 10) / 10;
const LEFT = 122;
const RIGHT = 2 * CENTER_X - LEFT;

// Draws its children on the left of the building and mirrored on the right.
const BothSides = ({ children }: { children: ReactNode }) => (
  <>
    <g>{children}</g>
    <g transform={`translate(${2 * CENTER_X} 0) scale(-1 1)`}>{children}</g>
  </>
);

// Points as a single path of dots, for a stroke with round caps.
const dots = (points: [x: number, y: number][]) => points.map(([x, y]) => `M${r1(x)} ${r1(y)}h0`).join('');

const Obelisk = ({ x, y, height, width = 7 }: { x: number; y: number; height: number; width?: number }) => (
  <g className="hall-stone hall-stone--light">
    <path d={`M${x - width / 2 - 1.5} ${y}v-7h${width + 3}v7zM${x - width / 2} ${y - 7}L${x - 0.8} ${y - height}h1.6L${x + width / 2} ${y - 7}z`} />
    <circle cx={x} cy={y - height} r="2" />
  </g>
);

/* ---------- the parts of the building ---------- */

function Roof() {
  return (
    <>
      {/* The tower of St. Georg looks over the ridge. */}
      <path className="hall-copper" d="M531 58 510 196h24z" />
      <path className="hall-copper hall-copper--shade" d="M531 58 552 196h-18z" />
      <path className="hall-iron" d="M531 60V30M525 40h12" />
      <circle cx="531" cy="28" r="2.4" fill="#c9a24a" />

      <path fill="url(#hall-slate)" d={`M158 342 228 190H${2 * CENTER_X - 228}L${2 * CENTER_X - 158} 342z`} />
      <path fill="url(#hall-tiles)" d={`M158 342 228 190H${2 * CENTER_X - 228}L${2 * CENTER_X - 158} 342z`} />

      <BothSides>
        {/* Stepped end gable, seen almost edge on, with its chimney. */}
        <path
          className="hall-stone hall-stone--end"
          d="M122 386V318h14v-6q0-18 14-20v-34q0-16 13-18v-30q0-14 12-16h15v-56h-4v-8h50v8h-4v60h-8L164 342v44z"
        />
        <path className="hall-niche" d="M202 190v-24q0-9 9-9t9 9v24z" />
        <path className="hall-line" d="M188 148h44M188 156h44M136 318h28M150 292h30M163 258h30M176 204h30" />
        <Obelisk x={129} y={318} height={52} />
        <Obelisk x={150} y={276} height={40} width={6} />
        <Obelisk x={170} y={228} height={54} width={6} />
        {/* Lion, weathervane and the lattice that braces it. */}
        <path className="hall-figure" d="M200 130q-2-16 6-22 3-8 9-4 5 3 2 9 5 8 2 17z" />
        <path className="hall-iron" d="M207 128V22M202 92h10M200 78h14M202 64h10M207 54l-5-5 5-5 5 5zM214 96 296 190M220 92 301 186M226 112l8-6M240 128l8-6M254 144l8-6M268 160l8-6M222 108l14 82M250 138l6 52" />
      </BothSides>
      {[207, 2 * CENTER_X - 207].map((x) => (
        <g key={x} transform={`translate(${x} 34)`}>
          <path className="hall-vane" d="M-9 0h10v-5q10 4 20-1l-4 6 4 6q-10-5-20-1V0z" />
        </g>
      ))}

      {/* Balustrade with the string of lights along the eaves. */}
      <path fill="#0d0c12" d={`M140 340H${2 * CENTER_X - 140}V380H140z`} />
      <BothSides>
        <path className="hall-stone hall-stone--light" d={Array.from({ length: 13 }, (_, i) => `M${146 + i * 24.6} 344h12l-3 36h-6z`).join('')} />
        <path className="hall-stone hall-stone--light" d="M136 338h324v6H136z" />
        <path className="led__halo led--on" d="M142 337H456" />
        <path className="led__tube led--on" d="M142 337H456" />
      </BothSides>
    </>
  );
}

function Gable() {
  return (
    <g className="hall-gable">
      <rect x="454" y="286" width="220" height="100" fill="#7d493a" />
      <rect x="454" y="286" width="220" height="100" fill="url(#hall-brick)" />
      <BothSides>
        <path className="hall-stone" d="M454 286h12v100h-12z" />
        {/* Scroll where the gable meets the eaves, with a figure on its end. */}
        <path className="hall-stone hall-stone--light" d="M454 380h-40q-2-16 12-16 8 0 8 8 16-6 14-40l6-4z" />
        <path className="hall-figure hall-figure--lit" d="M414 366q-5-20 1-28 3-7 7 0 6 8 2 28z" />
      </BothSides>
      <path className="hall-stone" d="M556 286h16v100h-16z" />
      <path className="hall-belt" d="M466 332h90v4h-90zM572 332h90v4h-90z" />

      {/* Relief, scrolls and crowning niche. */}
      <path className="hall-stone hall-stone--light" d="M446 276h236v10H446z" />
      <path className="hall-stone hall-stone--light" d="M452 284v-8q-6-28 14-28 12 0 12 10 22-10 22-44h128q0 34 22 44 0-10 12-10 20 0 14 28v8z" />
      <path className="hall-stone" d="M506 222h116v50H506z" />
      <path className="hall-relief" d="M514 264q4-22 16-24 8 2 10 10 6-16 18-18 10 0 12 12 8-14 18-10 8 2 8 12 10-8 14 4l2 14zM530 236a5 5 0 1 0 .1 0M562 228a5 5 0 1 0 .1 0M592 232a5 5 0 1 0 .1 0" />
      <BothSides>
        <path className="hall-relief" d="M472 272a9 9 0 1 1 1-13M478 264q18-10 20-34M524 198a7 7 0 1 1 1-9M530 188q6-8 6-22" />
      </BothSides>
      <path className="hall-stone hall-stone--light" d="M496 206h136v9H496z" />
      <path className="hall-stone hall-stone--light" d="M506 206q-6-22 10-22 8 0 8 7 10-8 8-38h64q-2 30 8 38 0-7 8-7 16 0 10 22z" />
      <path className="hall-stone" d="M542 162h44v40h-44z" />
      <path className="hall-relief" d="M552 200v-20q0-12 12-12t12 12v20z" />
      <path className="hall-stone hall-stone--light" d="M526 148h76v7h-76zM538 148v-8q0-24 26-24t26 24v8z" />
      <path className="hall-line" d="M446 281h236M496 211h136M526 152h76" />
      <path className="hall-stone hall-stone--light" d="M555 118v-10h18v10z" />
      {/* Justitia, with sword and scales. */}
      <path className="hall-figure" d="M556 108 559 84q-3-8 1-11 1-8 4-8t4 8q4 3 1 11l3 24zM566 78l12-6-1-2-12 4zM562 76l-11 6 1 2 11-4z" />
      <path className="hall-iron hall-iron--thin" d="M577 80V54M551 84v6M546 92q5 5 10 0M551 88l-5 4M551 88l5 4" />
      <Obelisk x={511} y={206} height={56} width={6} />
      <Obelisk x={617} y={206} height={56} width={6} />
      <Obelisk x={459} y={276} height={50} width={6} />
      <Obelisk x={669} y={276} height={50} width={6} />
    </g>
  );
}

// Stone surround and sill of a window, with a brick arch above it where the floor is high enough.
function Surround({ door }: { door: Door }) {
  const { x, y, width, height, kind } = door;
  const w = width / 2;
  const arch = y < 700 && y > 400;
  const sill = kind === 'arched' ? 5 : 8;
  return (
    <g>
      {kind === 'arched' ? (
        <path className="hall-stone hall-stone--light" d={`M${x - w - 4} ${y + height + 3}V${y + w}A${w + 4} ${w + 4} 0 0 1 ${x + w + 4} ${y + w}V${y + height + 3}z`} />
      ) : (
        <path className="hall-stone hall-stone--light" d={`M${x - w - 5} ${y - 5}h${width + 10}v${height + 8}h${-width - 10}z`} />
      )}
      {arch && kind !== 'arched' && (
        <>
          <path className="hall-arch" d={`M${x - 40} ${y - 6}q40 -26 80 0l-6 -2q-34 -14 -68 0z`} />
          <path className="hall-arch hall-arch--stroke" d={`M${x - 38} ${y - 9}q38 -22 76 0`} />
          <path className="hall-stone hall-stone--light" d={`M${x - 6} ${y - 24}h12l-2 14h-8zM${x - 45} ${y - 5}q2 -11 14 -10l-4 10zM${x + 45} ${y - 5}q-2 -11 -14 -10l4 10z`} />
        </>
      )}
      <path className="hall-stone hall-stone--sill" d={`M${x - w - sill} ${y + height + 3}h${width + sill * 2}v4h${-width - sill * 2}z`} />
    </g>
  );
}

function Floors() {
  return (
    <>
      <rect x={LEFT} y="386" width={RIGHT - LEFT} height="278" fill="#7d493a" />
      <rect x={LEFT} y="386" width={RIGHT - LEFT} height="278" fill="url(#hall-brick)" />
      <path className="hall-belt" d={[444, 572].map((y) => `M148 ${y}H980v4H148z`).join('')} />
      <path className="hall-stone hall-stone--end" d={`M${LEFT} 386h26v278h-26zM${RIGHT - 26} 386h26v278h-26z`} />
      <path className="hall-quoin" d={Array.from({ length: 11 }, (_, i) => `M129 ${396 + i * 24}h11v9h-11zM${RIGHT - 18} ${396 + i * 24}h11v9h-11z`).join('')} />
      {COLUMNS.map((x) => (
        <g key={x} className="hall-stone hall-stone--light">
          <path d={`M${x - 6} 386h12v104h-12zM${x - 8} 398h16v8h-16zM${x - 6} 502h12v120h-12zM${x - 9} 514h18v10h-18zM${x - 8} 612h16v10h-16zM${x - 6} 636h12v28h-12z`} />
        </g>
      ))}
      {BAYS.map((x) => (
        <path key={x} className="hall-stone" d={`M${x - 5} 636h10v28h-10z`} />
      ))}
      <path className="hall-stone hall-stone--light" d={`M116 378H${RIGHT + 6}v9H116zM118 490H${RIGHT + 4}v11H118zM118 624H${RIGHT + 4}v12H118zM118 662H${RIGHT + 4}v8H118z`} />
      <path className="hall-line" d={`M116 384H${RIGHT + 6}M118 497H${RIGHT + 4}M118 631H${RIGHT + 4}`} />
    </>
  );
}

const ARCH = (x: number) => `M${x - 42} ${GROUND_Y}V720A42 44 0 0 1 ${x + 42} 720V${GROUND_Y}z`;

function Arcade() {
  return (
    <>
      <path className="hall-stone hall-stone--end" d={`M${LEFT} 668H${RIGHT}V${GROUND_Y}H${LEFT}z`} />
      {BAYS.map((x) => (
        <g key={x}>
          <path fill="url(#hall-loggia)" d={ARCH(x)} />
          {/* Vault, and the sandstone base of the wall behind the arcade. */}
          <path fill="#7a6748" opacity="0.5" d={`M${x - 42} 720A42 44 0 0 1 ${x + 42} 720Q${x} 690 ${x - 42} 720z`} />
          <path className="hall-wainscot" d={`M${x - 42} 800h84v40h-84z`} />
        </g>
      ))}

      {/* The portal, the plain door and the notice board in the bays without a window. */}
      {[512, 720].map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <path className="hall-stone hall-stone--light" d="M-36 734h72v106h-72z" />
          <path fill="#2a1a15" d="M-28 742h56v98h-56z" />
          <path className="hall-panel" d="M-24 748h22v34h-22zM2 748h22v34h-22zM-24 788h22v46h-22zM2 788h22v46h-22zM-24 748l22 34M-2 748l-22 34M2 748l22 34M24 748l-22 34M-24 788l22 46M-2 788l-22 46M2 788l22 46M24 788l-22 46" />
          <path className="hall-overlight" d="M-22 714h44v18h-44z" />
        </g>
      ))}
      <path fill="#6f4d2c" d="M894 742h68v98h-68zM900 742q28-26 56 0z" />
      <path fill="#d9dfd2" opacity="0.85" d="M902 758h52v42h-52z" />
      <path fill="#6f4d2c" d="M927 758h2v42h-2zM906 764h16v12h-16zM934 768h14v20h-14z" opacity="0.5" />

      {COLUMNS.map((x) => (
        <g key={x}>
          <path className="hall-stone hall-stone--light" d={`M${x - 8} 700h16v100h-16zM${x - 11} 694h22v9h-22zM${x - 10} 668h20v26h-20zM${x - 13} 798h26v42h-26zM${x - 15} 798h30v6h-30z`} />
          <path className="hall-relief" d={`M${x - 5} 752h10v36h-10z`} />
          <path className="hall-shade" d={`M${x + 3} 703h5v95h-5zM${x + 8} 804h5v36h-5z`} />
        </g>
      ))}
      {BAYS.map((x) => (
        <g key={x}>
          <path className="hall-arch hall-arch--stone" d={`M${x - 42} 722A42 44 0 0 1 ${x + 42} 722`} />
          <path className="hall-stone hall-stone--light" d={`M${x - 5} 666h10l-2 14h-6z`} />
        </g>
      ))}
    </>
  );
}

// Fir garlands hung across the arches.
const GARLAND_LIGHTS = dots(
  BAYS.flatMap((x) => Array.from({ length: 12 }, (_, i): [number, number] => [x - 38 + i * 6.9, 709 + Math.abs(i - 5.5) * -0.9 + (i % 2) * 3])),
);

function Garlands() {
  return (
    <>
      <path className="hall-garland" d={BAYS.map((x) => `M${x - 41} 705q41 12 82 0`).join('')} />
      <path className="fairy fairy--halo" d={GARLAND_LIGHTS} />
      <path className="fairy" d={GARLAND_LIGHTS} />
    </>
  );
}

/* ---------- the Christmas tree ---------- */

// A tree 480 high, standing at 0,0.
const TREE_HEIGHT = 480;
const TIERS = 11;
const treeHalfWidth = (y: number) => 14 + Math.pow(Math.max(0, (y + TREE_HEIGHT) / (TREE_HEIGHT - 60)), 0.86) * 128;

const TREE = (() => {
  const random = seededRandom(2412);
  const tiers = Array.from({ length: TIERS }, (_, tier) => {
    const top = -TREE_HEIGHT + tier * 35 - 6;
    const bottom = -TREE_HEIGHT + 62 + tier * 36.5;
    const half = treeHalfWidth(bottom) * (0.95 + random() * 0.1);
    const steps = 6 + tier * 2;
    let d = `M0 ${r1(top)}L${r1(half)} ${r1(bottom)}`;
    // A ragged hem of hanging twigs.
    for (let i = 1; i < steps; i++) {
      const x = half - (i / steps) * 2 * half;
      const sag = bottom + 10 * (1 - Math.abs(x) / half);
      d += `L${r1(x + half / steps)} ${r1(sag - 9 - random() * 7)}L${r1(x)} ${r1(sag + random() * 6)}`;
    }
    return `${d}L${r1(-half)} ${r1(bottom)}z`;
  }).reverse();
  // Lights come in four strings that twinkle one after the other.
  const strings: [number, number][][] = [[], [], [], []];
  for (let i = 0; i < 560; i++) {
    const y = -TREE_HEIGHT + 14 + Math.pow(random(), 0.6) * (TREE_HEIGHT - 72);
    const x = (random() * 2 - 1) * treeHalfWidth(y) * 0.9;
    strings[i % strings.length]!.push([x, y]);
  }
  const baubles = Array.from({ length: 9 }, (_, i): [number, number] => [-104 + i * 26 + random() * 12, -88 + random() * 34]);
  return { tiers, strings: strings.map(dots), baubles: dots(baubles) };
})();

function Tree() {
  return (
    <g className="hall-tree">
      <ellipse cx="0" cy="2" rx="150" ry="12" fill="#06080c" opacity="0.55" />
      <path fill="#2a1c14" d="M-11 4V-70H11V4z" />
      {TREE.tiers.map((d, index) => (
        <path key={d} d={d} fill={index % 2 ? '#12241b' : '#0e1d17'} />
      ))}
      <ellipse cx="0" cy="-170" rx="104" ry="210" fill="url(#hall-treeglow)" />
      {TREE.strings.map((d, index) => (
        <g key={d} className="fairy-string" style={{ animationDelay: `${index * -1.3}s` }}>
          <path className="fairy fairy--halo" d={d} />
          <path className="fairy" d={d} />
        </g>
      ))}
      <path className="bauble bauble--halo" d={TREE.baubles} />
      <path className="bauble" d={TREE.baubles} />
      <g transform={`translate(0 ${-TREE_HEIGHT - 12})`}>
        <circle r="34" fill="url(#hall-starglow)" />
        <path className="hall-star" d="M0-17 4.6-6.2 15-9 8.6 0 15 9 4.6 6.2 0 17-4.6 6.2-15 9-8.6 0-15-9-4.6-6.2z" />
      </g>
    </g>
  );
}

/* ---------- the square around it ---------- */

function Neighbours() {
  return (
    <>
      <path
        className="hall-neighbours"
        d="M-1700 860V700l90-60 90 60v30h70v-50l70-60 80 60v60h120v-70h150v60l90-70 80 70v30h110v-70l64-70 66 70v50h90v-34l70-64 64 64v24h40V860z"
      />
      <path className="hall-neighbours" d="M1000 860V760h70v-40l60-56 70 56v34h110v-60h130v40l80-70 90 70v40h120v-60l80-66 80 66v70h120v-80h140v100h300V860z" />
      <path className="hall-neighbours__light" d="M-1620 730h16v22h-16zM-1560 780h16v22h-16zM-1380 760h16v22h-16zM-1150 752h16v22h-16zM-1110 752h16v22h-16zM-820 784h14v22h-14zM-640 770h14v22h-14zM-470 742h14v22h-14zM1130 712h14v22h-14zM1158 712h14v22h-14zM1560 740h14v22h-14zM1840 730h14v22h-14z" />
      {/* Bare lime trees. */}
      <path
        className="hall-branches"
        d="M-330 850V700M-330 760l-44-60M-330 740l40-66M-330 712l-22-60M-330 704l26-62M-352 730l-34-10M-308 706l30-14M-374 700l-12-34M-290 674l12-40M1420 850V690M1420 750l-46-62M1420 730l42-70M1420 704l-20-64M1420 694l26-66M1396 716l-34-8M1444 690l32-14"
      />
      {/* The Christmas market in the Ravardiviertel, round the corner. */}
      <g>
        <path className="hall-iron" d="M1006 630Q1200 652 1420 626" />
        <text className="led__halo led--on hall-sign" x="1076" y="664">
          RAVARDIVIERTEL
        </text>
        <text className="led__tube led--on hall-sign" x="1076" y="664">
          RAVARDIVIERTEL
        </text>
        {[1046, 1156, 1266].map((x, index) => (
          <g key={x}>
            <path fill="url(#hall-stall)" d={`M${x} 786h92v56h-92z`} />
            <path fill={index % 2 ? '#35201c' : '#1f2c26'} d={`M${x - 8} 788l18-30h72l18 30z`} />
            <path className="fairy" d={dots(Array.from({ length: 11 }, (_, i): [number, number] => [x - 4 + i * 10, 790 + (i % 2) * 3]))} />
            <path fill="#2b1a12" d={`M${x} 822h92v20h-92z`} />
          </g>
        ))}
      </g>
    </>
  );
}

// Everything but the doors, which the page lays over it as buttons.
function TownHall() {
  return (
    <svg className="hall__drawing" viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`} aria-hidden="true">
      <defs>
        <pattern id="hall-brick" width="10" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 .5H10M0 4.5H10M2 .5v4M7 4.5v4" stroke="#b58a72" strokeOpacity="0.34" strokeWidth="0.8" />
        </pattern>
        <pattern id="hall-tiles" width="10" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 8.5q2.5-3 5 0t5 0" fill="none" stroke="#5c6078" strokeOpacity="0.28" />
        </pattern>
        <linearGradient id="hall-slate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12121c" />
          <stop offset="1" stopColor="#22202a" />
        </linearGradient>
        <linearGradient id="hall-loggia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3b27c" />
          <stop offset="0.5" stopColor="#d8c78f" />
          <stop offset="1" stopColor="#8f7a50" />
        </linearGradient>
        <linearGradient id="hall-stall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9ae" />
          <stop offset="1" stopColor="#d9822f" />
        </linearGradient>
        <linearGradient id="hall-square" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2f2c" />
          <stop offset="0.35" stopColor="#1c1a20" />
          <stop offset="1" stopColor="#0e131b" />
        </linearGradient>
        <linearGradient id="hall-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120f2c" stopOpacity="0.34" />
          <stop offset="0.7" stopColor="#120f2c" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hall-treeglow">
          <stop offset="0" stopColor="#ffcf6a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffcf6a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hall-starglow">
          <stop offset="0" stopColor="#ff9a5c" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ff5b2e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hall-pool">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.34" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hall-room" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.6" stopColor="#ffc24d" />
          <stop offset="1" stopColor="#e58a1f" />
        </radialGradient>
      </defs>

      <Neighbours />
      <Roof />
      <Gable />
      <Floors />
      <Arcade />
      {DOORS.map((door) => (
        <Surround key={door.day} door={door} />
      ))}
      {/* The floodlights on the square fade out towards the eaves. */}
      <path fill="url(#hall-dusk)" d={`M${LEFT} 386H${RIGHT}V${GROUND_Y}H${LEFT}z`} />
      <Garlands />

      <path fill="url(#hall-square)" d={`M-2000 ${GROUND_Y}H3200V${GROUND_Y + 700}H-2000z`} />
      <path fill="#4b3f38" d={`M108 ${GROUND_Y}H${2 * CENTER_X - 108}v6H108z`} />
      {BAYS.map((x) => (
        <ellipse key={x} cx={x} cy={GROUND_Y + 14} rx="50" ry="16" fill="url(#hall-pool)" />
      ))}
      <Tree />
    </svg>
  );
}

export default memo(TownHall);
