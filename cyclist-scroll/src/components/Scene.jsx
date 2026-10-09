import { clamp, smoothstep } from '../ride/math';
import { RIDER_KIT, mixRgb, paletteAt, rgb } from '../ride/palette';
import { FINISH_X, MARKERS, cameraY, roadY } from '../ride/route';
import { SCENERY } from '../ride/scenery';
import Rider, { WHEELBASE, WHEEL_RADIUS } from './Rider';
import { Gantry, Lamp, Observatory, Prop } from './Silhouettes';

// Where the rider sits in the frame, as a fraction of the viewport.
export const FOCUS_X = 0.42;
export const FOCUS_Y = 0.6;

const RIDER_SCALE = 0.92;
const ACCENT = [255, 106, 61];
const WHITE = [255, 255, 255];
const WINDOW_LIGHT = '#ffc46b';
const LABEL_TEXT = '#f6f1e8';
const OBSERVATORY_X = 9720;
const START_X = 230;

const r2 = (value) => Math.round(value * 100) / 100;
const shadeKit = (ink, amount) => Object.fromEntries(Object.entries(RIDER_KIT).map(([part, color]) => [part, rgb(mixRgb(color, ink, amount))]));
const inView = (left, right, width, pad = 0) => right > -pad && left < width + pad;

function Marker({ marker, ink }) {
  const y = roadY(marker.x);
  const name = marker.name.toUpperCase();
  const elevation = `${marker.ele.toLocaleString('en-US')} M`;
  const width = Math.max(name.length * 8.6, elevation.length * 7.4) + 26;
  const top = y - 196;
  return (
    <g className="scene-marker">
      <path d={`M${marker.x} ${y - 4}V${top + 40}`} stroke={LABEL_TEXT} strokeOpacity="0.4" strokeDasharray="2 4" />
      <circle cx={marker.x} cy={y} r="4" fill={LABEL_TEXT} />
      <rect x={marker.x - width / 2} y={top} width={width} height="40" rx="7" fill={rgb(ink, 0.72)} stroke={rgb(WHITE, 0.14)} />
      <text x={marker.x} y={top + 17} textAnchor="middle" className="scene-label" fill={LABEL_TEXT}>
        {name}
      </text>
      <text x={marker.x} y={top + 31} textAnchor="middle" className="scene-label scene-label--sub" fill={LABEL_TEXT}>
        {elevation}
      </text>
    </g>
  );
}

