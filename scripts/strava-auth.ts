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

const OPEN_COMMANDS: Partial<Record<NodeJS.Platform, string>> = { darwin: 'open', win32: 'explorer' };

function openInBrowser(url: string) {
  const command = OPEN_COMMANDS[process.platform] ?? 'xdg-open';
  spawn(command, [url], { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
}

// The repository the GitHub CLI would act on, or null if it's missing or not signed in.
function githubRepo(): string | null {
  try {
    return execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

// Values go in over stdin, so they never appear in the process list or shell history.
function store(repo: string, refreshToken: string) {
  const set = (kind: 'variable' | 'secret', name: string, value: string) => execFileSync('gh', [kind, 'set', name, '--repo', repo], { input: value, stdio: ['pipe', 'ignore', 'inherit'] });
  set('variable', 'STRAVA_CLIENT_ID', clientId);
  set('secret', 'STRAVA_CLIENT_SECRET', clientSecret);
  set('secret', 'STRAVA_REFRESH_TOKEN', refreshToken);
}

// The fields used from https://developers.strava.com/docs/authentication/#tokenexchange
interface StravaToken {
  refresh_token: string;
  athlete?: { firstname?: string };
}

async function exchange(code: string): Promise<StravaToken> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code' }),
  });
  const token = (await response.json()) as StravaToken & { message?: string };
  if (!response.ok) throw new Error(token.message ?? JSON.stringify(token));
  return token;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', redirect);
  if (url.pathname !== '/callback') return res.writeHead(404).end();
  const page = (status: number, text: string) => res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(text);
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Authorization failed: ${message}`);
    page(400, `Authorization failed: ${message}`);
    process.exitCode = 1;
  }
  server.close();
});

server.listen(PORT, 'localhost', () => {
  const authorize = new URL('https://www.strava.com/oauth/authorize');
  authorize.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, response_type: 'code', scope: 'activity:read_all' }).toString();
  console.log(`Waiting for Strava on ${redirect}. If no browser tab opens, visit:\n\n${authorize}\n`);
  openInBrowser(authorize.href);
});
