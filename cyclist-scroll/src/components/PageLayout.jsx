import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { SITE_LINKS } from '../site';
import '../styles/pages.css';

export default function PageLayout({ current, children }) {
  return (
    <div className="site">
      <SiteHeader links={SITE_LINKS} current={current} />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
