// Fetches the activity graphs on the start page and writes them to .data/ as JSON:
//   contributions.json  GitHub commits per day, from the GraphQL API (needs GITHUB_TOKEN)
//   training.json       hours of Strava activity per day, all sport types
// Each file is { updated, to, days: { 'YYYY-MM-DD': value } }, covering the year up to `to`. Days without activity are left out.
// Runs nightly in .github/workflows/activity-data.yml, which uploads .data/ to /data/ on the server.
// Strava is skipped until STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_REFRESH_TOKEN are set (see scripts/strava-auth.ts).
// Any failure exits non-zero, so the workflow uploads nothing and the site keeps the previous night's data.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ActivityData } from '../src/types.ts';

const GITHUB_USER = 'juri1212';
const TIME_ZONE = 'Europe/Berlin';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '.data');

const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });

type Days = ActivityData['days'];

async function request(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${init?.method ?? 'GET'} ${url.split('?')[0]}: HTTP ${response.status} ${await response.text()}`);
  return response;
}

const requestJson = async <T>(url: string, init?: RequestInit) => (await (await request(url, init)).json()) as T;

interface CommitContributions {
  nodes: { occurredAt: string; commitCount: number }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

const COMMITS_QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!, $after: String) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository(maxRepositories: 100) {
        repository { nameWithOwner }
        contributions(first: 100, after: $after) { nodes { occurredAt commitCount } pageInfo { hasNextPage endCursor } }
      }
    }
  }
}`;

// Commits only, the same ones GitHub's contribution calendar counts: by the user, to a default branch, in the last year.
// Private repositories only show up if GITHUB_TOKEN can read them; the workflow's own token sees public ones.
async function commits(token: string): Promise<Omit<ActivityData, 'updated'>> {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);
  const page = async (repo?: string, after?: string) => {
    const { data, errors } = await requestJson<{
      data?: { user: { contributionsCollection: { commitContributionsByRepository: { repository: { nameWithOwner: string }; contributions: CommitContributions }[] } } };
      errors?: { message: string }[];
    }>('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: COMMITS_QUERY, variables: { login: GITHUB_USER, from: from.toISOString(), to: to.toISOString(), after } }),
    });
    if (!data) throw new Error(`GitHub: ${errors?.map(({ message }) => message).join('; ')}`);
    return data.user.contributionsCollection.commitContributionsByRepository.filter(({ repository }) => !repo || repository.nameWithOwner === repo);
  };

  const days: Days = {};
  const add = ({ nodes }: CommitContributions) => {
    // occurredAt is midnight of the day in the user's GitHub time zone, written in UTC.
    for (const { occurredAt, commitCount } of nodes) {
      const date = new Date(occurredAt).toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });
      days[date] = (days[date] ?? 0) + commitCount;
    }
  };
  for (const { repository, contributions } of await page()) {
    add(contributions);
    // Repositories with more than 100 active days are paged one by one.
    for (let { pageInfo } = contributions; pageInfo.hasNextPage; ) {
      const [next] = await page(repository.nameWithOwner, pageInfo.endCursor!);
      add(next.contributions);
      pageInfo = next.contributions.pageInfo;
    }
  }
  return { to: today(), days };
}

interface StravaCredentials {
  STRAVA_CLIENT_ID: string;
  STRAVA_CLIENT_SECRET: string;
  STRAVA_REFRESH_TOKEN: string;
}

// The fields used from https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
interface StravaActivity {
  start_date_local: string;
  moving_time: number;
}

async function training({ STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN }: StravaCredentials): Promise<Omit<ActivityData, 'updated'>> {
  const token = await requestJson<{ access_token: string; refresh_token: string }>('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: STRAVA_REFRESH_TOKEN,
    }),
  });
  if (token.refresh_token !== STRAVA_REFRESH_TOKEN) {
    // Not stored automatically yet. If the old token stops working, run scripts/strava-auth.ts again.
    console.warn('Strava issued a new refresh token; update the STRAVA_REFRESH_TOKEN secret if the next run fails.');
  }

  const after = Math.floor(Date.now() / 1000) - 367 * 24 * 60 * 60;
  const days: Days = {};
  for (let page = 1; ; page++) {
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200&page=${page}`;
    const activities = await requestJson<StravaActivity[]>(url, { headers: { Authorization: `Bearer ${token.access_token}` } });
    // start_date_local is the wall-clock time where the activity happened, so its date is the day it counts for.
    for (const { start_date_local, moving_time } of activities) {
      const date = start_date_local.slice(0, 10);
      days[date] = (days[date] ?? 0) + moving_time / 3600;
    }
    if (activities.length < 200) break;
  }
  for (const [date, hours] of Object.entries(days)) days[date] = Math.round(hours * 100) / 100;
  return { to: today(), days };
}

async function write(name: string, data: Omit<ActivityData, 'updated'>) {
  const file: ActivityData = { updated: new Date().toISOString(), ...data };
  await writeFile(join(out, name), JSON.stringify(file));
  console.log(`  wrote ${name}: ${Object.keys(data.days).length} active days up to ${data.to}`);
}

await mkdir(out, { recursive: true });
if (!process.env.GITHUB_TOKEN) throw new Error('Set GITHUB_TOKEN to fetch contributions.json, e.g. GITHUB_TOKEN=$(gh auth token)');
await write('contributions.json', await commits(process.env.GITHUB_TOKEN));

const strava = ['STRAVA_CLIENT_ID', 'STRAVA_CLIENT_SECRET', 'STRAVA_REFRESH_TOKEN'] as const;
const hasStrava = (env: NodeJS.ProcessEnv): env is NodeJS.ProcessEnv & StravaCredentials => strava.every((name) => env[name]);
if (hasStrava(process.env)) await write('training.json', await training(process.env));
else console.warn(`  skipped training.json: set ${strava.join(', ')} to fetch it`);
