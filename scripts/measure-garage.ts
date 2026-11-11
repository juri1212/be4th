// Measures how the garage page loads: how many bytes cross the network and how long it takes until the sequence
// starts playing. Serves the built site, opens /garage/ in headless Chrome with a cold cache, and reads the marks
// that src/garage/scene.ts leaves on the performance timeline.
//
//   npm run build
//   npm run measure                       # prints the table
//   npm run measure -- --log "Baseline"   # and appends it to docs/garage-loading.md
//
// Options: --runs 5, --chrome <path to a Chromium browser> (or CHROME_PATH).
// Text is served gzipped and the model as it is, which is what `vite preview` does and what a static host does at
// the least. Each profile is run several times; the table shows the median.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { appendFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { preview } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(root, 'docs', 'garage-loading.md');
const PAGE = '/garage/';
// The mark that says a frame of the playing sequence has been drawn.
const STARTED = 'garage:animating';
const TIMEOUT = 120_000;

interface Profile {
  name: string;
  about: string;
  width: number;
  height: number;
  scale: number;
  mobile: boolean;
  cpu: number;
  // Latency in ms and throughput in bytes per second, or null for the bare local connection.
  network: { latency: number; down: number; up: number } | null;
}

const PROFILES: Profile[] = [
  { name: 'Desktop', about: 'no throttling, 1440 × 900', width: 1440, height: 900, scale: 2, mobile: false, cpu: 1, network: null },
  // Chrome DevTools' "Fast 4G" preset, and a processor four times slower than this machine's.
  {
    name: 'Phone on 4G',
    about: '9 Mbit/s down, 165 ms latency, 4× slower CPU, 390 × 844',
    width: 390,
    height: 844,
    scale: 3,
    mobile: true,
    cpu: 4,
    network: { latency: 165, down: (9_000_000 / 8) * 0.9, up: (1_500_000 / 8) * 0.9 },
  },
];

const { values: options } = parseArgs({ options: { log: { type: 'string' }, runs: { type: 'string', default: '5' }, chrome: { type: 'string' } } });
const RUNS = Number(options.runs);

const CHROME = [
  options.chrome,
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((path) => path && existsSync(path));
if (!CHROME) throw new Error('No Chromium browser found. Pass one with --chrome or CHROME_PATH.');
if (!existsSync(join(root, 'dist', 'garage', 'index.html'))) throw new Error('Nothing to measure in dist/. Run `npm run build` first.');

// ---------- a minimal DevTools protocol client ----------

type Params = Record<string, unknown>;
type Listener = (params: any, sessionId?: string) => void;

class Browser {
  private socket: WebSocket;
  private id = 0;
  private pending = new Map<number, { resolve: (result: any) => void; reject: (error: Error) => void }>();
  private listeners = new Set<Listener>();

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id === undefined) {
        for (const listener of this.listeners) listener(message, message.sessionId);
        return;
      }
      const waiting = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) waiting?.reject(new Error(message.error.message));
      else waiting?.resolve(message.result);
    });
  }

  static async connect(url: string): Promise<Browser> {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error(`Can't reach the browser at ${url}`)), { once: true });
    });
    return new Browser(socket);
  }

  send<T = any>(method: string, params: Params = {}, sessionId?: string): Promise<T> {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  // Calls back for every event of a session until the returned function is called.
  on(sessionId: string, listener: (method: string, params: any) => void): () => void {
    const wrapped: Listener = (message, from) => {
      if (from === sessionId) listener(message.method, message.params);
    };
    this.listeners.add(wrapped);
    return () => this.listeners.delete(wrapped);
  }

  close() {
    this.socket.close();
  }
}

async function launch(): Promise<{ browser: Browser; stop: () => Promise<void> }> {
  const profile = await mkdtemp(join(tmpdir(), 'measure-garage-'));
  // The page needs WebGL, so let headless Chrome use the machine's GPU rather than draw in software.
  const child = spawn(CHROME!, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--enable-gpu', '--hide-scrollbars', 'about:blank'], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const url = await new Promise<string>((resolve, reject) => {
    let output = '';
    child.stderr.on('data', (chunk) => {
      output += chunk;
      const found = /DevTools listening on (ws:\S+)/.exec(output);
      if (found) resolve(found[1]!);
    });
    child.on('exit', () => reject(new Error(`The browser quit before it was ready:\n${output}`)));
  });
  const browser = await Browser.connect(url);
  return {
    browser,
    async stop() {
      browser.close();
      const gone = new Promise((resolve) => child.once('exit', resolve));
      child.kill();
      await gone;
      await rm(profile, { recursive: true, force: true, maxRetries: 3 });
    },
  };
}

