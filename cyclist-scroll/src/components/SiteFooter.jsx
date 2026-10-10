import { FINISH_X, profilePoints } from '../ride/route';
import { BUILD, SITE } from '../site';
import { ArrowUp } from './icons';

// The ride's elevation profile, scaled to a strip. It stands in for the footer's top rule.
const HEIGHT = 40;
const POINTS = profilePoints(60);
const HIGH = Math.max(...POINTS.map(([, ele]) => ele));
const toY = (ele) => HEIGHT - (ele / HIGH) * HEIGHT;
const PROFILE = `M${POINTS.map(([x, ele]) => `${((x / FINISH_X) * 1000).toFixed(1)} ${toY(ele).toFixed(1)}`).join('L')}`;

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <svg className="site-footer__profile" viewBox={`0 0 1000 ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={PROFILE} />
      </svg>
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
          Built with React and Vite, prerendered and deployed by GitHub Actions from commit{' '}
          <a href={`${SITE.source}/commit/${BUILD.commit}`}>
            <code>{BUILD.commit}</code>
          </a>
          .
        </span>
        <a href="#top" className="site-footer__top-link">
          Back to top
          <ArrowUp />
        </a>
      </div>
    </footer>
  );
}