export default function Scene({ x, width: W, height: H }) {
  const t = clamp(x / FINISH_X, 0, 1);
  const palette = paletteAt(t);
  const camY = cameraY(x);
  const dusk = smoothstep(0.7, 0.95, t);
  const night = smoothstep(0.82, 1, t);
  const horizon = FOCUS_Y * H - 110;

  const sunArc = Math.sin(Math.PI * (t * 0.98 + 0.1));
  const sun = { x: W * (0.84 - 0.28 * t), y: horizon - sunArc * (horizon - 90) };

  const ink = palette.ink;
  // Sails turn as you ride rather than on a timer, so an idle page never repaints.
  const sailAngle = r2((x * 0.06) % 360);
  const cloudColor = mixRgb(mixRgb(palette.haze, WHITE, 0.4), palette.sun, dusk * 0.6);
  const snowTint = mixRgb(WHITE, palette.sun, 0.25 + dusk * 0.6);

  const groundX = FOCUS_X * W - x;
  const groundY = FOCUS_Y * H - camY;
  const visibleWorld = (left, right, pad = 0) => inView(left + groundX, right + groundX, W, pad);

  const half = (WHEELBASE / 2) * RIDER_SCALE;
  const rearY = roadY(x - half);
  const frontY = roadY(x + half);
  const riderAngle = (Math.atan2(frontY - rearY, half * 2) * 180) / Math.PI;
  // The kit keeps its colours by day and sinks into the silhouette after sunset.
  const riderShade = 0.12 + dusk * 0.3 + night * 0.33;

  return (
    <svg className="scene" viewBox={`0 0 ${r2(W)} ${r2(H)}`} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2={horizon + 80} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={rgb(palette.skyTop)} />
          <stop offset="0.58" stopColor={rgb(palette.skyMid)} />
          <stop offset="1" stopColor={rgb(palette.haze)} />
        </linearGradient>
        <radialGradient id="sunGlow" cx={sun.x} cy={sun.y} r={W * 0.6} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={rgb(palette.sun)} stopOpacity={0.6 + dusk * 0.2} />
          <stop offset="0.3" stopColor={rgb(palette.haze)} stopOpacity="0.22" />
          <stop offset="1" stopColor={rgb(palette.haze)} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cloud">
          <stop offset="0" stopColor={rgb(cloudColor)} stopOpacity="0.9" />
          <stop offset="0.55" stopColor={rgb(cloudColor)} stopOpacity="0.35" />
          <stop offset="1" stopColor={rgb(cloudColor)} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampGlow">
          <stop offset="0" stopColor={WINDOW_LIGHT} stopOpacity="0.55" />
          <stop offset="0.25" stopColor={WINDOW_LIGHT} stopOpacity="0.18" />
          <stop offset="1" stopColor={WINDOW_LIGHT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tailGlow">
          <stop offset="0" stopColor="#ff3b30" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ff3b30" stopOpacity="0" />
        </radialGradient>
        <clipPath id="travelled">
          <rect x="0" y="-4000" width={Math.max(x, 0)} height="8000" />
        </clipPath>
      </defs>

      {/* Sky */}
      <rect width={W} height={H} fill="url(#sky)" />
      {night > 0 && (
        <g fill="#fff" opacity={night}>
          {SCENERY.stars.map((star) => (
            <circle key={star.key} cx={r2(star.x * W)} cy={r2(star.y * horizon * 0.85)} r={star.r} opacity={star.alpha} />
          ))}
        </g>
      )}
      <rect width={W} height={H} fill="url(#sunGlow)" />
      <circle cx={r2(sun.x)} cy={r2(sun.y)} r="26" fill={rgb(palette.sun)} opacity={1 - night * 0.6} />

      <g transform={`translate(${r2(FOCUS_X * W - x * 0.05)} 0)`} opacity={(1 - night * 0.75) * 0.75}>
        {SCENERY.clouds.map((cloud) => (
          <ellipse key={cloud.key} cx={cloud.lx} cy={r2(cloud.y * horizon)} rx={cloud.w} ry={cloud.h} fill="url(#cloud)" />
        ))}
      </g>

      {/* Parallax layers */}
      {SCENERY.layers.map((layer, index) => {
        const ox = FOCUS_X * W - x * layer.p;
        const oy = FOCUS_Y * H - camY * layer.p;
        const color = mixRgb(ink, palette.haze, layer.depth);
        const fog = mixRgb(ink, palette.haze, layer.depth + (1 - layer.depth) * 0.45);
        const snow = mixRgb(color, snowTint, 0.55);
        const id = `layer-${index}`;
        return (
          <g key={id} transform={`translate(${r2(ox)} ${r2(oy)})`} fill={rgb(color)} color={rgb(color)}>
            <linearGradient id={id} x1="0" y1={-(layer.base + 220)} x2="0" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={rgb(color)} />
              <stop offset="1" stopColor={rgb(fog)} />
            </linearGradient>
            {layer.props
              .filter((prop) => inView(prop.lx + ox, prop.lx + ox, W, 220))
              .map(({ key, ...prop }) => (
                <Prop key={key} {...prop} x={prop.lx} light={WINDOW_LIGHT} glow={prop.lit ? night : 0} spin={sailAngle} />
              ))}
            {layer.tiles
              .filter((tile) => inView(tile.x0 + ox, tile.x1 + ox, W, 40))
              .map((tile) => (
                <g key={tile.x0}>
                  <path d={tile.shape} fill={`url(#${id})`} />
                  {tile.snow && <path d={tile.snow} fill={rgb(snow)} />}
                </g>
              ))}
          </g>
        );
      })}

      {/* Rider's plane */}
      <g transform={`translate(${r2(groundX)} ${r2(groundY)})`}>
        <g fill={rgb(mixRgb(ink, palette.haze, 0.18))}>
          {SCENERY.roadside
            .filter((tree) => visibleWorld(tree.x, tree.x, 120))
            .map(({ key, ...tree }) => <Prop key={key} {...tree} />)}
        </g>
        {visibleWorld(OBSERVATORY_X, OBSERVATORY_X, 120) && (
          <g transform={`translate(${OBSERVATORY_X} ${r2(roadY(OBSERVATORY_X) + 4)}) scale(1.25)`} fill={rgb(mixRgb(ink, palette.haze, 0.08))} color={rgb(mixRgb(ink, palette.haze, 0.08))}>
            <Observatory />
          </g>
        )}
        <g fill={rgb(ink)} color={rgb(ink)}>
          {SCENERY.lamps
            .filter((lamp) => visibleWorld(lamp.x, lamp.x, 120))
            .map((lamp) => (
              <g key={lamp.x} transform={`translate(${lamp.x} ${r2(lamp.y)})`}>
                <Lamp glow={night} light={WINDOW_LIGHT} />
              </g>
            ))}
        </g>

        {SCENERY.road
          .filter((tile) => visibleWorld(tile.x0, tile.x1, 20))
          .map((tile) => (
            <g key={tile.x0}>
              <path d={tile.ground} fill={rgb(ink)} />
              <path d={tile.line} fill="none" stroke={rgb(mixRgb(palette.haze, WHITE, 0.4))} strokeOpacity="0.5" strokeWidth="2" />
              {tile.x0 < x && tile.x1 > 0 && (
                <g clipPath="url(#travelled)" fill="none" strokeLinecap="round">
                  <path d={tile.line} stroke={rgb(ACCENT)} strokeOpacity="0.22" strokeWidth="10" />
                  <path d={tile.line} stroke={rgb(ACCENT)} strokeWidth="3" />
                </g>
              )}
            </g>
          ))}

        <g className="scene-ticks" fill={LABEL_TEXT} stroke={LABEL_TEXT}>
          {SCENERY.kmTicks
            .filter((tick) => visibleWorld(tick.x, tick.x, 40))
            .map((tick) => (
              <g key={tick.km} opacity="0.42">
                <path d={`M${r2(tick.x)} ${r2(tick.y + 12)}V${r2(tick.y + 20)}`} fill="none" />
                <text x={r2(tick.x)} y={r2(tick.y + 36)} textAnchor="middle" stroke="none" className="scene-tick">
                  {tick.km}
                </text>
              </g>
            ))}
        </g>

        {MARKERS.filter((marker) => visibleWorld(marker.x, marker.x, 120)).map((marker) => (
          <Marker key={marker.x} marker={marker} ink={ink} />
        ))}

        {[
          { at: START_X, label: 'START' },
          { at: FINISH_X, label: 'FINISH' },
        ]
          .filter((gantry) => visibleWorld(gantry.at, gantry.at, 120))
          .map((gantry) => (
            <g key={gantry.label} transform={`translate(${gantry.at} ${r2(roadY(gantry.at) + 2)})`} fill={rgb(ink)}>
              <Gantry label={gantry.label} textColor={LABEL_TEXT} accent={rgb(ACCENT)} />
            </g>
          ))}

        <g transform={`translate(${r2(x)} ${r2((rearY + frontY) / 2)}) rotate(${r2(riderAngle)}) scale(${RIDER_SCALE}) translate(0 ${-WHEEL_RADIUS})`}>
          <Rider
            distance={x}
            kit={shadeKit(ink, riderShade)}
            kitFar={shadeKit(ink, riderShade + 0.3)}
            spoke={rgb(palette.haze, 0.16)}
            decal={rgb(palette.haze, 0.6)}
            tailLight={dusk}
          />
        </g>
      </g>
    </svg>
  );
}
