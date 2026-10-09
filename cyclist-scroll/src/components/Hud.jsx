import { clamp } from '../ride/math';
import { FINISH_X, elevationAt, gradeAt, kmAt, profilePoints } from '../ride/route';
import { STAGES, TOTALS, stageIndexAt } from '../ride/stages';

const PROFILE_HEIGHT = 56;
const PROFILE_TOP = Math.ceil(TOTALS.high / 250) * 250;
const profileY = (ele) => PROFILE_HEIGHT - 3 - (ele / PROFILE_TOP) * (PROFILE_HEIGHT - 8);
const POINTS = profilePoints(40).map(([x, ele]) => [(x / FINISH_X) * 1000, profileY(ele)]);
const PROFILE_LINE = `M${POINTS.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`;
const PROFILE_AREA = `${PROFILE_LINE}L1000 ${PROFILE_HEIGHT}L0 ${PROFILE_HEIGHT}Z`;

const formatNumber = (value, digits = 0) =>
  value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function Metric({ label, value, unit }) {
  return (
    <div className="hud-metric">
      <span className="hud-metric__label">{label}</span>
      <span className="hud-metric__value">
        {value}
        <small>{unit}</small>
      </span>
    </div>
  );
}

export default function Hud({ x }) {
  const position = clamp(x, 0, FINISH_X);
  const progress = position / FINISH_X;
  const stage = STAGES[stageIndexAt(position)];
  const grade = gradeAt(position);
  const roundedGrade = Math.abs(grade) < 0.05 ? 0 : grade;
  const markerTop = (profileY(elevationAt(position)) / PROFILE_HEIGHT) * 100;

  return (
    <div className="hud">
      <div className="hud-top">
        <span className="hud-brand">be4th</span>
        <div className="hud-stage">
          <span>
            Stage {stage.number}
            <em> / {String(STAGES.length).padStart(2, '0')}</em>
          </span>
          <strong>{stage.place}</strong>
        </div>
      </div>

      <div className="hud-panel">
        <div className="hud-metrics">
          <Metric label="Distance" value={formatNumber(kmAt(position), 1)} unit="km" />
          <Metric label="Altitude" value={formatNumber(elevationAt(position))} unit="m" />
          <Metric label="Gradient" value={`${roundedGrade > 0 ? '+' : roundedGrade < 0 ? '−' : ''}${formatNumber(Math.abs(roundedGrade), 1)}`} unit="%" />
        </div>
        <div className="hud-profile">
          <svg viewBox={`0 0 1000 ${PROFILE_HEIGHT}`} preserveAspectRatio="none">
            <defs>
              <clipPath id="hud-progress">
                <rect width={progress * 1000} height={PROFILE_HEIGHT} />
              </clipPath>
              <linearGradient id="hud-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff6a3d" stopOpacity="0.45" />
                <stop offset="1" stopColor="#ff6a3d" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={PROFILE_AREA} className="hud-profile__area" />
            {STAGES.slice(1).map((s) => (
              <path key={s.number} d={`M${(s.from / FINISH_X) * 1000} 0V${PROFILE_HEIGHT}`} className="hud-profile__divider" />
            ))}
            <g clipPath="url(#hud-progress)">
              <path d={PROFILE_AREA} fill="url(#hud-fill)" />
              <path d={PROFILE_LINE} className="hud-profile__line hud-profile__line--done" />
            </g>
            <path d={PROFILE_LINE} className="hud-profile__line" />
          </svg>
          <span className="hud-profile__cursor" style={{ left: `${progress * 100}%`, top: `${markerTop}%` }} />
        </div>
        <div className="hud-scale">
          <span>0 km</span>
          <span>{Math.round(progress * 100)}%</span>
          <span>{formatNumber(TOTALS.distance)} km</span>
        </div>
      </div>
    </div>
  );
}
