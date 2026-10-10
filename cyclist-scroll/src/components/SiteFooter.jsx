import { BUILD, SITE } from '../site';
import { ArrowUp } from './icons';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <a className="site-footer__brand" href="/">
            be4th
          </a>
          <p>
            {SITE.author} — {SITE.role.toLowerCase()}.
            <br />
            Apps, services and the pipelines that ship them.
          </p>
        </div>
        <nav aria-label="Footer">
          <div>
            <h2>Site</h2>
            <a href="/">Home</a>
            <a href="/projects/">Work</a>
            <a href="/blog/">Writing</a>
          </div>
          <div>
            <h2>Elsewhere</h2>
            <a href={SITE.github}>GitHub</a>
            <a href="/feed.xml">RSS feed</a>
            <a href={SITE.source}>Source of this site</a>
          </div>
        </nav>
      </div>
      <div className="site-footer__bottom">
        <span>
          © {BUILD.date.slice(0, 4)} {SITE.author}
        </span>
        <span>
          React + Vite, prerendered at build time, shipped by GitHub Actions ·{' '}
          <a href={`${SITE.source}/commit/${BUILD.commit}`}>
            <code>{BUILD.commit}</code>
          </a>
        </span>
        <a href="#top" className="site-footer__top-link">
          Back to top
          <ArrowUp />
        </a>
      </div>
    </footer>
  );
}
