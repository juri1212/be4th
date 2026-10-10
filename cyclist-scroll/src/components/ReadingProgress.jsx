import { useEffect, useRef } from 'react';

// A hairline across the top of the page that fills as you read `target`.
export default function ReadingProgress({ target }) {
  const barRef = useRef(null);

  useEffect(() => {
    let frame;
    const update = () => {
      frame = null;
      const element = target.current;
      if (!element || !barRef.current) return;
      const rect = element.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight * 0.6, 1);
      const progress = Math.min(Math.max(-rect.top / total, 0), 1);
      barRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      frame ??= requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target]);

  return <div className="reading-progress" ref={barRef} aria-hidden="true" />;
}