// ---------- one page load ----------

const KINDS = ['Page', 'Styles', 'Scripts', 'Fonts', 'Model', 'Other'] as const;
type Kind = (typeof KINDS)[number];

function kindOf(url: string, type: string): Kind {
  if (/\.(glb|gltf|bin)$/.test(new URL(url).pathname)) return 'Model';
  if (type === 'Document') return 'Page';
  if (type === 'Stylesheet') return 'Styles';
  if (type === 'Script') return 'Scripts';
  if (type === 'Font') return 'Fonts';
  return 'Other';
}

interface Request {
  url: string;
  kind: Kind;
  // Bytes on the wire, headers included, and when each batch of them arrived, in seconds on the browser's clock.
  bytes: number;
  chunks: { at: number; bytes: number }[];
  finished: number | null;
}

interface Run {
  // Milliseconds from the start of navigation.
  started: number;
  paint: number;
  marks: Record<string, number>;
  // Bytes received by the time the sequence started, and once the page had gone quiet.
  bytesAtStart: number;
  bytes: number;
  requests: number;
  byKind: Record<Kind, number>;
  renderer: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function load(browser: Browser, origin: string, profile: Profile): Promise<Run> {
  // A context of its own, so nothing is cached from the run before.
  const { browserContextId } = await browser.send('Target.createBrowserContext');
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const send = <T = any>(method: string, params: Params = {}) => browser.send<T>(method, params, sessionId);

  const requests = new Map<string, Request>();
  let navigationStart: number | null = null;
  let lastActivity = Date.now();
  const off = browser.on(sessionId, (method, params) => {
    if (!method.startsWith('Network.')) return;
    lastActivity = Date.now();
    if (method === 'Network.requestWillBeSent') {
      if (!params.request.url.startsWith('http')) return;
      navigationStart ??= params.timestamp;
      requests.set(params.requestId, { url: params.request.url, kind: kindOf(params.request.url, params.type ?? 'Other'), bytes: 0, chunks: [], finished: null });
      return;
    }
    const request = requests.get(params.requestId);
    if (!request) return;
    if (method === 'Network.responseReceived') request.kind = kindOf(request.url, params.type);
    else if (method === 'Network.dataReceived') request.chunks.push({ at: params.timestamp, bytes: params.encodedDataLength });
    else if (method === 'Network.loadingFinished') {
      request.bytes = params.encodedDataLength;
      request.finished = params.timestamp;
    } else if (method === 'Network.loadingFailed') throw new Error(`${request.url} failed to load: ${params.errorText}`);
  });

  try {
    await send('Network.enable');
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: profile.width, height: profile.height, deviceScaleFactor: profile.scale, mobile: profile.mobile });
    if (profile.network) await send('Network.emulateNetworkConditions', { offline: false, latency: profile.network.latency, downloadThroughput: profile.network.down, uploadThroughput: profile.network.up });
    if (profile.cpu > 1) await send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
    await send('Page.navigate', { url: origin + PAGE });

    // Resolves in the page once the sequence has started, or says why it won't.
    const wait = `new Promise((resolve) => {
      const check = () => {
        const mark = performance.getEntriesByName(${JSON.stringify(STARTED)})[0];
        const failed = document.querySelector('.stage--failed');
        if (!mark && !failed) return void setTimeout(check, 10);
        const canvas = document.createElement('canvas').getContext('webgl2');
        const info = canvas?.getExtension('WEBGL_debug_renderer_info');
        resolve(JSON.stringify({
          failed: Boolean(failed),
          started: mark?.startTime,
          paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          marks: Object.fromEntries(performance.getEntriesByType('mark').filter((entry) => entry.name.startsWith('garage:')).map((entry) => [entry.name, entry.startTime])),
          renderer: info ? canvas.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unknown',
        }));
      };
      check();
    })`;
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression: wait, awaitPromise: true, returnByValue: true, timeout: TIMEOUT });
    if (exceptionDetails) throw new Error(`The page never started the sequence: ${exceptionDetails.text}`);
    const page = JSON.parse(result.value);
    if (page.failed) throw new Error('The 3D scene failed to start in this browser.');

    // Let whatever is still loading finish, so the total is the whole page.
    while (Date.now() - lastActivity < 1500 || [...requests.values()].some((request) => request.finished === null)) await sleep(100);

    const startedAt = navigationStart! + page.started / 1000;
    const byKind = Object.fromEntries(KINDS.map((kind) => [kind, 0])) as Record<Kind, number>;
    let bytes = 0;
    let bytesAtStart = 0;
    for (const request of requests.values()) {
      bytes += request.bytes;
      byKind[request.kind] += request.bytes;
      if (request.finished !== null && request.finished <= startedAt) bytesAtStart += request.bytes;
      else for (const chunk of request.chunks) if (chunk.at <= startedAt) bytesAtStart += chunk.bytes;
    }
    return { started: page.started, paint: page.paint, marks: page.marks, bytesAtStart, bytes, requests: requests.size, byKind, renderer: page.renderer };
  } finally {
    off();
    await browser.send('Target.closeTarget', { targetId });
    await browser.send('Target.disposeBrowserContext', { browserContextId });
  }
}

