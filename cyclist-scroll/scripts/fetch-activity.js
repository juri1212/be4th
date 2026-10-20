// Fetches the activity graphs on the start page and writes them to .data/ as JSON:
//   contributions.json  GitHub contributions per day, scraped from the public profile calendar
//   training.json       hours of Strava activity per day, all sport types
// Each file is { updated, to, days: { 'YYYY-MM-DD': value } }, covering the year up to `to`. Days without activity are left out.
// Runs nightly in .github/workflows/activity-data.yml, which uploads .data/ to /data/ on the server.
// Strava is skipped until STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_REFRESH_TOKEN are set (see scripts/strava-auth.js).
// Any failure exits non-zero, so the workflow uploads nothing and the site keeps the previous night's data.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GITHUB_USER = 'juri1212';
const TIME_ZONE = 'Europe/Berlin';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '.data');

const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: TIME_ZONE });

async function request(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${init?.method ?? 'GET'} ${url.split('?')[0]}: HTTP ${response.status} ${await response.text()}`);
  return response;
}

async function contributions() {
  const html = await (await request(`https://github.com/users/${GITHUB_USER}/contributions`)).text();
  // Each day is a <td data-date id> with a <tool-tip for=id> that reads "3 contributions on …" or "No contributions on …".
  const counts = new Map([...html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>(\d+) contributions?/g)].map(([, id, count]) => [id, Number(count)]));
  const dates = [...html.matchAll(/<td[^>]*data-date="([\d-]+)"[^>]*id="([^"]+)"/g)];
  if (!dates.length) throw new Error('GitHub: no contribution days found, the calendar markup may have changed');
  const days = {};
  for (const [, date, id] of dates) if (counts.get(id)) days[date] = counts.get(id);
  return { to: dates.map(([, date]) => date).sort().at(-1), days };
}

async function training({ STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN }) {
  const token = await request('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: STRAVA_REFRESH_TOKEN,
    }),
  }).then((response) => response.json());
  if (token.refresh_token !== STRAVA_REFRESH_TOKEN) {
    // Not stored automatically yet. If the old token stops working, run scripts/strava-auth.js again.
    console.warn('Strava issued a new refresh token; update the STRAVA_REFRESH_TOKEN secret if the next run fails.');
  }

  const after = Math.floor(Date.now() / 1000) - 367 * 24 * 60 * 60;
  const days = {};
  for (let page = 1; ; page++) {
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200&page=${page}`;
    const activities = await request(url, { headers: { Authorization: `Bearer ${token.access_token}` } }).then((response) => response.json());
    // start_date_local is the wall-clock time where the activity happened, so its date is the day it counts for.
    for (const { start_date_local, moving_time } of activities) {
      const date = start_date_local.slice(0, 10);
      days[date] = (days[date] ?? 0) + moving_time / 3600;
    }
    if (activities.length < 200) break;
  }
  for (const date in days) days[date] = Math.round(days[date] * 100) / 100;
  return { to: today(), days };
}

async function write(name, data) {
  await writeFile(join(out, name), JSON.stringify({ updated: new Date().toISOString(), ...data }));
  console.log(`  wrote ${name}: ${Object.keys(data.days).length} active days up to ${data.to}`);
}

await mkdir(out, { recursive: true });
await write('contributions.json', await contributions());

const strava = ['STRAVA_CLIENT_ID', 'STRAVA_CLIENT_SECRET', 'STRAVA_REFRESH_TOKEN'];
if (strava.every((name) => process.env[name])) await write('training.json', await training(process.env));
else console.warn(`  skipped training.json: set ${strava.join(', ')} to fetch it`);
