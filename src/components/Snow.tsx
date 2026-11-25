import { useEffect, useRef } from 'react';
import { seededRandom } from '../ride/math';

const FLAKES_PER_PIXEL = 1 / 13_000;

// Falling snow over the whole of its parent. Visitors who ask for less motion don't get any.
export default function Snow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const context = canvas.getContext('2d');
    if (!context || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const random = seededRandom(1224);
    const flakes = Array.from({ length: 160 }, () => ({ x: random(), y: random(), depth: 0.25 + random() * 0.75, phase: random() * Math.PI * 2 }));
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * scale;
      canvas.height = height * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (now: number) => {
      const elapsed = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#f4f6ff';
      const count = Math.min(flakes.length, Math.round(width * height * FLAKES_PER_PIXEL));
      for (const flake of flakes.slice(0, count)) {
        flake.y += (elapsed * (16 + 34 * flake.depth)) / height;
        if (flake.y > 1.02) flake.y = -0.02;
        const x = flake.x * width + Math.sin(now / 1900 + flake.phase) * 14 * flake.depth;
        // Fades in below the header, where the sky begins.
        context.globalAlpha = (0.25 + 0.5 * flake.depth) * Math.min(1, Math.max(0, (flake.y * height) / 90));
        context.beginPath();
        context.arc(x, flake.y * height, 0.6 + 1.5 * flake.depth, 0, Math.PI * 2);
        context.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const resized = new ResizeObserver(resize);
    resized.observe(canvas);
    // Nothing falls while the scene is scrolled out of view.
    const seen = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) stop();
      else if (!frame) frame = requestAnimationFrame(draw);
    });
    seen.observe(canvas);
    return () => {
      stop();
      resized.disconnect();
      seen.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="advent-snow" aria-hidden="true" />;
}
