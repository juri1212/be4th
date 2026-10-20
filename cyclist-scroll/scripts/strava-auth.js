// One-time Strava authorization for the nightly activity job. No copy and paste:
//   1. Create an API app at https://www.strava.com/settings/api with "Authorization Callback Domain" set to localhost.
//   2. npm run strava-auth  (asks for the app's client ID and secret, or reads STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET)
//   3. Approve in the browser tab that opens. A local server catches the redirect and exchanges the code for a token,
//      then the GitHub CLI stores the ID, secret and refresh token in this repository's Actions settings.
// Without the GitHub CLI it prints the values to store by hand instead.
// activity:read_all includes activities only visible to you; only their daily duration is ever published.
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createInterface } from 'node:readline/promises';

const PORT = 8723;
const redirect = `http://localhost:${PORT}/callback`;

const prompt = createInterface({ input: process.stdin, output: process.stdout });
const clientId = process.env.STRAVA_CLIENT_ID || (await prompt.question('Strava client ID: ')).trim();
const clientSecret = process.env.STRAVA_CLIENT_SECRET || (await prompt.question('Strava client secret: ')).trim();
prompt.close();
if (!clientId || !clientSecret) {
  console.error('A client ID and secret are needed. Find them at https://www.strava.com/settings/api.');
  process.exit(1);
}

function openInBrowser(url) {
  const command = { darwin: 'open', win32: 'explorer' }[process.platform] ?? 'xdg-open';
  spawn(command, [url], { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
}

// The repository the GitHub CLI would act on, or null if it's missing or not signed in.
function githubRepo() {
  try {
    return execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

// Values go in over stdin, so they never appear in the process list or shell history.
function store(repo, refreshToken) {
  const set = (kind, name, value) => execFileSync('gh', [kind, 'set', name, '--repo', repo], { input: value, stdio: ['pipe', 'ignore', 'inherit'] });
  set('variable', 'STRAVA_CLIENT_ID', clientId);
  set('secret', 'STRAVA_CLIENT_SECRET', clientSecret);
  set('secret', 'STRAVA_REFRESH_TOKEN', refreshToken);
}

async function exchange(code) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code' }),
  });
  const token = await response.json();
  if (!response.ok) throw new Error(token.message ?? JSON.stringify(token));
  return token;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== '/callback') return res.writeHead(404).end();
  const page = (status, text) => res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(text);
  try {
    const code = url.searchParams.get('code');
    if (!code) throw new Error(url.searchParams.get('error') ?? 'no code in the callback');
    if (!(url.searchParams.get('scope') ?? '').includes('activity:read_all')) throw new Error('access to activities was not granted');
    const token = await exchange(code);
    const repo = githubRepo();
    if (repo) {
      store(repo, token.refresh_token);
      console.log(`Authorized as ${token.athlete?.firstname ?? 'unknown'} and stored STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_REFRESH_TOKEN in ${repo}.`);
      console.log('Run "Update activity data" in the Actions tab to fetch the data now.');
    } else {
      console.log('Authorized. The GitHub CLI isn’t available, so add these in the repository’s Actions settings:\n');
      console.log(`  variable STRAVA_CLIENT_ID      ${clientId}`);
      console.log(`  secret   STRAVA_CLIENT_SECRET  ${clientSecret}`);
      console.log(`  secret   STRAVA_REFRESH_TOKEN  ${token.refresh_token}\n`);
    }
    page(200, 'Strava is connected. You can close this tab.');
  } catch (error) {
    console.error(`Authorization failed: ${error.message}`);
    page(400, `Authorization failed: ${error.message}`);
    process.exitCode = 1;
  }
  server.close();
});

server.listen(PORT, 'localhost', () => {
  const authorize = new URL('https://www.strava.com/oauth/authorize');
  authorize.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, response_type: 'code', scope: 'activity:read_all' });
  console.log(`Waiting for Strava on ${redirect}. If no browser tab opens, visit:\n\n${authorize}\n`);
  openInBrowser(authorize.href);
});
