import PageLayout from '../components/PageLayout';
import { LEGAL, formatDate } from '../site';

export default function Privacy() {
  return (
    <PageLayout>
      <header className="page-intro">
        <h1>Privacy policy</h1>
        <p className="lede">In short: no cookies, no tracking, no third-party analytics and no third-party embeds.</p>
      </header>
      <div className="prose">
        <h2>1. Controller</h2>
        <p>
          {LEGAL.name}
          <br />
          Email: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>

        <h2>2. Hosting and server logs</h2>
        <p>
          This site is hosted by {LEGAL.hoster}, on servers in Germany. When you visit a page, the server automatically logs data your
          browser sends: your IP address shortened by its last two octets (so 11.22.33.44 is stored as 11.22.0.0), date and time of the
          request, the page requested, the referring URL, browser type and operating system. This is technically necessary to deliver
          the site and keep it secure and stable. The legal basis is my legitimate interest in a secure, working site (Art. 6 (1) (f)
          GDPR). The logs are deleted after {LEGAL.logRetentionDays} days and are not combined with other data. The host processes them
          on my behalf under a data processing agreement (Art. 28 GDPR).
        </p>

        <h2>3. Access statistics</h2>
        <p>
          The host generates aggregate access statistics from these server logs with Webalizer: for example, how many pages were
          requested per day and which pages and referrers were most common. They contain no full IP addresses, are only visible to me,
          and are based on the same legitimate interest in seeing how the site is used (Art. 6 (1) (f) GDPR).
        </p>

        <h2>4. Cookies, tracking and fonts</h2>
        <p>
          This site sets no cookies, stores nothing on your device and uses no tracking or third-party analytics services. Fonts are
          served from this site’s own server; no connections are made to third parties such as Google Fonts or CDNs.
        </p>

        <h2>5. Contact by email</h2>
        <p>
          If you email me, I process your details to answer your request (Art. 6 (1) (b) or (f) GDPR). I delete them once they are no
          longer needed for that, unless the law requires me to keep them.
        </p>

        <h2>6. External links</h2>
        <p>
          This site links to external services such as GitHub. Data is only sent to them once you follow a link, and their own privacy
          policies apply.
        </p>

        <h2>7. Your rights</h2>
        <p>
          You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18)
          and data portability (Art. 20 GDPR). To exercise them, write to the email address above. You also have the right to lodge a
          complaint with a data protection supervisory authority (Art. 77 GDPR).
        </p>

        <h2>8. Right to object</h2>
        <p>
          <strong>
            Where I process your data on the basis of legitimate interests (Art. 6 (1) (f) GDPR), such as the server logs and statistics in sections 2 and 3,
            you have the right to object to this processing at any time on grounds relating to your particular situation (Art. 21
            GDPR). I will then stop processing your data unless I can demonstrate compelling legitimate grounds that override your
            interests, rights and freedoms, or the processing serves to establish, exercise or defend legal claims.
          </strong>
        </p>

        <p>Last updated: {formatDate(LEGAL.updated)}</p>
      </div>
    </PageLayout>
  );
}
