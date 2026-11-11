import { useEffect, useRef, useState, type CSSProperties } from 'react';
import PageLayout from '../components/PageLayout';
import { Pause, Play } from '../components/icons';
import type { Garage as GarageScene } from '../garage/scene';
import { DURATION, STEPS } from '../garage/timeline';
import '../styles/garage.css';

type Status = 'loading' | 'ready' | 'failed';

const SPECS = [
  {
    name: 'The car',
    model: '911 Carrera',
    facts: ['992 generation in Oak Green Metallic Neo', 'Glass roof, privacy glass, black leather', 'No roof rails, so nothing to clamp a carrier to'],
  },
  {
    name: 'The bike',
    model: 'Rose Backroad FF',
    facts: ['Carbon gravel bike in Rotten Candy', 'One chainring and deep carbon rims', 'Thru-axles front and rear'],
  },
  {
    name: 'The rack',
    model: 'Five vacuum cups',
    facts: ['Four under the board, a fifth under the rear wheel', 'A fork mount that takes the bike’s own thru-axle', 'Held to the car by suction alone'],
  },
];

export default function Garage() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<GarageScene | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [time, setTime] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    const container = host.current!;
    // A canvas per run, so a remount never shares a WebGL context with the scene it replaces.
    const canvas = document.createElement('canvas');
    container.append(canvas);
    let cancelled = false;
    let created: GarageScene | undefined;
    import('../garage/scene')
      .then(({ createGarage }) =>
        createGarage(canvas, {
          onTime: (now, current) => {
            setTime(now);
            setStep(current);
          },
          onState: (state) => {
            setPlaying(state.playing);
            setFollowing(state.following);
          },
        }),
      )
      .then((garage) => {
        if (cancelled) {
          garage.dispose();
          return;
        }
        created = garage;
        scene.current = garage;
        setStatus('ready');
        if (import.meta.env.DEV) Object.assign(window, { __garage: garage });
        // ?t=12 opens on that second of the sequence. Visitors who ask for less motion get the loaded car, paused.
        const start = Number(new URLSearchParams(window.location.search).get('t'));
        if (start > 0) garage.seek(start);
        else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) garage.seek(garage.duration);
        else garage.play();
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!cancelled) setStatus('failed');
      });
    return () => {
      cancelled = true;
      created?.dispose();
      scene.current = null;
      canvas.remove();
    };
  }, []);

  const current = STEPS[step]!;
  const ended = time >= DURATION;
  const toggle = () => (playing ? scene.current?.pause() : scene.current?.play());

  return (
    <PageLayout>
      <article className="garage">
        <section className={`stage stage--${status}`} aria-label="Loading the bike onto the car, in 3D">
          <div className="stage__view" ref={host} />
          <header className="stage__intro">
            <h1>Loading up</h1>
            <p className="lede">The 911 has no roof rails. The Backroad travels on it anyway: front wheel off, fork onto a rack held by suction.</p>
          </header>

          {status === 'loading' && <p className="stage__status">Rolling the car in…</p>}
          {status === 'failed' && <p className="stage__status">The 3D scene couldn’t start. It needs WebGL, which this browser has switched off or doesn’t support.</p>}

          {status === 'ready' && (
            <div className="stage__panel">
              <div className="stage__caption" aria-live="polite">
                <p className="stage__count">
                  {step + 1}
                  <span> of {STEPS.length}</span>
                </p>
                <h2>{current.title}</h2>
                <p>{current.text}</p>
              </div>
              <div className="stage__controls">
                <button type="button" className="button button--solid" onClick={toggle}>
                  {playing ? <Pause /> : <Play />}
                  {playing ? 'Pause' : ended ? 'Play again' : 'Play'}
                </button>
                <div className="route">
                  <input
                    type="range"
                    min={0}
                    max={DURATION}
                    step={0.01}
                    value={time}
                    aria-label="Position in the sequence"
                    aria-valuetext={`Step ${step + 1} of ${STEPS.length}: ${current.title}`}
                    style={{ '--progress': time / DURATION } as CSSProperties}
                    onChange={(event) => {
                      scene.current?.pause();
                      scene.current?.seek(Number(event.target.value));
                    }}
                  />
                  <ol className="route__stops">
                    {STEPS.map((stop, index) => (
                      <li key={stop.title} style={{ '--at': stop.from / DURATION } as CSSProperties}>
                        <button type="button" aria-current={index === step ? 'step' : undefined} onClick={() => scene.current?.seek(stop.from + 0.01)}>
                          <span className="route__number">{index + 1}</span>
                          <span className="route__name">{stop.title}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
                {following ? (
                  <p className="stage__hint">Drag to look around</p>
                ) : (
                  <button type="button" className="button" onClick={() => scene.current?.follow()}>
                    Follow the action
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="specs" aria-label="What is in the scene">
          {SPECS.map((spec) => (
            <div key={spec.name}>
              <h2>{spec.name}</h2>
              <p className="specs__model">{spec.model}</p>
              <ul>
                {spec.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <p className="garage__credit">
          The car is adapted from <a href="https://sketchfab.com/3d-models/porsche-911-992-dd10a7e346a645af8ba80be48b604854">Porsche 911 992</a> by Márcio Meireles, licensed{' '}
          <a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>: repainted, given new tyres and a glass roof, and reduced for the web. The bike and the rack are
          modelled in code for this page.
        </p>
      </article>
    </PageLayout>
  );
}
