import { useEffect, useRef, useState } from 'react';
import { clamp, lerp } from '../ride/math';
import Hud from './Hud';
import Scene from './Scene';

// Film grain, rendered once into a small tile instead of an SVG filter that repaints.
function grainTile() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
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
const ease = (t) => t + (t * t * (3 - 2 * t) - t) * 0.6;

function scrollToWorld(anchors, scroll) {
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

export default function RidePanel({ anchorsRef, panelRef }) {
  const frameRef = useRef(null);
  const [x, setX] = useState(0);
  const [size, setSize] = useState({ width: 800, height: 1000 });
  const [grain, setGrain] = useState(null);

  // Needs a canvas, so it's drawn after hydration rather than during the prerender.
  useEffect(() => setGrain(grainTile()), []);

  useEffect(() => {
    const frame = frameRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const viewHeight = clamp(height * 1.25, 640, 1000);
      setSize({ width: (viewHeight * width) / height, height: viewHeight });
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = scrollToWorld(anchorsRef.current, window.scrollY);
    let last = performance.now();
    let frame;
    const tick = (now) => {
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
        <Scene x={x} width={size.width} height={size.height} />
        <div className="ride-frame__grain" style={grain ? { backgroundImage: grain } : undefined} />
        <Hud x={x} />
      </div>
    </aside>
  );
}
