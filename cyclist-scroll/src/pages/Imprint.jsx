import PageLayout from '../components/PageLayout';
import { LEGAL } from '../site';

export default function Imprint() {
  return (
    <PageLayout>
      <header className="page-intro">
        <h1>Imprint</h1>
        <p className="lede">Legal notice (Impressum) under German law.</p>
      </header>
      <div className="prose">
        <h2>Provider (§ 5 DDG)</h2>
        <p>
          {LEGAL.name}
          <br />
          {LEGAL.street}
          <br />
          {LEGAL.city}
          <br />
          {LEGAL.country}
        </p>
        <h2>Contact</h2>
        <p>
          Email: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
          <br />
          Phone: <a href={`tel:${LEGAL.phone.replace(/[^+\d]/g, '')}`}>{LEGAL.phone}</a>
        </p>
        <h2>Responsible for content (§ 18 (2) MStV)</h2>
        <p>{LEGAL.name}, address as above.</p>
        <h2>Liability for content and links</h2>
        <p>
          The content of this site was written with care, but I can’t guarantee that it is correct, complete or up to date. This site
          links to external websites whose content I don’t control; their providers are responsible for them. If I become aware of any
          legal violation, I will remove the content or link in question promptly.
        </p>
        <h2>Copyright</h2>
        <p>
          The texts and images on this site are protected by German copyright law. The source code of the site is public on GitHub so
          you can read it, but no license is granted: all rights are reserved unless stated otherwise.
        </p>
      </div>
    </PageLayout>
  );
}
