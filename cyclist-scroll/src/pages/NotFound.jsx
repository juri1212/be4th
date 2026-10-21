import PageLayout from '../components/PageLayout';
import { ArrowLeft } from '../components/icons';
import { openPalette } from '../palette';

export default function NotFound() {
  return (
    <PageLayout>
      <header className="page-intro page-intro--center">
        <h1>Wrong turn</h1>
        <p className="lede">There’s no page at this address. Head back to the start, or search the site for what you were after.</p>
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
