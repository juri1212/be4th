import { BIRTHDAY, digitsOf, type Door } from '../advent/townhall';

interface LeafProps {
  door: Pick<Door, 'day' | 'kind' | 'width' | 'height'>;
  side: 'left' | 'right';
  digit: string;
}

const MARGIN = 2;

const pane = (x: number, y: number, width: number, height: number, arch?: 'left' | 'right') => {
  if (!arch) return `M${x} ${y}h${width}v${height}h${-width}z`;
  const r = width;
  return arch === 'left'
    ? `M${x} ${y + height}V${y + r}A${r} ${r} 0 0 1 ${x + width} ${y}V${y + height}z`
    : `M${x} ${y + height}V${y}A${r} ${r} 0 0 1 ${x + width} ${y + r}V${y + height}z`;
};

// A birthday cake with three candles, standing at 0,0.
const Cake = ({ x, y }: { x: number; y: number }) => (
  <g className="advent-cake" transform={`translate(${x} ${y})`}>
    <path className="advent-cake__plate" d="M-12-1.4h24l-2 1.8h-20z" />
    <path className="advent-cake__sponge" d="M-10-10.5h20v9.1h-20z" />
    <path className="advent-cake__cream" d="M-10-6h20v1.4h-20z" />
    <path className="advent-cake__icing" d="M-10.6-9.4q0-2.6 2.6-2.6h16q2.6 0 2.6 2.6v1.6a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1-3 0v.9a1.5 1.5 0 0 1-3 0v-.9a1.6 1.6 0 0 1-3.2 0v1.3a1.5 1.5 0 0 1-3 0v-1.3a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 1-3 0z" />
    <path className="advent-cake__candle" d="M-7-11.6v-6.2h2v6.2zM-1-11.6v-6.2h2v6.2zM5-11.6v-6.2h2v6.2z" />
    <g className="advent-cake__flames">
      <ellipse cy="-20.4" rx="15" ry="9" />
      {[-6, 0, 6].map((x) => (
        <path key={x} d={`M${x}-24q2.6 3.2 1.4 5a1.7 1.7 0 0 1-2.8 0q-1.2-1.8 1.4-5z`} />
      ))}
    </g>
  </g>
);

// One leaf of a window or of the portal, with its string of lights and its digit. Drawn from 0,0 at the leaf's top left.
export function AdventLeaf({ door, side, digit }: LeafProps) {
  const width = door.width / 2;
  const { height } = door;
  const portal = door.kind === 'portal';
  const split = height * (portal ? 0.36 : 0.38);
  const inner = width - MARGIN * 2;
  const upper = pane(MARGIN, MARGIN, inner, split - MARGIN * 1.5, door.kind === 'arched' ? side : undefined);
  const lower = pane(MARGIN, split + MARGIN / 2, inner, height - split - MARGIN * 1.5);
  const digitY = (split + height) / 2;
  const wood = `M${MARGIN} ${MARGIN}L${width - MARGIN} ${split - MARGIN}M${width - MARGIN} ${MARGIN}L${MARGIN} ${split - MARGIN}`;
  return (
    <g className={`advent-leaf advent-leaf--${portal ? 'wood' : 'glass'}`}>
      <path className="advent-leaf__frame" d={pane(0, 0, width, height, door.kind === 'arched' ? side : undefined)} />
      <path className="advent-leaf__pane" d={upper + lower} />
      {portal ? (
        <path className="advent-leaf__carving" d={wood} />
      ) : (
        <path
          className="advent-leaf__lead"
          d={[1, 2, 3].map((i) => `M${MARGIN + (inner * i) / 4} ${MARGIN + (door.kind === 'arched' ? 12 : 0)}V${height - MARGIN}`).join('') + [1, 2, 3, 5, 6, 7, 8].map((i) => `M${MARGIN} ${(height * i) / 9}H${width - MARGIN}`).join('')}
        />
      )}
      <g className="led">
        <path className="led__halo" d={upper + lower} />
        <path className="led__tube" d={upper + lower} />
        {digit && (
          <>
            <text className="led__halo led__digit" x={width / 2} y={digitY}>
              {digit}
            </text>
            <text className="led__tube led__digit" x={width / 2} y={digitY}>
              {digit}
            </text>
          </>
        )}
      </g>
      {digit && door.day === BIRTHDAY && <Cake x={width / 2} y={digitY - 16.2} />}
    </g>
  );
}

// A door in the facade: the room behind it and its two leaves.
export default function AdventDoor({ door }: { door: Door }) {
  const { x, y, width, height, kind } = door;
  const [left, right] = digitsOf(door.day);
  const opening = kind === 'arched' ? `M0 ${height}V${width / 2}A${width / 2} ${width / 2} 0 0 1 ${width} ${width / 2}V${height}z` : `M0 0H${width}V${height}H0z`;
  return (
    <svg className="advent-door__drawing" viewBox={`${x - 52} ${door.hit.top} 104 ${door.hit.bottom - door.hit.top}`} aria-hidden="true">
      <g transform={`translate(${x - width / 2} ${y})`}>
        <path className="advent-door__room" d={opening} />
        <text className="advent-door__inside" x={width / 2} y={height * 0.6}>
          {door.day}
        </text>
        {door.day === BIRTHDAY && (
          <g className="advent-door__inside">
            <Cake x={width / 2} y={height * 0.6 - 15} />
          </g>
        )}
        <g className="advent-door__leaf advent-door__leaf--left">
          <AdventLeaf door={door} side="left" digit={left} />
        </g>
        <g transform={`translate(${width / 2} 0)`}>
          <g className="advent-door__leaf advent-door__leaf--right" style={{ transformOrigin: `${width / 2}px 0` }}>
            <AdventLeaf door={door} side="right" digit={right} />
          </g>
        </g>
      </g>
    </svg>
  );
}
