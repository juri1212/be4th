import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import ActivityGraph, { ActivityLegend } from '../components/ActivityGraph';
import RidePanel, { type RideAnchor } from '../components/RidePanel';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import Tags from '../components/Tags';
import { ArrowDown, External } from '../components/icons';
import { POSTS, PROJECTS, postUrl } from '../content';
import { clamp } from '../ride/math';
import { FINISH_X, kmAt } from '../ride/route';
import { STAGES } from '../ride/stages';
import { SITE, formatDate, type NavLink } from '../site';
import type { Project } from '../types';
import '../styles/home.css';

const STACKED_LAYOUT = '(max-width: 900px)';
const WORK = PROJECTS.slice(0, 2);
// The project write-ups have their own chapters, so the writing section lists the other posts.
// Until there are posts that aren't write-ups, it lists the write-ups rather than standing empty.
const OTHER_POSTS = POSTS.filter((post) => !post.featured);
const WRITING = OTHER_POSTS.length ? OTHER_POSTS : POSTS;
const SECTIONS = { intro: 0, work: 1, activity: WORK.length + 1, writing: WORK.length + 2, contact: WORK.length + 3 };
// Mirrors each chapter's heading, so the HUD can carry it once the real one scrolls under the ride panel.
const HEADINGS = ['Juri Beforth', ...WORK.map((project) => project.title), 'Activity', 'Writing', 'Get in touch'];
// The intro sits at the start line and contact a few metres past the finish. Every chapter in between stops at
// the stage scenery closest to an even split of the route, so the spacing stays roughly even as chapters change.
const ROUTE_KM = kmAt(FINISH_X);
const nearestStageAnchor = (km: number) =>
  STAGES.reduce((best, stage) =>
    Math.abs(kmAt(stage.anchor) - km) < Math.abs(kmAt(best.anchor) - km) ? stage : best,
  ).anchor;
// The last chapter stops just over the line, with the gantry behind the rider rather than across them.
const FINISH_CLEARANCE = 120;
const ANCHORS = [
  0,
  ...HEADINGS.slice(1, -1).map((_, index) => nearestStageAnchor((ROUTE_KM * (index + 1)) / (HEADINGS.length - 1))),
  FINISH_X + FINISH_CLEARANCE,
];
// Where the rider is when each chapter is in focus, shown in the gutter like a road book.
const KM_MARKS = ANCHORS.map((x) => (x >= FINISH_X ? 'Finish' : `Km ${Math.round(kmAt(x))}`));
// Past the last chapter the rider rolls on through the finish while the footer comes up.
const ROLL_OUT = 240;

const NAV: NavLink[] = [
  { id: 'work', href: '#work', label: 'Work' },
  { id: 'activity', href: '#activity', label: 'Activity' },
  { id: 'writing', href: '#writing', label: 'Writing' },
  { id: 'contact', href: '#contact', label: 'Contact' },
];

function navSection(active: number): string | null {
  if (active >= SECTIONS.contact) return 'contact';
  if (active >= SECTIONS.writing) return 'writing';
  if (active >= SECTIONS.activity) return 'activity';
  if (active >= SECTIONS.work) return 'work';
  return null;
}

function Km({ index }: { index: number }) {
  return (
    <span className="chapter__km" aria-hidden="true">
      {KM_MARKS[index]}
    </span>
  );
}

