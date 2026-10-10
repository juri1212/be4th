import { useRef } from 'react';
import PageLayout from '../components/PageLayout';
import Prose from '../components/Prose';
import ReadingProgress from '../components/ReadingProgress';
import TableOfContents from '../components/TableOfContents';
import Tags from '../components/Tags';
import { ArrowLeft } from '../components/icons';
import { POSTS, PROJECTS, postUrl, projectUrl } from '../content';
import { SITE, formatDate } from '../site';

export default function Post({ post }) {
  const { meta, html, headings } = post;
  const articleRef = useRef(null);
  const project = PROJECTS.find((item) => item.slug === meta.project);
  const others = POSTS.filter((item) => item.slug !== meta.slug).slice(0, 2);

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
        </header>

        <div className="article-layout">
          <aside>
            <TableOfContents headings={headings} />
          </aside>
          <div>
            <Prose html={html} />
            {project && (
              <a className="related" href={projectUrl(project)}>
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
