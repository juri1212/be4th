import PageLayout from '../components/PageLayout';
import { ArrowLeft } from '../components/icons';
import { openPalette } from '../palette';

export default function NotFound() {
  return (
    <PageLayout>
      <header className="page-intro page-intro--center">
        <p className="eyebrow">404 · Off route</p>
        <h1>
          Wrong <em>turn</em>
        </h1>
        <p className="lede">This road doesn’t go anywhere. Let’s get you back on course.</p>
        <div className="actions">
          <a className="button button--solid" href="/">
            <ArrowLeft /> Back to the start
          </a>
          <button type="button" className="button" onClick={openPalette}>
            Search the site
          </button>
        </div>
      </header>
    </PageLayout>
  );
}
