import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// In production /data/*.json is uploaded nightly, separately from the site (see scripts/fetch-activity.js).
// Locally, `npm run fetch-activity` writes it to .data/, and this serves it at /data/ in dev and preview.
// It's never part of the build, so a site deploy can't overwrite or delete the data.
export default function activityData() {
  const serve = (root) => async (req, res, next) => {
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
  let root;
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
