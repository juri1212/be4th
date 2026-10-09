import { clamp } from '../ride/math';

// Gravel bike + rider in centimetres, drive side, facing right. Origin sits on the
// hub line between both axles; the whole group is lifted by the wheel radius.
export const WHEEL_RADIUS = 33.5;
export const WHEELBASE = 99;

const REAR = [-49.5, 0];
const FRONT = [49.5, 0];
const BB = [-8, 7];
const SEAT_TOP = [-22.2, -41];
const SADDLE = [-27.6, -59.2];
const HEAD_TOP = [31.5, -48];
const HEAD_BOTTOM = [35.6, -34.6];
const HIP = [-25, -67];
const SHOULDER = [18, -100];
const HOOD = [47.5, -55];
const CRANK = 17;
const THIGH = 44;
const SHIN = 44;
const UPPER_ARM = 29;
const FOREARM = 27.5;
const SPOKES = Array.from({ length: 10 }, (_, i) => (i * Math.PI) / 10);

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const along = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const n = (value) => Math.round(value * 100) / 100;
const pt = (p) => `${n(p[0])} ${n(p[1])}`;

// Two-bone inverse kinematics; `pick` chooses which way the joint bends.
function solveJoint(origin, target, upper, lower, pick) {
  const dx = target[0] - origin[0];
  const dy = target[1] - origin[1];
  const distance = clamp(Math.hypot(dx, dy), Math.abs(upper - lower) + 0.01, upper + lower - 0.01);
  const heading = Math.atan2(dy, dx);
  const bend = Math.acos(clamp((upper * upper + distance * distance - lower * lower) / (2 * upper * distance), -1, 1));
  const a = [origin[0] + upper * Math.cos(heading + bend), origin[1] + upper * Math.sin(heading + bend)];
  const b = [origin[0] + upper * Math.cos(heading - bend), origin[1] + upper * Math.sin(heading - bend)];
  const end = [origin[0] + distance * Math.cos(heading), origin[1] + distance * Math.sin(heading)];
  return [pick(a, b), end];
}

// `caps` rounds either end; open ends let kit overlays (hems, cuffs, socks) stay square.
function Limb({ from, to, width: [w1, w2], fill, caps = [true, true] }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const d = `M${pt([from[0] + (nx * w1) / 2, from[1] + (ny * w1) / 2])}L${pt([to[0] + (nx * w2) / 2, to[1] + (ny * w2) / 2])}L${pt([to[0] - (nx * w2) / 2, to[1] - (ny * w2) / 2])}L${pt([from[0] - (nx * w1) / 2, from[1] - (ny * w1) / 2])}Z`;
  return (
    <g fill={fill}>
      <path d={d} />
      {caps[0] && <circle cx={n(from[0])} cy={n(from[1])} r={w1 / 2} />}
      {caps[1] && <circle cx={n(to[0])} cy={n(to[1])} r={w2 / 2} />}
    </g>
  );
}

