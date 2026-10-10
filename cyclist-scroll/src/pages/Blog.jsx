import PageLayout from '../components/PageLayout';
import { ArrowRight } from '../components/icons';
import { POSTS, postUrl } from '../content';
import { formatDate } from '../site';

const byYear = POSTS.reduce((groups, post) => {
  const year = post.date.slice(0, 4);
  (groups[year] ??= []).push(post);
  return groups;
}, {});

export default function Blog() {
  return (
    <PageLayout current="writing">
      <header className="page-intro">
        <p className="eyebrow">Writing</p>
        <h1>
          Notes from the <em>workshop</em>
        </h1>
        <p className="lede">
          Guides and write-ups about the things I build and how they work. Follow along via <a href="/feed.xml">RSS</a>.
        </p>
      </header>

      {Object.entries(byYear).map(([year, posts]) => (
        <section key={year} className="post-year" aria-label={year}>
          <h2>{year}</h2>
          <ol className="post-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <a href={postUrl(post)}>
                  <span className="post-list__meta">
                    <time dateTime={post.date}>{formatDate(post.date, 'short')}</time> · {post.readingTime} min read
                  </span>
                  <span className="post-list__title">{post.title}</span>
                  <span className="post-list__summary">{post.summary}</span>
                  <span className="post-list__more">
                    Read <ArrowRight />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </PageLayout>
  );
}
