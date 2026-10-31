import { useEffect, useRef, useState, type RefObject } from 'react';
import { clamp, lerp } from '../ride/math';
import Hud, { type Chapter } from './Hud';
import Scene, { FOCUS_Y, FOCUS_Y_STACKED } from './Scene';

// Film grain, rendered once into a small tile instead of an SVG filter that repaints.
function grainTile(): string {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.random() * 255;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return `url(${canvas.toDataURL()})`;
}

// Eases between anchors so the rider settles near each chapter without stopping.
const ease = (t: number) => t + (t * t * (3 - 2 * t) - t) * 0.6;

// Pins a scroll position to a point on the route: at `scroll`, the rider is at world `x`.
export interface RideAnchor {
  scroll: number;
  x: number;
}

function scrollToWorld(anchors: RideAnchor[], scroll: number): number {
  if (!anchors.length) return 0;
  if (scroll <= anchors[0].scroll) return anchors[0].x;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (scroll <= b.scroll) {
      const span = b.scroll - a.scroll;
      return span <= 0 ? b.x : lerp(a.x, b.x, ease((scroll - a.scroll) / span));
    }
  }
  return anchors[anchors.length - 1].x;
}

interface RidePanelProps {
  anchorsRef: RefObject<RideAnchor[]>;
  panelRef: RefObject<HTMLElement | null>;
  // Media query for the layout where the panel sits above the story instead of beside it.
  stackedQuery: string;
  chapter: Chapter;
}

export default function RidePanel({ anchorsRef, panelRef, stackedQuery, chapter }: RidePanelProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [size, setSize] = useState({ width: 800, height: 1000 });
  const [stacked, setStacked] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(stackedQuery);
    const update = () => setStacked(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [stackedQuery]);
  const [grain, setGrain] = useState<string | null>(null);

  // Needs a canvas, so it's drawn after hydration rather than during the prerender.
  useEffect(() => setGrain(grainTile()), []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const viewHeight = clamp(height * 1.25, 480, 1000);
      setSize({ width: (viewHeight * width) / height, height: viewHeight });
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = scrollToWorld(anchorsRef.current, window.scrollY);
    let last = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      const target = scrollToWorld(anchorsRef.current, window.scrollY);
      current = reducedMotion.matches ? target : lerp(current, target, 1 - Math.exp(-dt * 5));
      if (Math.abs(target - current) < 0.05) current = target;
      setX(Math.round(current * 100) / 100);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [anchorsRef]);

  return (
    <aside className="ride-panel" ref={panelRef} aria-label="Ride progress">
      <div className="ride-frame" ref={frameRef}>
        <Scene x={x} width={size.width} height={size.height} focusY={stacked ? FOCUS_Y_STACKED : FOCUS_Y} />
        <div className="ride-frame__grain" style={grain ? { backgroundImage: grain } : undefined} />
        <Hud x={x} chapter={chapter} />
      </div>
    </aside>
  );
}
