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
          This site is hosted on GitHub Pages, a service of {LEGAL.hoster}. When you visit a page, GitHub’s servers automatically
          process data your browser sends, such as your IP address, date and time of the request, the page requested, the referring URL
          and browser type. This is technically necessary to deliver the site. GitHub also logs and stores visitors’ IP addresses for
          security purposes, whether or not they have a GitHub account. The legal basis is my legitimate interest in a secure, working
          site (Art. 6 (1) (f) GDPR). I have no access to these logs and receive no visitor statistics from them. How long GitHub keeps
          them is set out in the{' '}
          <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">GitHub General Privacy Statement</a>.
        </p>
        <p>
          The data may be processed on servers in the USA. GitHub, Inc. is certified under the EU-U.S. Data Privacy Framework, for which
          the European Commission has issued an adequacy decision (Art. 45 GDPR).
        </p>

        <h2>3. Cookies, tracking and fonts</h2>
        <p>
          This site sets no cookies, stores nothing on your device and uses no tracking or third-party analytics services. Fonts are
          served with the site itself; no connections are made to third parties such as Google Fonts or CDNs.
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
          You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18)
          and data portability (Art. 20 GDPR). To exercise them, write to the email address above. You also have the right to lodge a
          complaint with a data protection supervisory authority (Art. 77 GDPR).
        </p>

        <h2>7. Right to object</h2>
        <p>
          <strong>
            Where I process your data on the basis of legitimate interests (Art. 6 (1) (f) GDPR), such as the server logs in section 2,
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
