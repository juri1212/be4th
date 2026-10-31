import { useRef } from 'react';
import PageLayout from '../components/PageLayout';
import Prose from '../components/Prose';
import ReadingProgress from '../components/ReadingProgress';
import TableOfContents from '../components/TableOfContents';
import Tags from '../components/Tags';
import { ArrowLeft, External } from '../components/icons';
import { POSTS, PROJECTS, postUrl } from '../content';
import { SITE, formatDate } from '../site';
import type { Post as PostData, PostLinks } from '../types';

const LINK_LABELS: Record<keyof PostLinks, string> = { download: 'Download', live: 'Open the app', source: 'Source on GitHub' };

export default function Post({ post }: { post: PostData }) {
  const { meta, html, headings } = post;
  const articleRef = useRef<HTMLElement>(null);
  const project = PROJECTS.find((item) => item.slug === meta.project);
  const links = Object.entries(meta.links ?? {}) as [keyof PostLinks, string][];
  const others = POSTS.filter((item) => item.slug !== meta.slug && item !== project).slice(0, 2);

  return (
    <PageLayout current="writing">
      <ReadingProgress target={articleRef} />
      <article ref={articleRef}>
        <header className="post-header">
          <a className="back" href="/blog/">
            <ArrowLeft /> All writing
          </a>
          {meta.tags && <Tags items={meta.tags} label="Topics" />}
          <h1>{meta.title}</h1>
          <p className="lede">{meta.summary}</p>
          <p className="post-header__meta">
            <span>{SITE.author}</span>
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            <span>{meta.readingTime} min read</span>
          </p>
          {links.length > 0 && (
            <div className="actions">
              {links.map(([kind, href], position) => (
                <a key={kind} className={position === 0 ? 'button button--solid' : 'button'} href={href}>
                  {LINK_LABELS[kind] ?? kind}
                  <External />
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="article-layout">
          <aside>
            <TableOfContents headings={headings} />
          </aside>
          <div>
            <Prose html={html} />
            {project && (
              <a className="related" href={postUrl(project)}>
                <span className="eyebrow">The project</span>
                <span className="related__title">{project.title}</span>
                <span className="related__more">{project.tagline} Read how it’s built.</span>
              </a>
            )}
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="more-posts" aria-label="More writing">
          {others.map((item) => (
            <a key={item.slug} className="next-up" href={postUrl(item)}>
              <span className="eyebrow">Read next</span>
              <span className="next-up__title">{item.title}</span>
            </a>
          ))}
        </section>
      )}
    </PageLayout>
  );
}
