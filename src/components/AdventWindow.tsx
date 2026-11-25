import { Fragment, useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { FACTS } from '../advent/facts';
import { digitsOf, type Door } from '../advent/townhall';
import { AdventLeaf } from './AdventDoor';

interface AdventWindowProps {
  door: Door;
  // Where the door is on screen. The window grows out of it.
  from: DOMRect | null;
  onClose: () => void;
}

const LEAVES = ['left', 'right'] as const;

// A door seen up close. It flies in closed, swings open, and what's behind it can be read in the light.
export default function AdventWindow({ door, from, onClose }: AdventWindowProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const fact = FACTS[door.day - 1]!;
  const digits = digitsOf(door.day);

  useLayoutEffect(() => {
    const element = dialog.current!;
    if (!element.open) element.showModal();
    // Rather than on the first source, where the dialog would put the focus.
    close.current!.focus({ preventScroll: true });
    if (!from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const to = frame.current!.getBoundingClientRect();
    const x = from.left + from.width / 2 - (to.left + to.width / 2);
    const y = from.top + from.height / 2 - (to.top + to.height / 2);
    const flight = frame.current!.animate([{ transform: `translate(${x}px, ${y}px) scale(${from.width / to.width}, ${from.height / to.height})` }, { transform: 'none' }], {
      duration: 620,
      easing: 'cubic-bezier(0.3, 0, 0.15, 1)',
    });
    return () => flight.cancel();
  }, [from]);

  // The page behind stays where it is while the window is open.
  useEffect(() => {
    document.documentElement.classList.add('advent-reading');
    return () => document.documentElement.classList.remove('advent-reading');
  }, []);

  const closeOutside = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  return (
    <dialog ref={dialog} className={`advent-window advent-window--${door.kind}`} lang="de" aria-labelledby="advent-title" onClose={onClose} onClick={closeOutside}>
      <div className="advent-window__frame" ref={frame}>
        <div className="advent-window__opening">
          <div className="advent-window__room">
            <div className="advent-window__text">
              <p className="advent-window__day">
                <span>{door.day}. Dezember</span>
                <span>{fact.topic}</span>
              </p>
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
              <button ref={close} type="button" className="advent-window__close" onClick={() => dialog.current?.close()}>
                Türchen schließen
              </button>
            </div>
          </div>
          {LEAVES.map((side, index) => (
            <svg key={side} className={`advent-window__leaf advent-window__leaf--${side}`} viewBox={`0 0 ${door.width / 2} ${door.height}`} preserveAspectRatio="none" aria-hidden="true">
              <AdventLeaf door={{ ...door, kind: door.kind === 'portal' ? 'portal' : 'window' }} side={side} digit={digits[index]!} />
            </svg>
          ))}
        </div>
      </div>
    </dialog>
  );
}
