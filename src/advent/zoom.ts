// The camera that moves between the town hall and one of its windows.

const DURATION = 1050;
const STEPS = 48;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2);
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const centerOf = (rect: DOMRect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

interface Shot {
  // Everything the camera sees.
  stage: Element;
  // The door in the facade, and the frame with the opening it fills up close.
  door: Element;
  frame: Element;
  opening: Element;
}

// Moves the whole page towards the viewer until the door is as large as the window up close, which is fixed to it on the way.
// Reversing the animations zooms out again.
export function zoomIn({ stage, door, frame, opening }: Shot): Animation[] {
  const page = stage.getBoundingClientRect();
  const room = door.querySelector('.advent-door__room')!.getBoundingClientRect();
  const near = opening.getBoundingClientRect();
  const start = centerOf(room);
  const end = centerOf(near);
  // The facade never sticks out from behind the window, whose proportions follow its text.
  const zoom = Math.max(1.01, Math.min(near.width / room.width, near.height / room.height));

  const pageFrames: Keyframe[] = [];
  const windowFrames: Keyframe[] = [];
  for (let step = 0; step <= STEPS; step++) {
    // Growing by the same factor, not by the same amount, in the same time is what looks like an even approach.
    const scale = zoom ** easeInOut(step / STEPS);
    const progress = (scale - 1) / (zoom - 1);
    const x = mix(start.x, end.x, progress);
    const y = mix(start.y, end.y, progress);
    pageFrames.push({
      transformOrigin: '0 0',
      transform: `translate(${x - page.left - scale * (start.x - page.left)}px, ${y - page.top - scale * (start.y - page.top)}px) scale(${scale})`,
    });
    windowFrames.push({
      transform: `translate(${x - end.x}px, ${y - end.y}px) scale(${mix(room.width / near.width, 1, progress)}, ${mix(room.height / near.height, 1, progress)})`,
    });
  }

  const timing: KeyframeAnimationOptions = { duration: DURATION, fill: 'both' };
  return [
    stage.animate(pageFrames, timing),
    frame.animate(windowFrames, timing),
    // On the way the window takes over from the door, whose own leaves are then out of the way.
    frame.animate([{ opacity: 0 }, { opacity: 0, offset: 0.42 }, { opacity: 1, offset: 0.72 }, { opacity: 1 }], timing),
    ...Array.from(door.querySelectorAll('.advent-door__leaf'), (leaf) => leaf.animate([{ opacity: 1 }, { opacity: 1, offset: 0.72 }, { opacity: 0, offset: 0.8 }, { opacity: 0 }], timing)),
  ];
}
