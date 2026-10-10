import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import RidePanel from './components/RidePanel';
import { clamp } from './ride/math';
import { FINISH_X } from './ride/route';
import { LINKS, POSTS, PROJECTS, formatDate } from './content';
import './App.css';

// Where the rider stands for each section: lowlands, Stuttgart, Alpe d’Huez, a few metres past the line.
const ANCHORS = [0, 5900, 13700, FINISH_X + 240];
const STACKED_LAYOUT = '(max-width: 900px)';

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
  </svg>
);

function Facts({ items }) {
  return (
    <dl className="stats">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
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

  // Links like /#work arrive before the sections exist, so the browser can't jump on its own.
  useEffect(() => {
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();
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
          <p className="eyebrow">Juri Beforth · Developer</p>
          <h1>
            I build <em>things</em>
          </h1>
          <p className="lede">Apps, tools and websites — and the occasional write-up of how they work.</p>
          <nav className="jump" aria-label="Sections">
            <a href="#work">Work</a>
            <a href="#writing">Writing</a>
            <a href={LINKS.github}>GitHub</a>
          </nav>
          <div className="scroll-cue">
            <span className="scroll-cue__line" />
            Scroll to ride
          </div>
        </section>

        <section id="work" className="chapter" {...sectionProps(1)}>
          <div className="chapter__meta">
            <span className="chapter__number">01</span>
            <span className="chapter__rule" />
            <span>Work</span>
          </div>
          {PROJECTS.map((project) => (
            <article key={project.name} className="project">
              <img className="project__icon" src={project.icon} alt="" width="64" height="64" />
              <h2>
                <a href={project.url}>{project.name}</a>
              </h2>
              <p className="lede">{project.tagline}</p>
              <p>{project.description}</p>
              <Facts items={project.facts} />
              <div className="actions">
                <a className="button" href={project.url}>
                  View project
                  <Arrow />
                </a>
                <a className="link" href={project.source}>
                  Source on GitHub
                </a>
              </div>
            </article>
          ))}
        </section>

        <section id="writing" className="chapter" {...sectionProps(2)}>
          <div className="chapter__meta">
            <span className="chapter__number">02</span>
            <span className="chapter__rule" />
            <span>Writing</span>
          </div>
          <h2>
            From the <em>blog</em>
          </h2>
          <ul className="posts">
            {POSTS.map((post) => (
              <li key={post.url}>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <a href={post.url}>{post.title}</a>
                <p>{post.summary}</p>
              </li>
            ))}
          </ul>
          <a className="button" href="/blog/">
            All posts
            <Arrow />
          </a>
        </section>

        <section className="chapter chapter--outro" {...sectionProps(3)}>
          <p className="eyebrow">Finish · Bourg d’Oisans</p>
          <h1>
            Say <em>hello</em>
          </h1>
          <p className="lede">
            Questions, ideas or bugs? Find me on <a href={LINKS.github}>GitHub</a>.
          </p>
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
