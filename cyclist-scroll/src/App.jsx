import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import RidePanel from './components/RidePanel';
import { clamp } from './ride/math';
import { FINISH_X } from './ride/route';
import { STAGES, TOTALS } from './ride/stages';
import './App.css';

// The rider rolls a few metres past the line on the final chapter.
const ANCHORS = [0, ...STAGES.map((stage) => stage.anchor), FINISH_X + 240];
const STACKED_LAYOUT = '(max-width: 900px)';

const formatNumber = (value, digits = 0) =>
  value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function stageStats({ distance, gain, loss, maxGrade, minGrade }) {
  const descending = loss > gain * 2;
  return [
    ['Distance', formatNumber(distance, 1), 'km'],
    descending ? ['Descending', formatNumber(loss), 'm'] : ['Climbing', formatNumber(gain), 'm'],
    descending ? ['Max grade', `−${formatNumber(Math.abs(minGrade), 1)}`, '%'] : ['Max grade', formatNumber(maxGrade, 1), '%'],
  ];
}

function Stats({ items }) {
  return (
    <dl className="stats">
      {items.map(([label, value, unit]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            {value}
            <span>{unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function App() {
  const sectionRefs = useRef([]);
  const panelRef = useRef(null);
  const anchorsRef = useRef([]);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const stacked = window.matchMedia(STACKED_LAYOUT).matches;
      const panelHeight = stacked && panelRef.current ? panelRef.current.offsetHeight : 0;
      const focusY = panelHeight + (window.innerHeight - panelHeight) / 2;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const anchors = sectionRefs.current.map((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + window.scrollY + rect.height / 2;
        return { scroll: clamp(center - focusY, 0, maxScroll), x: ANCHORS[index] };
      });
      anchors[0].scroll = 0;
      anchors[anchors.length - 1].scroll = maxScroll;
      anchorsRef.current = anchors;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const anchors = anchorsRef.current;
      let nearest = 0;
      anchors.forEach((anchor, index) => {
        if (Math.abs(anchor.scroll - window.scrollY) < Math.abs(anchors[nearest].scroll - window.scrollY)) nearest = index;
      });
      setActive(nearest);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const sectionProps = (index) => ({
    ref: (element) => {
      sectionRefs.current[index] = element;
    },
    'data-active': active === index,
  });

  return (
    <div className="page">
      <RidePanel anchorsRef={anchorsRef} panelRef={panelRef} />

      <main className="story">
        <section className="chapter chapter--intro" {...sectionProps(0)}>
          <p className="eyebrow">A ride in seven stages</p>
          <h1>
            Ride your <em>map</em>
          </h1>
          <p className="lede">From Dutch lowlands to legendary Alpine roads.</p>
          <Stats
            items={[
              ['Distance', formatNumber(TOTALS.distance), 'km'],
              ['Climbing', formatNumber(TOTALS.gain), 'm'],
              ['High point', formatNumber(TOTALS.high), 'm'],
            ]}
          />
          <div className="scroll-cue">
            <span className="scroll-cue__line" />
            Scroll to ride
          </div>
        </section>

        {STAGES.map((stage, index) => (
          <section key={stage.number} className="chapter" {...sectionProps(index + 1)}>
            <div className="chapter__meta">
              <span className="chapter__number">{stage.number}</span>
              <span className="chapter__rule" />
              <span>{stage.region}</span>
            </div>
            <h2>{stage.title}</h2>
            <p>{stage.text}</p>
            <Stats items={stageStats(stage.stats)} />
          </section>
        ))}

        <section className="chapter chapter--outro" {...sectionProps(STAGES.length + 1)}>
          <p className="eyebrow">Finish · Bourg d’Oisans</p>
          <h1>
            Journey <em>complete</em>
          </h1>
          <p className="lede">You’ve reached the end of the ride.</p>
          <button type="button" className="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Ride it again
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
            </svg>
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
