import { useMemo } from 'react';
import './Terrain.css';

// Deterministic pseudo-random based on seed
function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function generateHillPath(startX, totalWidth, segments) {
  let path = `M ${startX} 280`;
  const segWidth = totalWidth / segments;
  for (let i = 0; i <= segments; i++) {
    const x = startX + i * segWidth;
    const hillHeight = 180 + Math.sin(i * 0.4) * 40 + Math.sin(i * 0.15) * 30 + Math.cos(i * 0.7) * 20;
    if (i === 0) {
      path += ` L ${x} ${hillHeight}`;
    } else {
      const cpx = x - segWidth / 2;
      const prevHeight = 180 + Math.sin((i - 1) * 0.4) * 40 + Math.sin((i - 1) * 0.15) * 30 + Math.cos((i - 1) * 0.7) * 20;
      const cpy = (prevHeight + hillHeight) / 2 - 10;
      path += ` Q ${cpx} ${cpy} ${x} ${hillHeight}`;
    }
  }
  path += ` L ${startX + totalWidth} 400 L ${startX} 400 Z`;
  return path;
}

function generateRoadPath(startX, totalWidth, segments) {
  let pathTop = `M ${startX} 280`;
  let pathBottom = `M ${startX} 310`;
  const segWidth = totalWidth / segments;

  for (let i = 0; i <= segments; i++) {
    const x = startX + i * segWidth;
    const hillOffset = Math.sin(i * 0.4) * 40 + Math.sin(i * 0.15) * 30 + Math.cos(i * 0.7) * 20;
    const topY = 230 + hillOffset;
    const bottomY = 260 + hillOffset;
    if (i === 0) {
      pathTop += ` L ${x} ${topY}`;
      pathBottom += ` L ${x} ${bottomY}`;
    } else {
      const cpx = x - segWidth / 2;
      const prevOffset = Math.sin((i - 1) * 0.4) * 40 + Math.sin((i - 1) * 0.15) * 30 + Math.cos((i - 1) * 0.7) * 20;
      const cpyTop = ((230 + prevOffset) + topY) / 2 - 10;
      const cpyBottom = ((260 + prevOffset) + bottomY) / 2 - 10;
      pathTop += ` Q ${cpx} ${cpyTop} ${x} ${topY}`;
      pathBottom += ` Q ${cpx} ${cpyBottom} ${x} ${bottomY}`;
    }
  }
  return { pathTop, pathBottom };
}

function Tree({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x="-3" y="-5" width="6" height="20" fill="#5a3e28" rx="1" />
      <ellipse cx="0" cy="-15" rx="12" ry="16" fill="#2d6a4f" />
      <ellipse cx="-5" cy="-10" rx="9" ry="12" fill="#40916c" />
      <ellipse cx="6" cy="-12" rx="8" ry="11" fill="#52b788" opacity="0.7" />
    </g>
  );
}

function Bush({ x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx="0" cy="0" rx="10" ry="7" fill="#40916c" />
      <ellipse cx="7" cy="-2" rx="7" ry="5" fill="#52b788" />
      <ellipse cx="-6" cy="-1" rx="6" ry="5" fill="#2d6a4f" />
    </g>
  );
}

function Building({ x, y, width, height, color, seed = 0 }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y={-height} width={width} height={height} fill={color} rx="2" />
      <rect x="0" y={-height} width={width} height={height} fill="url(#buildingShadow)" rx="2" />
      {/* Windows */}
      {Array.from({ length: Math.floor(height / 20) }).map((_, row) =>
        Array.from({ length: Math.floor(width / 14) }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={4 + col * 14}
            y={-height + 8 + row * 20}
            width="8"
            height="10"
            fill={seededRandom(row * 17 + col * 31 + seed) > 0.3 ? '#ffd166' : '#457b9d'}
            opacity="0.8"
            rx="1"
          />
        ))
      )}
      {/* Roof detail */}
      <rect x="-1" y={-height - 3} width={width + 2} height="5" fill={color} rx="1" opacity="0.8" />
    </g>
  );
}

function Cloud({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.85">
      <ellipse cx="0" cy="0" rx="25" ry="12" fill="white" />
      <ellipse cx="-15" cy="3" rx="18" ry="10" fill="white" />
      <ellipse cx="18" cy="4" rx="20" ry="9" fill="white" />
      <ellipse cx="5" cy="-5" rx="15" ry="10" fill="#f8f9fa" />
    </g>
  );
}

function LampPost({ x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-1.5" y="-50" width="3" height="50" fill="#6c757d" rx="1" />
      <path d="M-1.5,-50 Q-1.5,-55 8,-52" stroke="#6c757d" strokeWidth="2" fill="none" />
      <ellipse cx="10" cy="-52" rx="4" ry="2" fill="#ffd166" opacity="0.6" />
    </g>
  );
}

function MountainRange({ startX, totalWidth }) {
  let path = `M ${startX} 200`;
  const peaks = 30;
  const segWidth = totalWidth / peaks;
  for (let i = 0; i <= peaks; i++) {
    const x = startX + i * segWidth;
    const h = 120 + Math.sin(i * 0.6) * 50 + Math.cos(i * 0.3) * 30;
    if (i === 0) {
      path += ` L ${x} ${h}`;
    } else {
      const cpx = x - segWidth / 2;
      path += ` Q ${cpx} ${h - 20} ${x} ${h}`;
    }
  }
  path += ` L ${startX + totalWidth} 400 L ${startX} 400 Z`;
  return <path d={path} fill="#a8dadc" opacity="0.4" />;
}

export default function Terrain({ scrollProgress }) {
  const totalWidth = 8000;
  const viewWidth = 400;
  const segments = 120;

  const translateX = -scrollProgress * (totalWidth - viewWidth);
  const mountainTranslateX = translateX * 0.3;
  const hillBgTranslateX = translateX * 0.6;

  const hillPath = generateHillPath(0, totalWidth, segments);
  const { pathTop: roadTop, pathBottom: roadBottom } = generateRoadPath(0, totalWidth, segments);

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
            let roadPath = roadTop;
            // Reverse the bottom path
            const bottomSegments = roadBottom.split(/[MLQ]/).filter(Boolean);
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
