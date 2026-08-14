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

function makeRoadPath(width, segments) {
  const step = width / segments;
  let path = '';
  for (let i = 0; i <= segments; i++) {
    const x = i * step;
    const y = 225 + roadOffset(i);
    path += i ? ` Q ${x - step / 2} ${(225 + roadOffset(i - 1) + y) / 2 - 8} ${x} ${y}` : `M ${x} ${y}`;
  }
  for (let i = segments; i >= 0; i--) {
    const x = i * step;
    const y = 258 + roadOffset(i);
    path += i === segments ? ` L ${x} ${y}` : ` Q ${x + step / 2} ${(258 + roadOffset(i + 1) + y) / 2 + 8} ${x} ${y}`;
  }
  return `${path} Z`;
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
  const totalWidth = 8000;
  const viewWidth = 400;
  const segments = 120;
  const translateX = -scrollProgress * (totalWidth - viewWidth);
  const mountainTranslateX = translateX * 0.22;
  const road = makeRoadPath(totalWidth, segments);
  const roadTop = makeRoadEdge(totalWidth, segments);
  const roadBottom = makeRoadEdge(totalWidth, segments, true);
  const dashes = Array.from({ length: segments / 2 }, (_, index) => {
    const i = index * 2;
    const x = i * (totalWidth / segments) + 9;
    return <rect key={i} x={x} y={240 + roadOffset(i)} width="27" height="2" rx="1" fill="#f5ca69" opacity=".9" />;
  });
  const clouds = Array.from({ length: 18 }, (_, i) => <Cloud key={i} x={i * 460 + 90} y={35 + (i % 4) * 18} scale={0.55 + seededRandom(i) * .55} />);
  const trees = Array.from({ length: 42 }, (_, i) => <Tree key={i} x={i * 188 + 35} y={220 + roadOffset(i * 3) - 5} scale={.5 + seededRandom(i + 9) * .42} dark={i % 3 === 0} />);

  return <div className="terrain-container"><svg className="terrain-svg" viewBox={`0 0 ${viewWidth} 400`} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b9fc0" /><stop offset="58%" stopColor="#bee2df" /><stop offset="100%" stopColor="#e7e7c6" /></linearGradient>
      <linearGradient id="grassGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9dc580" /><stop offset="100%" stopColor="#4c8b5f" /></linearGradient>
      <linearGradient id="roadGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#515455" /><stop offset="100%" stopColor="#2c3031" /></linearGradient>
      <pattern id="fieldLines" width="72" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><path d="M0 4 H72 M0 14 H72" stroke="#d9c66c" strokeWidth="3" opacity=".58" /></pattern>
    </defs>
    <rect width={viewWidth} height="400" fill="url(#skyGradient)" />
    <circle cx="342" cy="48" r="25" fill="#ffe099" opacity=".9" /><circle cx="342" cy="48" r="37" fill="#ffe099" opacity=".16" />
    <g style={{ transform: `translateX(${mountainTranslateX}px)` }}><path d="M0 218 Q520 125 1110 205 T2150 162 T3200 215 T4250 90 T5200 190 T6400 72 T8000 182 L8000 400 L0 400Z" fill="#547c81" opacity=".28" />{clouds}</g>
    <g style={{ transform: `translateX(${translateX}px)` }}>
      <path d={makeLandscapePath(totalWidth, segments)} fill="url(#grassGradient)" opacity=".66" />
      {/* Dutch-German lowlands: flat fields, windmills and brick villages */}
      <path d="M0 205 H2780 V400 H0Z" fill="#81ad67" /><path d="M0 205 H2780 V400 H0Z" fill="url(#fieldLines)" opacity=".7" />
      <path d="M0 245 C440 220 740 258 1160 239 S2010 230 2780 248" fill="none" stroke="#8dcbd2" strokeWidth="11" opacity=".9" />
      <Windmill x={370} y={219} /><Windmill x={1450} y={211} /><DutchHouse x={660} y={229} /><DutchHouse x={710} y={229} color="#d9a45b" /><DutchHouse x={2110} y={229} color="#bf5d50" />
      <PlaceLabel x={430} y={88} title="NETHERLANDS" subtitle="flat lanes & wind" /><PlaceLabel x={2010} y={83} title="BOCHOLT" subtitle="Münsterland fields" />
      {/* Stuttgart: wooded, vineyard-like slopes and city silhouette */}
      <path d="M2700 250 Q2950 138 3220 196 Q3490 104 3760 192 Q4020 129 4380 244 L4380 400 H2700Z" fill="#56825d" />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M ${2800 + i * 350} 242 Q ${2920 + i * 350} ${155 - i * 8} ${3080 + i * 350} 224`} fill="none" stroke="#9ab759" strokeWidth="8" opacity=".82" />)}
      <Stuttgart x={3500} y={206} /><PlaceLabel x={3540} y={79} title="STUTTGART" subtitle="vineyards & climbs" />
      {/* Mont Ventoux: exposed limestone summit */}
      <Ventoux x={5180} y={222} /><PlaceLabel x={5200} y={58} title="MONT VENTOUX" subtitle="the Giant of Provence" tone="light" />
      {/* Alpe d'Huez: snow, high Alps and stacked switchbacks */}
      <AlpeDHuez x={6900} y={220} /><PlaceLabel x={6960} y={58} title="ALPE D'HUEZ" subtitle="21 legendary bends" tone="light" />
      <path d={road} fill="url(#roadGradient)" /><path d={roadTop} fill="none" stroke="#f7f4e9" strokeWidth="1.5" opacity=".75" /><path d={roadBottom} fill="none" stroke="#f7f4e9" strokeWidth="1.5" opacity=".75" />
      {dashes}{trees}
    </g>
  </svg></div>;
}
