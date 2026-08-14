import { ROAD_SEGMENTS, ROAD_VIEW_WIDTH, ROAD_WIDTH } from './roadGeometry';
import './Terrain.css';

function seededRandom(seed) {
  const value = Math.sin(seed * 91.73 + 14.2) * 10000;
  return value - Math.floor(value);
}

function roadOffset(i) {
  return Math.sin(i * 0.34) * 27 + Math.sin(i * 0.11) * 20 + Math.cos(i * 0.72) * 11;
}

function makeLandscapePath(width, segments, base = 250) {
  const step = width / segments;
  let path = `M 0 ${base}`;
  for (let i = 0; i <= segments; i++) {
    const x = i * step;
    const y = base - 52 + roadOffset(i);
    if (!i) path += ` L ${x} ${y}`;
    else path += ` Q ${x - step / 2} ${(base - 52 + roadOffset(i - 1) + y) / 2 - 8} ${x} ${y}`;
  }
  return `${path} L ${width} 400 L 0 400 Z`;
}

function makeRoadEdge(width, segments, lower = false) {
  const step = width / segments;
  let path = '';
  for (let i = 0; i <= segments; i++) {
    const x = i * step;
    const y = (lower ? 258 : 225) + roadOffset(i);
    path += i ? ` Q ${x - step / 2} ${((lower ? 258 : 225) + roadOffset(i - 1) + y) / 2} ${x} ${y}` : `M ${x} ${y}`;
  }
  return path;
}

function Cloud({ x, y, scale = 1 }) {
  return <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.8"><ellipse cx="0" cy="0" rx="26" ry="10" fill="#fff" /><ellipse cx="-17" cy="4" rx="18" ry="9" fill="#fff" /><ellipse cx="18" cy="4" rx="20" ry="9" fill="#fff" /><ellipse cx="4" cy="-7" rx="15" ry="10" fill="#fff" /></g>;
}

function Tree({ x, y, scale = 1, dark = false }) {
  const foliage = dark ? '#214e3e' : '#2f6c4f';
  return <g transform={`translate(${x}, ${y}) scale(${scale})`}><rect x="-2" y="-19" width="4" height="20" rx="1" fill="#5b412d" /><path d="M0 -48 L-15 -17 L-7 -17 L-21 0 L20 0 L7 -17 L15 -17 Z" fill={foliage} /><path d="M0 -42 L-11 -17 L9 -17 Z" fill="#4d8c63" opacity=".75" /></g>;
}

function Windmill({ x, y }) {
  return <g transform={`translate(${x}, ${y})`}>
    <path d="M-11 0 L-7 -52 L7 -52 L12 0 Z" fill="#f0ead8" stroke="#8d846d" strokeWidth="1" />
    <path d="M-9 -54 L0 -68 L9 -54 Z" fill="#8e4d3f" />
    <circle cy="-49" r="4" fill="#69433c" />
    {[0, 90, 180, 270].map((angle) => <path key={angle} d="M0 -49 L4 -88 L-4 -88 Z" fill="#eee8d6" stroke="#bdb39b" strokeWidth=".8" transform={`rotate(${angle})`} />)}
  </g>;
}

function DutchHouse({ x, y, color = '#c6594d' }) {
  return <g transform={`translate(${x}, ${y})`}><rect x="0" y="-30" width="25" height="30" fill={color} /><path d="M-3 -30 L12 -46 L28 -30 Z" fill="#3e5360" /><rect x="5" y="-19" width="5" height="8" fill="#d4e7e8" /><rect x="16" y="-19" width="5" height="8" fill="#d4e7e8" /><rect x="10" y="-9" width="6" height="9" fill="#674b3b" /></g>;
}

