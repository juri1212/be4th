import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PaletteButton from '../components/PaletteButton';
import RidePanel from '../components/RidePanel';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import Tags from '../components/Tags';
import { ArrowDown, ArrowUp, External } from '../components/icons';
import { POSTS, PROJECTS, postUrl, projectUrl } from '../content';
import { clamp } from '../ride/math';
import { FINISH_X, kmAt } from '../ride/route';
import { STAGES } from '../ride/stages';
import { SITE, TOOLBOX, formatDate } from '../site';
import '../styles/home.css';

// One stage per section: the intro at the start line, each project on its own stage,
// then the toolbox and writing on the descent, and contact a few metres past the finish.
const ANCHORS = [0, ...STAGES.slice(0, 6).map((stage) => stage.anchor), FINISH_X + 240];
// Where the rider is when each chapter is in focus, shown in the gutter like a road book.
const KM_MARKS = ANCHORS.map((x) => (x > FINISH_X ? 'Finish' : `Km ${Math.round(kmAt(x))}`));
const STACKED_LAYOUT = '(max-width: 900px)';
const WORK = PROJECTS.slice(0, 4);
const SECTIONS = { intro: 0, work: 1, toolbox: WORK.length + 1, writing: WORK.length + 2, contact: WORK.length + 3 };

const NAV = [
  { id: 'work', href: '#work', label: 'Work' },
  { id: 'toolbox', href: '#toolbox', label: 'Toolbox' },
  { id: 'writing', href: '#writing', label: 'Writing' },
  { id: 'contact', href: '#contact', label: 'Contact' },
];

function navSection(active) {
  if (active >= SECTIONS.contact) return 'contact';
  if (active >= SECTIONS.writing) return 'writing';
  if (active >= SECTIONS.toolbox) return 'toolbox';
  if (active >= SECTIONS.work) return 'work';
  return null;
}

function Km({ index }) {
  return (
    <span className="chapter__km" aria-hidden="true">
      {KM_MARKS[index]}
    </span>
  );
}

function ProjectChapter({ project, index, ...props }) {
  const { links } = project;
  return (
    <section className="chapter chapter--project" aria-labelledby={`project-${project.slug}`} {...props}>
      <p className="chapter__meta">
        <Km index={index} />
        {project.kind}, {project.year}
      </p>
      <h2 id={`project-${project.slug}`}>
        <a href={projectUrl(project)}>{project.title}</a>
      </h2>
      <p className="lede">{project.tagline}</p>
      <p>{project.summary}</p>
      <ul className="highlights">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <Tags items={project.stack} />
      <div className="actions">
        <a className="button" href={projectUrl(project)}>
          Read the write-up
        </a>
        {links.live && (
          <a className="link" href={links.live}>
            Live <External />
          </a>
        )}
        <a className="link" href={links.source}>
          Source <External />
        </a>
      </div>
    </section>
  );
}

export default function Home() {
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

  const latestPost = POSTS[0];

  return (
    <div className="page">
      <RidePanel anchorsRef={anchorsRef} panelRef={panelRef} />

      <div className="story">
        <SiteHeader links={NAV} current={navSection(active)} brand={false} />

        <main id="main">
          <section className="chapter chapter--intro" {...sectionProps(SECTIONS.intro)}>
            <h1>
              <Km index={SECTIONS.intro} />
              Juri Beforth
            </h1>
            <p className="lede">
              I build software across the whole stack — native macOS apps in Swift, backend services in Rust and web apps in
              React and TypeScript — and the pipelines that ship them.
            </p>
            <dl className="now">
              <div>
                <dt>Featured</dt>
                <dd>
                  <a href={projectUrl(PROJECTS[0])}>{PROJECTS[0].title}</a>
                  <span>{PROJECTS[0].tagline}</span>
                </dd>
              </div>
              {latestPost && (
                <div>
                  <dt>Latest post</dt>
                  <dd>
                    <a href={postUrl(latestPost)}>{latestPost.title}</a>
                  </dd>
                </div>
              )}
            </dl>
            <div className="actions">
              <a className="button button--solid" href="#work">
                See the work
                <ArrowDown />
              </a>
            </div>
          </section>

          {WORK.map((project, index) => (
            <ProjectChapter
              key={project.slug}
              project={project}
              index={SECTIONS.work + index}
              id={index === 0 ? 'work' : undefined}
              {...sectionProps(SECTIONS.work + index)}
            />
          ))}

          <section id="toolbox" className="chapter" {...sectionProps(SECTIONS.toolbox)}>
            <h2>
              <Km index={SECTIONS.toolbox} />
              Toolbox
            </h2>
            <p>What I reach for, from the interface to the API to the workflow that deploys it.</p>
            <dl className="toolbox">
              {TOOLBOX.map(({ area, tools }) => (
                <div key={area}>
                  <dt>{area}</dt>
                  <dd>
                    <Tags items={tools} label={area} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="writing" className="chapter" {...sectionProps(SECTIONS.writing)}>
            <h2>
              <Km index={SECTIONS.writing} />
              Writing
            </h2>
            <ul className="posts">
              {POSTS.slice(0, 3).map((post) => (
                <li key={post.slug}>
                  <a href={postUrl(post)}>{post.title}</a>
                  <span className="posts__meta">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>{post.readingTime} min read</span>
                  </span>
                  <p>{post.summary}</p>
                </li>
              ))}
            </ul>
            <div className="actions">
              <a className="button" href="/blog/">
                All writing
              </a>
              <a className="link" href="/feed.xml">
                RSS feed
              </a>
            </div>
          </section>

          <section id="contact" className="chapter chapter--outro" {...sectionProps(SECTIONS.contact)}>
            <h2>
              <Km index={SECTIONS.contact} />
              Get in touch
            </h2>
            <p className="lede">
              Have a project, a question or an idea? The fastest way to reach me is on <a href={SITE.github}>GitHub</a>.
            </p>
            <div className="actions">
              <a className="button button--solid" href={SITE.github}>
                GitHub
                <External />
              </a>
              <button type="button" className="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Back to top
                <ArrowUp />
              </button>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>

      <PaletteButton className="palette-button palette-fab" />
    </div>
  );
}
