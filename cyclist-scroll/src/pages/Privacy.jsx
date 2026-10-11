import PageLayout from '../components/PageLayout';
import { LEGAL, formatDate } from '../site';

export default function Privacy() {
  return (
    <PageLayout>
      <header className="page-intro">
        <h1>Privacy policy</h1>
        <p className="lede">In short: no cookies, no tracking, no analytics and no third-party embeds.</p>
      </header>
      <div className="prose">
        <h2>1. Controller</h2>
        <p>
          {LEGAL.name}, {LEGAL.street}, {LEGAL.city}, {LEGAL.country}
          <br />
          Email: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>

        <h2>2. Hosting and server logs</h2>
        <p>
          This site is hosted by {LEGAL.hoster}. When you visit a page, the server automatically processes data your browser sends: IP
          address, date and time of the request, the page requested, the referring URL, browser type and operating system. This is
          technically necessary to deliver the site and keep it secure and stable. The legal basis is Art. 6 (1) (f) GDPR. The host
          deletes these logs after a short period and does not combine them with other data. A data processing agreement under Art. 28
          GDPR is in place with the host.
        </p>

        <h2>3. Cookies, tracking and fonts</h2>
        <p>
          This site sets no cookies and uses no analytics or tracking services. Fonts are served from this site’s own server; no
          connections are made to third parties such as Google Fonts or CDNs.
        </p>

        <h2>4. Contact by email</h2>
        <p>
          If you email me, I process your details to answer your request (Art. 6 (1) (b) or (f) GDPR). I delete them once they are no
          longer needed for that, unless the law requires me to keep them.
        </p>

        <h2>5. External links</h2>
        <p>
          This site links to external services such as GitHub. Data is only sent to them once you follow a link, and their own privacy
          policies apply.
        </p>

        <h2>6. Your rights</h2>
        <p>
          You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18),
          data portability (Art. 20) and to object to processing (Art. 21 GDPR). To exercise them, write to the email address above. You
          also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR).
        </p>

        <p>Last updated: {formatDate(LEGAL.updated)}</p>
      </div>
    </PageLayout>
  );
}
