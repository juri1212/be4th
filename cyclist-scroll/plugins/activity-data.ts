import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Connect, Plugin } from 'vite';

// `npm run fetch-activity` writes the activity graphs to .data/ (see scripts/fetch-activity.ts).
// This serves them at /data/ in dev and preview, and copies them to dist/data/ in the client build.
// The deploy workflow fetches them right before building, so every deploy ships current data.
export default function activityData(): Plugin {
  const serve =
    (root: string): Connect.NextHandleFunction =>
    async (req, res, next) => {
      const match = req.url?.match(/^\/data\/([\w-]+\.json)(?:\?|$)/);
      if (!match) return next();
      try {
        const body = await readFile(join(root, '.data', match[1]));
        res.setHeader('Content-Type', 'application/json');
        res.end(body);
      } catch {
        res.statusCode = 404;
        res.end();
      }
    };
  let root = process.cwd();
  let ssr = false;
  return {
    name: 'be4th:activity-data',
    configResolved(config) {
      root = config.root;
      ssr = !!config.build.ssr;
    },
    configureServer(server) {
      server.middlewares.use(serve(root));
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve(root));
    },
    async generateBundle() {
      if (ssr) return;
      // A local build without `npm run fetch-activity` ships without data; the graphs stay empty.
      const files = await readdir(join(root, '.data')).catch(() => []);
      for (const name of files.filter((file) => file.endsWith('.json'))) {
        this.emitFile({ type: 'asset', fileName: `data/${name}`, source: await readFile(join(root, '.data', name)) });
      }
    },
  };
}