function ProjectChapter({ project, index, ...props }: { project: Project; index: number } & ComponentProps<'section'>) {
  const { links } = project;
  return (
    <section className="chapter chapter--project" aria-labelledby={`project-${project.slug}`} {...props}>
      <p className="chapter__meta">
        <Km index={index} />
        {project.kind}, {project.year}
      </p>
      <h2 id={`project-${project.slug}`}>
        <a href={postUrl(project)}>{project.title}</a>
      </h2>
      <p className="lede">{project.tagline}</p>
      <p>{project.summary}</p>
      <ul className="highlights">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <Tags items={project.tags} />
      <div className="actions">
        <a className="button" href={postUrl(project)}>
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
  const sectionRefs = useRef<HTMLElement[]>([]);
  const panelRef = useRef<HTMLElement>(null);
  const anchorsRef = useRef<RideAnchor[]>([]);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const stacked = window.matchMedia(STACKED_LAYOUT).matches;
      const header = document.querySelector<HTMLElement>('.story > .site-header');
      // What the sticky header covers, plus the ride panel above it when the layout is stacked.
      const sticky = (header?.offsetHeight ?? 0) + (stacked && panelRef.current ? panelRef.current.offsetHeight : 0);
      // Side by side, the header is only a fading strip over the story, so chapters centre in the whole viewport.
      const covered = stacked ? sticky : 0;
      const room = window.innerHeight - covered;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const anchors: RideAnchor[] = sectionRefs.current.map((section, index) => {
        const top = (section.firstElementChild ?? section).getBoundingClientRect().top + window.scrollY;
        const bottom = (section.lastElementChild ?? section).getBoundingClientRect().bottom + window.scrollY;
        // A chapter is in focus when it's centred in the free space. One too tall for that is in focus from its heading.
        const scroll = bottom - top > window.innerHeight - sticky - 32 ? top - sticky - 12 : (top + bottom) / 2 - covered - room / 2;
        return { scroll: clamp(scroll, 0, maxScroll), x: ANCHORS[index] };
      });
      anchors[0].scroll = 0;
      if (maxScroll > anchors[anchors.length - 1].scroll) anchors.push({ scroll: maxScroll, x: FINISH_X + ROLL_OUT });
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
      setActive(Math.min(nearest, HEADINGS.length - 1));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const sectionProps = (index: number) => ({
    ref: (element: HTMLElement | null) => {
      if (element) sectionRefs.current[index] = element;
    },
    'data-active': active === index,
  });

  const latestPost = WRITING[0];

  return (
    <div className="page">
      <RidePanel
        anchorsRef={anchorsRef}
        panelRef={panelRef}
        stackedQuery={STACKED_LAYOUT}
        chapter={{ number: active + 1, total: HEADINGS.length, heading: HEADINGS[active] }}
      />

      <div className="story">
        <SiteHeader links={NAV} current={navSection(active)} brand={false} />

        <main id="main">
          <section className="chapter chapter--intro" {...sectionProps(SECTIONS.intro)}>
            <h1>
              <Km index={SECTIONS.intro} />
              Juri Beforth
            </h1>
            <p className="lede">
              Full-stack developer. I build native macOS apps in Swift, backend services in Rust and web apps in React and
              TypeScript, mostly between rides.
            </p>
            <dl className="now">
              <div>
                <dt>Featured</dt>
                <dd>
                  <a href={postUrl(PROJECTS[0])}>{PROJECTS[0].title}</a>
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

          <section id="activity" className="chapter" {...sectionProps(SECTIONS.activity)}>
            <h2>
              <Km index={SECTIONS.activity} />
              Activity
            </h2>
            <p>The last twelve months, day by day: code shipped and hours trained.</p>
            <ActivityGraph kind="github" />
            <ActivityGraph kind="strava" />
            <ActivityLegend />
          </section>

          <section id="writing" className="chapter" {...sectionProps(SECTIONS.writing)}>
            <h2>
              <Km index={SECTIONS.writing} />
              Writing
            </h2>
            <ul className="posts">
              {WRITING.slice(0, 3).map((post) => (
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
            </div>
          </section>

          <section id="contact" className="chapter chapter--outro" {...sectionProps(SECTIONS.contact)}>
            <h2>
              <Km index={SECTIONS.contact} />
              Get in touch
            </h2>
            <p className="lede">Have a project, a question or an idea? The fastest way to reach me is on GitHub.</p>
            <div className="actions">
              <a className="button button--solid" href={SITE.github}>
                GitHub
                <External />
              </a>
              <a className="button" href="/blog/">
                Read the writing
              </a>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>

    </div>
  );
}