// ---------- report ----------

const median = (values: number[]) => {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};
const seconds = (ms: number) => `${(ms / 1000).toFixed(2)} s`;
const kilobytes = (bytes: number) => `${Math.round(bytes / 1000).toLocaleString('en-US')} kB`;

const server = await preview({ root, logLevel: 'silent', preview: { port: 4179, host: '127.0.0.1' } });
const address = server.httpServer.address();
if (!address || typeof address === 'string') throw new Error('The preview server has no port');
const origin = `http://127.0.0.1:${address.port}`;
const { browser, stop } = await launch();

const lines: string[] = [];
try {
  const results: { profile: Profile; runs: Run[] }[] = [];
  for (const profile of PROFILES) {
    const runs: Run[] = [];
    for (let i = 0; i < RUNS; i++) {
      runs.push(await load(browser, origin, profile));
      process.stderr.write(`  ${profile.name} ${i + 1}/${RUNS}: sequence starts at ${seconds(runs.at(-1)!.started)}\n`);
    }
    results.push({ profile, runs });
  }

  const stages = [...new Set(results.flatMap(({ runs }) => runs.flatMap((run) => Object.keys(run.marks))))].filter((name) => name !== STARTED);
  const of = (runs: Run[], pick: (run: Run) => number | undefined) => median(runs.map(pick).filter((value) => value !== undefined));
  lines.push(
    `| Profile | Sequence starts | Received by then | Received in total | Requests | First paint | ${stages.map((name) => `\`${name.replace('garage:', '')}\``).join(' | ')} |`,
    `| --- | --- | --- | --- | --- | --- | ${stages.map(() => '---').join(' | ')} |`,
    ...results.map(({ profile, runs }) =>
      [
        `| ${profile.name}`,
        `**${seconds(of(runs, (run) => run.started))}**`,
        `**${kilobytes(of(runs, (run) => run.bytesAtStart))}**`,
        kilobytes(of(runs, (run) => run.bytes)),
        of(runs, (run) => run.requests),
        seconds(of(runs, (run) => run.paint)),
        ...stages.map((name) => (runs.some((run) => run.marks[name] !== undefined) ? seconds(of(runs, (run) => run.marks[name])) : '–')),
      ].join(' | ') + ' |',
    ),
    '',
    `Received in total, by kind: ${KINDS.map((kind) => `${kind.toLowerCase()} ${kilobytes(of(results[0]!.runs, (run) => run.byKind[kind]))}`).join(', ')}.`,
    '',
    `Median of ${RUNS} cold loads per profile${PROFILES.map((profile) => `; ${profile.name}: ${profile.about}`).join('')}. Drawn by ${results[0]!.runs[0]!.renderer}.`,
  );
} finally {
  await stop();
  await server.close();
}

console.log(lines.join('\n'));
if (options.log) {
  await mkdir(dirname(LOG), { recursive: true });
  if (!existsSync(LOG)) {
    await appendFile(
      LOG,
      [
        '# Garage loading',
        '',
        'How much the garage page downloads and how long it takes until the sequence starts playing, measured with `npm run measure` after each change to how it loads. "Sequence starts" is the first frame drawn with the sequence playing, counted from the start of navigation. The columns after "First paint" are the stages `src/garage/scene.ts` marks on the way there.',
        '',
      ].join('\n'),
    );
  }
  await appendFile(LOG, [`## ${options.log}`, '', ...lines, '', ''].join('\n'));
  console.error(`\nAppended to ${LOG}`);
}
