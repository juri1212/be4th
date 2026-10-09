import { clamp } from '../ride/math';

// Road bike + rider in centimetres, drive side, facing right. Origin sits on the
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

function Limb({ from, to, width: [w1, w2], fill }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const d = `M${pt([from[0] + (nx * w1) / 2, from[1] + (ny * w1) / 2])}L${pt([to[0] + (nx * w2) / 2, to[1] + (ny * w2) / 2])}L${pt([to[0] - (nx * w2) / 2, to[1] - (ny * w2) / 2])}L${pt([from[0] - (nx * w1) / 2, from[1] - (ny * w1) / 2])}Z`;
  return (
    <g fill={fill}>
      <path d={d} />
      <circle cx={n(from[0])} cy={n(from[1])} r={w1 / 2} />
      <circle cx={n(to[0])} cy={n(to[1])} r={w2 / 2} />
    </g>
  );
}

function Leg({ hip, crankAngle, fill }) {
  const pedal = [BB[0] + CRANK * Math.cos(crankAngle), BB[1] + CRANK * Math.sin(crankAngle)];
  const ankleTarget = add(pedal, [-8, -6.5]);
  const [knee, ankle] = solveJoint(hip, ankleTarget, THIGH, SHIN, (a, b) => (a[0] > b[0] ? a : b));
  return (
    <g>
      <Limb from={hip} to={knee} width={[14.5, 10.5]} fill={fill} />
      <Limb from={knee} to={ankle} width={[10, 6]} fill={fill} />
      <Limb from={add(ankle, [-3.5, 3])} to={add(pedal, [8.5, 0.5])} width={[7, 4.5]} fill={fill} />
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

function Arm({ shoulder, hand, fill }) {
  const [elbow, wrist] = solveJoint(shoulder, hand, UPPER_ARM, FOREARM, (a, b) => (a[1] > b[1] ? a : b));
  return (
    <g>
      <Limb from={shoulder} to={elbow} width={[10, 7.5]} fill={fill} />
      <Limb from={elbow} to={wrist} width={[7, 5.5]} fill={fill} />
      <circle cx={n(wrist[0])} cy={n(wrist[1])} r="3.9" fill={fill} />
    </g>
  );
}

// Aero road helmet: smooth shell over the skull, tapering to a tail at the back.
function helmetPath(hx, hy) {
  const p = (dx, dy) => `${n(hx + dx)} ${n(hy + dy)}`;
  return `M${p(11, -1)}C${p(11, -9.5)} ${p(4, -13.5)} ${p(-3, -13)}C${p(-11, -12.5)} ${p(-16, -6)} ${p(-19, 3)}L${p(-9.5, 3)}C${p(-5, -1)} ${p(3, -3)} ${p(11, -1)}Z`;
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

function Wheel({ center, angle, tire, rim, spoke, decal }) {
  const [cx, cy] = center;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={WHEEL_RADIUS - 1.3} fill="none" stroke={tire} strokeWidth="2.6" />
      <circle r="28.6" fill="none" stroke={rim} strokeWidth="5.6" />
      <g transform={`rotate(${n((angle * 180) / Math.PI)})`}>
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
      <circle r="2.6" fill={tire} />
    </g>
  );
}

export default function Rider({ distance, ink, inkFar, bike, spoke, decal, tailLight }) {
  const wheelAngle = distance / WHEEL_RADIUS;
  const crankAngle = wheelAngle / 2.4;
  const bob = Math.sin(crankAngle * 2);
  const hip = add(HIP, [0, bob * 0.35]);
  const shoulder = add(SHOULDER, [bob * 0.3, bob * 0.8]);
  const head = add(shoulder, [16.5, -4]);
  const [hx, hy] = head;

  return (
    <g>
      {/* Far side */}
      <Crank angle={crankAngle + Math.PI} stroke={inkFar} />
      <Leg hip={add(hip, [1, -1])} crankAngle={crankAngle + Math.PI} fill={inkFar} />
      <Arm shoulder={add(shoulder, [-1.5, -1])} hand={add(HOOD, [-2, -1])} fill={inkFar} />

      <Wheel center={REAR} angle={wheelAngle} tire={ink} rim={bike} spoke={spoke} decal={decal} />
      <Wheel center={FRONT} angle={wheelAngle} tire={ink} rim={bike} spoke={spoke} decal={decal} />

      {/* Frame */}
      <g fill="none" stroke={bike} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${pt(BB)}L${pt(REAR)}`} strokeWidth="2.6" />
        <path d={`M${pt(add(SEAT_TOP, [-0.6, 3.5]))}L${pt(REAR)}`} strokeWidth="2.2" />
        <path d={`M${pt(BB)}L${pt(SEAT_TOP)}`} strokeWidth="3.8" />
        <path d={`M${pt(SEAT_TOP)}L${pt(HEAD_TOP)}`} strokeWidth="3.4" />
        <path d={`M${pt(BB)}L${pt(HEAD_BOTTOM)}`} strokeWidth="4.6" />
        <path d={`M${pt(HEAD_TOP)}L${pt(HEAD_BOTTOM)}`} strokeWidth="5" />
        <path d={`M${pt(HEAD_BOTTOM)}Q41.5 -14 ${pt(FRONT)}`} strokeWidth="3" />
        <path d={`M${pt(SEAT_TOP)}L${pt(SADDLE)}`} strokeWidth="2.6" />
        <path d="M31 -50L40.5 -51.5" strokeWidth="3.2" />
        <path d="M40.5 -51.5L45.5 -52C50 -52.5 53 -49.5 52.5 -45C52 -40.5 48.5 -38.5 44 -39.5" strokeWidth="2.4" />
        <path d="M45.5 -52.5C48 -56.5 51 -55.5 50.4 -51.5L49.2 -44" strokeWidth="3.2" />
        <path d="M-37 -60.5Q-27 -62.5 -17.5 -60.8" strokeWidth="3.2" />
      </g>
      <circle cx={BB[0]} cy={BB[1]} r="10.5" fill={bike} />
      <path d={`M${BB[0]} ${BB[1] - 10.5}L${REAR[0]} ${REAR[1] - 4.5}M${BB[0]} ${BB[1] + 10.5}L${REAR[0]} ${REAR[1] + 4.5}`} stroke={spoke} strokeWidth="0.9" />

      {/* Rider body */}
      <path d={torsoPath(hip, shoulder)} fill={ink} />
      <circle cx={hip[0] - 2.5} cy={hip[1] + 1} r="9.5" fill={ink} />
      <Limb from={shoulder} to={head} width={[10, 8]} fill={ink} />
      <circle cx={hx} cy={hy} r="9.6" fill={ink} />
      <path d={helmetPath(hx, hy)} fill={ink} />

      {/* Near side */}
      <Crank angle={crankAngle} stroke={ink} />
      <Leg hip={hip} crankAngle={crankAngle} fill={ink} />
      <Arm shoulder={shoulder} hand={HOOD} fill={ink} />

      {tailLight > 0 && (
        <g opacity={tailLight}>
          <circle cx="-30" cy="-51" r="11" fill="url(#tailGlow)" />
          <rect x="-29" y="-54" width="3" height="5.5" rx="1.2" fill="#ff3b30" />
        </g>
      )}
    </g>
  );
}