function Stuttgart({ x, y }) {
  return <g transform={`translate(${x}, ${y})`}>
    <path d="M-110 0 Q-80 -44 -42 -15 Q-8 -65 35 -17 Q66 -46 112 -5 L112 10 L-110 10 Z" fill="#557a5b" />
    <path d="M-92 0 L-92 -33 L-72 -33 L-72 0 M-64 0 L-64 -47 L-38 -47 L-38 0 M-28 0 L-28 -31 L-5 -31 L-5 0 M8 0 L8 -59 L35 -59 L35 0 M44 0 L44 -38 L68 -38 L68 0" fill="#5d666c" />
    <path d="M-5 -60 L-5 -95 L4 -95 L4 -60 M-13 -96 Q0 -113 13 -96" fill="#d7d0b6" />
    <path d="M-70 -34 h18 M-60 -47 h18 M16 -59 h18" stroke="#ffd77b" strokeWidth="4" opacity=".8" />
  </g>;
}

function Ventoux({ x, y }) {
  return <g transform={`translate(${x}, ${y})`}>
    <path d="M-290 55 Q-175 -105 -62 -87 Q24 -212 166 -45 Q218 5 290 55 Z" fill="#789768" />
    <path d="M-40 55 Q18 -190 88 -180 Q182 -82 205 55 Z" fill="#d6d2bd" />
    <path d="M-12 55 Q45 -143 94 -167 Q92 -98 142 55 Z" fill="#b7b5a8" opacity=".8" />
    <path d="M84 -180 L90 -212 L97 -180 Z" fill="#f3f0e4" /><rect x="87" y="-213" width="4" height="33" fill="#555" />
    <path d="M-173 42 Q-116 -45 -65 -23 Q-14 14 46 35" fill="none" stroke="#e5b05c" strokeWidth="3" opacity=".7" />
  </g>;
}

function AlpeDHuez({ x, y }) {
  const bends = [-1, 1, -1, 1, -1];
  return <g transform={`translate(${x}, ${y})`}>
    <path d="M-310 52 L-210 -110 L-108 -35 L-12 -188 L104 -44 L193 -136 L315 52 Z" fill="#798a85" />
    <path d="M-245 52 L-153 -76 L-89 -19 L-6 -161 L71 -27 L166 -105 L244 52 Z" fill="#ebeee9" opacity=".78" />
    <path d="M-243 44 C-182 25 -187 2 -130 -8 C-83 -18 -115 -45 -65 -56 C-20 -67 -60 -91 -15 -104 C29 -116 3 -141 50 -151" fill="none" stroke="#45484a" strokeWidth="9" />
    <path d="M-243 44 C-182 25 -187 2 -130 -8 C-83 -18 -115 -45 -65 -56 C-20 -67 -60 -91 -15 -104 C29 -116 3 -141 50 -151" fill="none" stroke="#f8f7f0" strokeWidth="1.5" opacity=".85" />
    {bends.map((direction, index) => <circle key={index} cx={-170 + index * 48} cy={18 - index * 33} r="2.5" fill={direction > 0 ? '#f6c453' : '#e96655'} />)}
  </g>;
}

function PlaceLabel({ x, y, title, subtitle, tone = 'dark' }) {
  return <g transform={`translate(${x}, ${y})`} className="place-label">
    <rect x="-54" y="-16" width="108" height="32" rx="7" fill={tone === 'light' ? '#f8f3e7' : '#16312c'} opacity=".92" />
    <text x="0" y="-2" textAnchor="middle" fill={tone === 'light' ? '#26413a' : '#fff5df'} fontSize="10" fontWeight="700" letterSpacing=".7">{title}</text>
    <text x="0" y="10" textAnchor="middle" fill={tone === 'light' ? '#52675b' : '#b9d8c4'} fontSize="7" letterSpacing=".3">{subtitle}</text>
  </g>;
}

