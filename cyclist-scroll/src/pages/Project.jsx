import { useRef } from 'react';
import PageLayout from '../components/PageLayout';
import Prose from '../components/Prose';
import ReadingProgress from '../components/ReadingProgress';
import TableOfContents from '../components/TableOfContents';
import Tags from '../components/Tags';
import { ArrowLeft, ArrowRight, External } from '../components/icons';
import { POSTS, PROJECTS, postUrl, projectUrl } from '../content';

const LINK_LABELS = { download: 'Download', live: 'Open the app', source: 'Source on GitHub' };

export default function Project({ project }) {
  const { meta, html, headings } = project;
  const articleRef = useRef(null);
  const index = PROJECTS.findIndex((item) => item.slug === meta.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const post = POSTS.find((item) => item.slug === meta.post);
  const links = Object.entries(meta.links);

  return (
    <PageLayout current="work">
      <ReadingProgress target={articleRef} />
      <article ref={articleRef}>
        <header className="project-hero">
          <div className="project-hero__text">
            <a className="back" href="/projects/">
              <ArrowLeft /> All work
            </a>
            {meta.icon && <img className="project-hero__icon" src={meta.icon} alt="" width="72" height="72" />}
            <p className="eyebrow">
              {meta.kind} · {meta.year}
            </p>
            <h1>{meta.title}</h1>
            <p className="lede">{meta.tagline}</p>
            <p>{meta.summary}</p>
            <div className="actions">
              {links.map(([kind, href], position) => (
                <a key={kind} className={position === 0 ? 'button button--solid' : 'button'} href={href}>
                  {LINK_LABELS[kind] ?? kind}
                  <External />
                </a>
              ))}
            </div>
          </div>
          {meta.image ? (
            <img className="project-hero__shot" src={meta.image} alt={meta.imageAlt ?? ''} width="768" height="922" />
          ) : (
            <ul className="project-hero__highlights">
              {meta.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}
        </header>

        <dl className="facts">
          <div>
            <dt>Type</dt>
            <dd>{meta.kind}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{meta.year}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>
              <Tags items={meta.stack} />
            </dd>
          </div>
        </dl>

        <div className="article-layout">
          <aside>
            <TableOfContents headings={headings} />
          </aside>
          <div>
            <Prose html={html} />
            {post && (
              <a className="related" href={postUrl(post)}>
                <span className="eyebrow">Related writing</span>
                <span className="related__title">{post.title}</span>
                <span className="related__more">
                  Read the guide <ArrowRight />
                </span>
              </a>
            )}
          </div>
        </div>
      </article>

      {next && next.slug !== meta.slug && (
        <a className="next-up" href={projectUrl(next)}>
          <span className="eyebrow">Next project</span>
          <span className="next-up__title">
            {next.title}
            <ArrowRight />
          </span>
          <span className="next-up__tagline">{next.tagline}</span>
        </a>
      )}
    </PageLayout>
  );
}
