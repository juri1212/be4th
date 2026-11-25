import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type SyntheticEvent } from 'react';
import { FACTS } from '../advent/facts';
import { digitsOf, type Door } from '../advent/townhall';
import { zoomIn } from '../advent/zoom';
import { AdventLeaf } from './AdventDoor';
import AdventDrawing from './AdventDrawing';

interface AdventWindowProps {
  door: Door;
  // It was already open, and is only read again.
  again: boolean;
  // The leaves start to swing open.
  onOpen: () => void;
  onClose: () => void;
}

const LEAVES = ['left', 'right'] as const;
// Up close every window is rectangular, with the proportions of those in the facade.
const WINDOW_WIDTH = 60;

// Not called when one of them is cancelled before that.
function whenFinished(animations: Animation[], then: () => void) {
  Promise.all(animations.map(({ finished }) => finished)).then(then, () => {});
}

// A door seen up close. The camera zooms in on it, it swings open, and what's behind it can be read in the light.
export default function AdventWindow({ door, again, onOpen, onClose }: AdventWindowProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const opening = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const camera = useRef<Animation[]>([]);
  const [arrived, setArrived] = useState(again);
  const [leaving, setLeaving] = useState(false);
  const fact = FACTS[door.day - 1]!;
  const digits = digitsOf(door.day);

  useLayoutEffect(() => {
    const element = dialog.current!;
    if (!element.open) element.showModal();
    // Rather than on the first source, where the dialog would put the focus.
    close.current!.focus({ preventScroll: true });
    const stage = document.querySelector('.site');
    const inFacade = document.getElementById(`tuerchen-${door.day}`);
    if (!stage || !inFacade || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setArrived(true);
      return;
    }

    const start = () => {
      camera.current = zoomIn({ stage, door: inFacade, frame: frame.current!, opening: opening.current! });
      whenFinished(camera.current, () => setArrived(true));
    };
    const cancel = () => camera.current.forEach((animation) => animation.cancel());
    // Everything is somewhere else now: aim again, unless the camera is on its way out.
    const resize = () => {
      const { currentTime, playbackRate } = camera.current[0]!;
      if (playbackRate < 0) return;
      cancel();
      start();
      camera.current.forEach((animation) => (animation.currentTime = currentTime));
    };
    start();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancel();
    };
  }, [door.day]);

  // The page behind stays where it is while the window is open.
  useEffect(() => {
    document.documentElement.classList.add('advent-reading');
    return () => document.documentElement.classList.remove('advent-reading');
  }, []);

  // Zooms out, and closes when the whole town hall is back in view.
  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    camera.current.forEach((animation) => animation.reverse());
    whenFinished(camera.current, () => dialog.current?.close());
  };

  const cancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    leave();
  };

  const closeOutside = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) leave();
  };

  return (
    <dialog
      ref={dialog}
      className="advent-window"
      data-open={arrived || undefined}
      data-again={again || undefined}
      data-leaving={leaving || undefined}
      style={{ '--proportion': door.height / (door.kind === 'arched' ? WINDOW_WIDTH : door.width) } as CSSProperties}
      lang="de"
      aria-labelledby="advent-title"
      onCancel={cancel}
      onClose={onClose}
      onClick={closeOutside}
    >
      <div className="advent-window__frame" ref={frame}>
        <div className="advent-window__opening" ref={opening} onAnimationStart={onOpen}>
          <div className="advent-window__room">
            <div className="advent-window__text">
              <p className="advent-window__day">
                <span>{door.day}. Dezember</span>
                <span>{fact.topic}</span>
              </p>
              <AdventDrawing day={door.day} label={fact.drawing} />
              <h2 id="advent-title">{fact.title}</h2>
              <p className="advent-window__fact">{fact.text}</p>
              <p className="advent-window__sources">
                {fact.sources.length > 1 ? 'Quellen' : 'Quelle'}:{' '}
                {fact.sources.map(({ name, url }, index) => (
                  <Fragment key={url}>
                    {index > 0 && ', '}
                    {/* In a new tab, so the door stays open here. */}
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {name}
                    </a>
                  </Fragment>
                ))}
              </p>
              <button ref={close} type="button" className="advent-window__close" onClick={leave}>
                Türchen schließen
              </button>
            </div>
          </div>
          {LEAVES.map((side, index) => (
            <svg key={side} className={`advent-window__leaf advent-window__leaf--${side}`} viewBox={`0 0 ${WINDOW_WIDTH / 2} ${door.height}`} preserveAspectRatio="none" aria-hidden="true">
              <AdventLeaf door={{ ...door, kind: 'window', width: WINDOW_WIDTH }} side={side} digit={digits[index]!} />
            </svg>
          ))}
        </div>
      </div>
    </dialog>
  );
}