export default function Terrain({ scrollProgress }) {
  const totalWidth = ROAD_WIDTH;
  const viewWidth = ROAD_VIEW_WIDTH;
  const segments = ROAD_SEGMENTS;

  const translateX = -scrollProgress * (totalWidth - viewWidth);
  const mountainTranslateX = translateX * 0.3;
  const hillBgTranslateX = translateX * 0.6;

  const hillPath = generateHillPath(0, totalWidth, segments);

  // Generate road center dashes
  const dashElements = [];
  const segWidth = totalWidth / segments;
  for (let i = 0; i < segments; i++) {
    const x = i * segWidth;
    const offset = Math.sin(i * 0.4) * 40 + Math.sin(i * 0.15) * 30 + Math.cos(i * 0.7) * 20;
    const y = 245 + offset;
    if (i % 2 === 0) {
      dashElements.push(
        <rect
          key={`dash-${i}`}
          x={x}
          y={y - 1.5}
          width={segWidth * 0.6}
          height="3"
          fill="#ffd166"
          opacity="0.9"
          rx="1"
          transform={`rotate(${Math.atan2(
            (Math.sin((i + 1) * 0.4) * 40 + Math.sin((i + 1) * 0.15) * 30 + Math.cos((i + 1) * 0.7) * 20) -
            offset, segWidth
          ) * (180 / Math.PI)}, ${x}, ${y})`}
        />
      );
    }
  }

  // Generate trees along the road
  const treeElements = [];
  const bushElements = [];
  const lampElements = [];
  for (let i = 0; i < segments; i += 3) {
    const x = i * segWidth + segWidth / 2;
    const offset = Math.sin(i * 0.4) * 40 + Math.sin(i * 0.15) * 30 + Math.cos(i * 0.7) * 20;
    const roadTopY = 225 + offset;
    if (i % 6 === 0) {
      treeElements.push(
        <Tree key={`tree-${i}`} x={x + 10} y={roadTopY - 15} scale={0.7 + seededRandom(i * 7) * 0.4} />
      );
    }
    if (i % 9 === 0) {
      bushElements.push(
        <Bush key={`bush-${i}`} x={x - 5} y={roadTopY - 3} />
      );
    }
    if (i % 12 === 0) {
      lampElements.push(
        <LampPost key={`lamp-${i}`} x={x + 20} y={roadTopY} />
      );
    }
  }

  // Generate buildings in the background
  const buildingElements = [];
  const buildingColors = ['#264653', '#2a9d8f', '#457b9d', '#6d6875', '#b5838d'];
  for (let i = 0; i < 40; i++) {
    const x = i * 200 + 50;
    const offset = Math.sin((i * 3) * 0.4) * 40 + Math.sin((i * 3) * 0.15) * 30 + Math.cos((i * 3) * 0.7) * 20;
    const roadTopY = 225 + offset;
    const bh = 40 + seededRandom(i * 13) * 60;
    const bw = 25 + seededRandom(i * 29) * 25;
    buildingElements.push(
      <Building
        key={`bldg-${i}`}
        x={x}
        y={roadTopY - 20}
        seed={i}
        width={bw}
        height={bh}
        color={buildingColors[i % buildingColors.length]}
      />
    );
  }

  // Clouds
  const cloudElements = [];
  for (let i = 0; i < 25; i++) {
    cloudElements.push(
      <Cloud
        key={`cloud-${i}`}
        x={i * 350 + 50}
        y={20 + Math.sin(i) * 25}
        scale={0.6 + seededRandom(i * 23) * 0.6}
      />
    );
  }

  return (
    <div className="terrain-container">
      <svg
        className="terrain-svg"
        viewBox={`0 0 ${viewWidth} 400`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#89c2d9" />
            <stop offset="40%" stopColor="#a9d6e5" />
            <stop offset="100%" stopColor="#caf0f8" />
          </linearGradient>
          <linearGradient id="grassGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#95d5b2" />
            <stop offset="100%" stopColor="#52b788" />
          </linearGradient>
          <linearGradient id="roadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#555" />
            <stop offset="100%" stopColor="#3a3a3a" />
          </linearGradient>
          <linearGradient id="buildingShadow" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width={viewWidth} height="400" fill="url(#skyGradient)" />

        {/* Sun */}
        <circle cx="350" cy="45" r="25" fill="#ffd166" opacity="0.9" />
        <circle cx="350" cy="45" r="30" fill="#ffd166" opacity="0.2" />

        {/* Clouds layer - slow parallax */}
        <g style={{ transform: `translateX(${mountainTranslateX}px)` }}>
          {cloudElements}
        </g>

        {/* Distant mountains */}
        <g style={{ transform: `translateX(${mountainTranslateX}px)` }}>
          <MountainRange startX={0} totalWidth={totalWidth * 0.5} />
        </g>

        {/* Mid-ground hills */}
        <g style={{ transform: `translateX(${hillBgTranslateX}px)` }}>
          <path
            d={generateHillPath(0, totalWidth * 0.8, 80)}
            fill="#b7e4c7"
            opacity="0.5"
          />
        </g>

        {/* Main terrain group - scrolls with content */}
        <g style={{ transform: `translateX(${translateX}px)` }}>
          {/* Buildings behind the road */}
          {buildingElements}

          {/* Main hill/grass */}
          <path d={hillPath} fill="url(#grassGradient)" />

          {/* Road surface */}
          {(() => {
            // Build road as filled area between top and bottom paths
            // Simpler approach: just draw a road band
            let road = `M 0 ${230}`;
            for (let i = 0; i <= segments; i++) {
              const x = i * segWidth;
              const offset = Math.sin(i * 0.4) * 40 + Math.sin(i * 0.15) * 30 + Math.cos(i * 0.7) * 20;
              const topY = 228 + offset;
              if (i === 0) road += ` L ${x} ${topY}`;
              else {
                const cpx = x - segWidth / 2;
                const prevOff = Math.sin((i - 1) * 0.4) * 40 + Math.sin((i - 1) * 0.15) * 30 + Math.cos((i - 1) * 0.7) * 20;
                road += ` Q ${cpx} ${(228 + prevOff + topY) / 2 - 10} ${x} ${topY}`;
              }
            }
            // Go right along bottom
            for (let i = segments; i >= 0; i--) {
              const x = i * segWidth;
              const offset = Math.sin(i * 0.4) * 40 + Math.sin(i * 0.15) * 30 + Math.cos(i * 0.7) * 20;
              const botY = 262 + offset;
              if (i === segments) road += ` L ${x} ${botY}`;
              else {
                const cpx = x + segWidth / 2;
                const nextOff = Math.sin((i + 1) * 0.4) * 40 + Math.sin((i + 1) * 0.15) * 30 + Math.cos((i + 1) * 0.7) * 20;
                road += ` Q ${cpx} ${(262 + nextOff + botY) / 2 + 10} ${x} ${botY}`;
              }
            }
            road += ' Z';
            return <path d={road} fill="url(#roadGradient)" />;
          })()}

          {/* Road edge lines */}
          {(() => {
            let topEdge = '';
            let bottomEdge = '';
            for (let i = 0; i <= segments; i++) {
              const x = i * segWidth;
              const offset = Math.sin(i * 0.4) * 40 + Math.sin(i * 0.15) * 30 + Math.cos(i * 0.7) * 20;
              const tY = 228 + offset;
              const bY = 262 + offset;
              if (i === 0) {
                topEdge = `M ${x} ${tY}`;
                bottomEdge = `M ${x} ${bY}`;
              } else {
                const cpx = x - segWidth / 2;
                const prevOff = Math.sin((i - 1) * 0.4) * 40 + Math.sin((i - 1) * 0.15) * 30 + Math.cos((i - 1) * 0.7) * 20;
                topEdge += ` Q ${cpx} ${(228 + prevOff + tY) / 2 - 10} ${x} ${tY}`;
                bottomEdge += ` Q ${cpx} ${(262 + prevOff + bY) / 2 - 10} ${x} ${bY}`;
              }
            }
            return (
              <>
                <path d={topEdge} fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" />
                <path d={bottomEdge} fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" />
              </>
            );
          })()}

          {/* Center line dashes */}
          {dashElements}

          {/* Scenery */}
          {treeElements}
          {bushElements}
          {lampElements}
        </g>
      </svg>
    </div>
  );
}
