import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Connect, Plugin } from 'vite';

// In production /data/*.json is uploaded nightly, separately from the site (see scripts/fetch-activity.ts).
// Locally, `npm run fetch-activity` writes it to .data/, and this serves it at /data/ in dev and preview.
// It's never part of the build, so a site deploy can't overwrite or delete the data.
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
  return {
    name: 'be4th:activity-data',
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(serve(root));
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve(root));
    },
  };
}