// Black bibs to just above the knee, tall white socks with a logo, white BOA shoes.
function Leg({ hip, crankAngle, kit }) {
  const pedal = [BB[0] + CRANK * Math.cos(crankAngle), BB[1] + CRANK * Math.sin(crankAngle)];
  const ankleTarget = add(pedal, [-8, -6.5]);
  const [knee, ankle] = solveJoint(hip, ankleTarget, THIGH, SHIN, (a, b) => (a[0] > b[0] ? a : b));
  const heel = add(ankle, [-3.5, 3]);
  const toe = add(pedal, [8.5, 0.5]);
  return (
    <g>
      <Limb from={hip} to={knee} width={[14.5, 10.5]} fill={kit.skin} />
      <Limb from={hip} to={along(hip, knee, 0.8)} width={[14.5, 11.3]} fill={kit.bib} caps={[true, false]} />
      <Limb from={knee} to={ankle} width={[10, 6]} fill={kit.skin} />
      <Limb from={along(ankle, knee, 0.5)} to={ankle} width={[8, 6]} fill={kit.sock} caps={[false, true]} />
      <circle cx={n(along(ankle, knee, 0.3)[0])} cy={n(along(ankle, knee, 0.3)[1])} r="1.3" fill="none" stroke={kit.parts} strokeWidth="0.7" />
      <Limb from={heel} to={toe} width={[7, 4.5]} fill={kit.shoe} />
      <circle cx={n(along(heel, toe, 0.45)[0])} cy={n(along(heel, toe, 0.45)[1] - 1.6)} r="1.2" fill={kit.parts} />
      <path d={`M${pt(add(heel, [0, 3.2]))}L${pt(add(toe, [-1, 2.1]))}`} stroke={kit.parts} strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}

function Crank({ angle, stroke }) {
  const pedal = [BB[0] + CRANK * Math.cos(angle), BB[1] + CRANK * Math.sin(angle)];
  return (
    <g stroke={stroke} strokeLinecap="round">
      <path d={`M${pt(BB)}L${pt(pedal)}`} strokeWidth="3.4" />
      <path d={`M${pt(add(pedal, [-4.5, 0]))}L${pt(add(pedal, [4.5, 0]))}`} strokeWidth="2.6" />
    </g>
  );
}

// Short sleeve with a striped cuff, bare forearm, red mitts. The jersey is
// asymmetric: charcoal with a red cuff on the right, green on the left.
function Arm({ shoulder, hand, kit, sleeve, cuff, stripe }) {
  const [elbow, wrist] = solveJoint(shoulder, hand, UPPER_ARM, FOREARM, (a, b) => (a[1] > b[1] ? a : b));
  const hem = along(shoulder, elbow, 0.58);
  return (
    <g>
      <Limb from={shoulder} to={elbow} width={[10, 7.5]} fill={kit.skin} />
      <Limb from={elbow} to={wrist} width={[7, 5.5]} fill={kit.skin} />
      <Limb from={shoulder} to={hem} width={[10.6, 9.1]} fill={sleeve} caps={[true, false]} />
      <Limb from={along(shoulder, elbow, 0.4)} to={hem} width={[9.4, 9.1]} fill={cuff} caps={[false, false]} />
      <Limb from={along(shoulder, elbow, 0.47)} to={along(shoulder, elbow, 0.51)} width={[9.3, 9.2]} fill={stripe} caps={[false, false]} />
      <Limb from={along(wrist, elbow, 0.2)} to={wrist} width={[6, 5.5]} fill={kit.glove} caps={[false, false]} />
      <circle cx={n(wrist[0])} cy={n(wrist[1])} r="3.9" fill={kit.glove} />
    </g>
  );
}

// White helmet with big black vents, pink shield shades, a grin, and blond
// hair blowing back from under the helmet.
function Head({ hx, hy, kit }) {
  const p = (dx, dy) => `${n(hx + dx)} ${n(hy + dy)}`;
  return (
    <g>
      <path d={`M${p(-11, -2.5)}C${p(-17, -4.5)} ${p(-23, -4)} ${p(-28, -1.5)}C${p(-24, -0.5)} ${p(-21, 1.5)} ${p(-19.5, 3.5)}C${p(-16, 2.5)} ${p(-12.5, 3)} ${p(-9, 2)}Z`} fill={kit.hair} />
      <path d={`M${p(-14, 0)}C${p(-18, 0)} ${p(-21, 1.5)} ${p(-23, 4.5)}C${p(-19, 4)} ${p(-15, 4.5)} ${p(-11, 3)}Z`} fill={kit.hair} />
      <circle cx={hx} cy={hy} r="9.6" fill={kit.skin} />
      <path d={`M${p(5, -7)}L${p(9.8, -2)}L${p(10.4, 1)}L${p(12.4, 4.2)}L${p(10.4, 5.2)}L${p(11, 6)}L${p(10.6, 8.4)}L${p(9.8, 10.2)}L${p(6, 11.2)}L${p(0, 9)}Z`} fill={kit.skin} />
      <path d={`M${p(11, 6)}L${p(8.2, 7)}L${p(10.6, 8.4)}Z`} fill={kit.mouth} />
      <path d={`M${p(10.9, 6.2)}L${p(8.8, 6.9)}`} stroke={kit.teeth} strokeWidth="0.7" />
      <path d={`M${p(-3.5, 1.5)}L${p(4.5, 10.4)}`} stroke={kit.vent} strokeWidth="0.9" />
      <path
        d={`M${p(12.4, 0)}C${p(13, -9.5)} ${p(6.5, -15.5)} ${p(-2, -15.5)}C${p(-10.5, -15.5)} ${p(-16.5, -9)} ${p(-15.5, -0.5)}C${p(-15.2, 2)} ${p(-13, 2.8)} ${p(-11, 2)}C${p(-5, -1)} ${p(4, -2.6)} ${p(12.4, 0)}Z`}
        fill={kit.helmet}
      />
      <g fill={kit.vent}>
        <path d={`M${p(4, -12.8)}C${p(7, -11.5)} ${p(9, -9)} ${p(9.6, -6)}L${p(6.4, -5.6)}C${p(5.8, -8.4)} ${p(4.6, -10.4)} ${p(2.6, -11.6)}Z`} />
        <path d={`M${p(-1.5, -13.6)}C${p(1.5, -13)} ${p(3.6, -10.5)} ${p(4.2, -5.2)}L${p(1.2, -4.6)}C${p(0.6, -8.6)} ${p(-0.6, -10.6)} ${p(-2.6, -11.6)}Z`} />
        <path d={`M${p(-7.5, -12.4)}C${p(-4.5, -11.6)} ${p(-2.6, -9)} ${p(-1.9, -4.2)}L${p(-4.8, -3.6)}C${p(-5.4, -7.4)} ${p(-6.6, -9.6)} ${p(-8.8, -10.6)}Z`} />
        <path d={`M${p(-12.4, -8.6)}C${p(-9.6, -7.8)} ${p(-8.2, -5.6)} ${p(-7.8, -2.6)}L${p(-10.6, -1.6)}C${p(-11, -4.2)} ${p(-12, -6)} ${p(-13.6, -6.8)}Z`} />
      </g>
      <path d={`M${p(-11, 2)}C${p(-5, -1)} ${p(4, -2.6)} ${p(12.4, 0)}`} fill="none" stroke={kit.vent} strokeWidth="0.9" />
      <path d={`M${p(1.5, 0)}L${p(12, -0.4)}C${p(12.4, 2.6)} ${p(11.2, 3.8)} ${p(9, 3.9)}L${p(4.5, 4)}C${p(2.6, 3.8)} ${p(1.6, 2.4)} ${p(1.5, 0)}Z`} fill="url(#riderLens)" />
      <path d={`M${p(1.8, 0.6)}L${p(-4, 1)}`} stroke={kit.vent} strokeWidth="1.1" />
    </g>
  );
}

// Flat back, slight chest and belly, rounded at hip and shoulder.
function torsoPath(hip, shoulder) {
  const dx = shoulder[0] - hip[0];
  const dy = shoulder[1] - hip[1];
  const length = Math.hypot(dx, dy);
  const up = [dy / length, -dx / length];
  const mid = [(hip[0] + shoulder[0]) / 2, (hip[1] + shoulder[1]) / 2];
  const at = (p, k) => pt([p[0] + up[0] * k, p[1] + up[1] * k]);
  return `M${at(hip, 10.5)}Q${at(mid, 12.5)} ${at(shoulder, 8.5)}A8.5 8.5 0 0 1 ${at(shoulder, -8.5)}Q${at(mid, -10)} ${at(hip, -9.5)}A10 10 0 0 1 ${at(hip, 10.5)}Z`;
}

// Points along the torso: `t` from hip to shoulder, `k` towards the back.
function torsoFrame(hip, shoulder) {
  const dx = shoulder[0] - hip[0];
  const dy = shoulder[1] - hip[1];
  const length = Math.hypot(dx, dy);
  const up = [dy / length, -dx / length];
  return (t, k) => {
    const base = along(hip, shoulder, t);
    return pt([base[0] + up[0] * k, base[1] + up[1] * k]);
  };
}

// Green panel wrapping round the front of the chest from the left shoulder.
function panelPath(hip, shoulder) {
  const at = torsoFrame(hip, shoulder);
  return `M${at(0.5, -20)}L${at(0.62, -3)}Q${at(0.85, 1)} ${at(1.1, 2)}L${at(1.3, -20)}Z`;
}

// Big white lettering across the side of the jersey, drawn along the torso
// from the hip (local x) with the back towards -y.
// "RC77" in stroked block letters.
const LETTERING = 'M0 2V-5H2.6Q4.2 -5 4.2 -3.2Q4.2 -1.4 2.6 -1.4H0M2.4 -1.4L4.4 2' +
  'M10.8 -4.2Q9.8 -5 8.8 -5Q6.6 -5 6.6 -1.5Q6.6 2 8.8 2Q9.8 2 10.8 1.2' +
  'M12.8 -5H17L14 2' +
  'M19.2 -5H23.4L20.4 2';
function Lettering({ hip, shoulder, fill }) {
  const angle = (Math.atan2(shoulder[1] - hip[1], shoulder[0] - hip[0]) * 180) / Math.PI;
  return (
    <g transform={`translate(${pt(hip)}) rotate(${n(angle)}) translate(11 -0.5)`}>
      <path d={LETTERING} fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

// Gravel wheel: dark rim, worn grey sidewall and a fine tread that rolls with the wheel.
function Wheel({ center, angle, tire, sidewall, rim, spoke, decal }) {
  const [cx, cy] = center;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={WHEEL_RADIUS - 2.2} fill="none" stroke={tire} strokeWidth="4.4" />
      <circle r={WHEEL_RADIUS - 4.3} fill="none" stroke={sidewall} strokeWidth="1.1" />
      <circle r="28.2" fill="none" stroke={rim} strokeWidth="3.4" />
      <g transform={`rotate(${n((angle * 180) / Math.PI)})`}>
        <circle r={WHEEL_RADIUS - 0.2} fill="none" stroke={tire} strokeWidth="1.1" strokeDasharray="1.1 1.4" />
        {SPOKES.map((a) => (
          <path
            key={a}
            d={`M${n(-25.8 * Math.cos(a))} ${n(-25.8 * Math.sin(a))}L${n(25.8 * Math.cos(a))} ${n(25.8 * Math.sin(a))}`}
            stroke={spoke}
            strokeWidth="0.45"
          />
        ))}
        <path d="M-28.6 0A28.6 28.6 0 0 1 -20.2 -20.2M28.6 0A28.6 28.6 0 0 1 20.2 20.2" fill="none" stroke={decal} strokeWidth="1.5" />
      </g>
      <circle r="2.6" fill={rim} />
    </g>
  );
}

export default function Rider({ distance, kit, kitFar, spoke, decal, tailLight }) {
  const wheelAngle = distance / WHEEL_RADIUS;
  const crankAngle = wheelAngle / 2.4;
  const bob = Math.sin(crankAngle * 2);
  const hip = add(HIP, [0, bob * 0.35]);
  const shoulder = add(SHOULDER, [bob * 0.3, bob * 0.8]);
  const head = add(shoulder, [16.5, -4]);
  const [hx, hy] = head;
  const torso = torsoPath(hip, shoulder);

  return (
    <g>
      {/* Far side */}
      <Crank angle={crankAngle + Math.PI} stroke={kitFar.parts} />
      <Leg hip={add(hip, [1, -1])} crankAngle={crankAngle + Math.PI} kit={kitFar} />
      <Arm shoulder={add(shoulder, [-1.5, -1])} hand={add(HOOD, [-2, -1])} kit={kitFar} sleeve={kitFar.panel} cuff={kitFar.panelCuff} stripe={kitFar.panel} />

      <Wheel center={REAR} angle={wheelAngle} tire={kit.tire} sidewall={kit.sidewall} rim={kit.rim} spoke={spoke} decal={decal} />
      <Wheel center={FRONT} angle={wheelAngle} tire={kit.tire} sidewall={kit.sidewall} rim={kit.rim} spoke={spoke} decal={decal} />

      {/* Bottles */}
      <g transform="translate(-10.1 -15.9) rotate(-106.5)">
        <rect x="-9" y="-3.6" width="18" height="7.2" rx="2.4" fill={kit.parts} />
      </g>
      <g transform="translate(10 -10.2) rotate(-44)">
        <rect x="-9.5" y="-8.6" width="19" height="7.4" rx="2.4" fill={kit.bottle} />
        <rect x="9" y="-6.8" width="2.4" height="3.8" rx="0.8" fill={kit.parts} />
      </g>

      {/* Frame */}
      <g fill="none" stroke={kit.frame} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${pt(BB)}L${pt(REAR)}`} strokeWidth="2.6" />
        <path d={`M${pt(add(SEAT_TOP, [-0.6, 3.5]))}L${pt(REAR)}`} strokeWidth="2.2" />
        <path d={`M${pt(BB)}L${pt(SEAT_TOP)}`} strokeWidth="3.8" />
        <path d={`M${pt(SEAT_TOP)}L${pt(HEAD_TOP)}`} strokeWidth="3.4" />
        <path d={`M${pt(BB)}L${pt(HEAD_BOTTOM)}`} strokeWidth="4.6" />
        <path d={`M${pt(HEAD_TOP)}L${pt(HEAD_BOTTOM)}`} strokeWidth="5" />
        <path d={`M${pt(HEAD_BOTTOM)}Q41.5 -14 ${pt(FRONT)}`} strokeWidth="3" />
      </g>
      <g fill="none" stroke={kit.parts} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${pt(SEAT_TOP)}L${pt(SADDLE)}`} strokeWidth="2.6" />
        <path d="M31 -50L40.5 -51.5" strokeWidth="3.2" />
        <path d="M40.5 -51.5L45.5 -52C50 -52.5 53 -49.5 52.5 -45C52 -40.5 48.5 -38.5 44 -39.5" strokeWidth="2.4" />
        <path d="M45.5 -52.5C48 -56.5 51 -55.5 50.4 -51.5L49.2 -44" strokeWidth="3.2" />
        <path d="M-37 -60.5Q-27 -62.5 -17.5 -60.8" strokeWidth="3.2" />
      </g>
      <text x="0" y="0" transform="translate(34.6 -38.6) rotate(17)" textAnchor="middle" fontSize="7.5" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif" fill={kit.parts}>
        R
      </text>
      <circle cx={BB[0]} cy={BB[1]} r="10.5" fill={kit.parts} />
      <circle cx={BB[0]} cy={BB[1]} r="7.5" fill="none" stroke={spoke} strokeWidth="0.8" />
      <path d={`M${BB[0]} ${BB[1] - 10.5}L${REAR[0]} ${REAR[1] - 4.5}M${BB[0]} ${BB[1] + 10.5}L${REAR[0]} ${REAR[1] + 4.5}`} stroke={spoke} strokeWidth="0.9" />

      {/* Rider body */}
      <Limb from={shoulder} to={head} width={[10, 8]} fill={kit.skin} />
      <linearGradient id="riderLens" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor={kit.lens} />
        <stop offset="1" stopColor={kit.lensDeep} />
      </linearGradient>
      <clipPath id="riderTorso">
        <path d={torso} />
      </clipPath>
      <path d={torso} fill={kit.jersey} />
      <g clipPath="url(#riderTorso)">
        <path d={panelPath(hip, shoulder)} fill={kit.panel} />
        <Lettering hip={hip} shoulder={shoulder} fill={kit.lettering} />
      </g>
      <circle cx={hip[0] - 2.5} cy={hip[1] + 1} r="9.5" fill={kit.bib} />
      <Head hx={hx} hy={hy} kit={kit} />

      {/* Near side */}
      <Crank angle={crankAngle} stroke={kit.parts} />
      <Leg hip={hip} crankAngle={crankAngle} kit={kit} />
      <Arm shoulder={shoulder} hand={HOOD} kit={kit} sleeve={kit.jersey} cuff={kit.cuff} stripe={kit.bib} />

      {tailLight > 0 && (
        <g opacity={tailLight}>
          <circle cx="-30" cy="-51" r="11" fill="url(#tailGlow)" />
          <rect x="-29" y="-54" width="3" height="5.5" rx="1.2" fill="#ff3b30" />
        </g>
      )}
    </g>
  );
}
