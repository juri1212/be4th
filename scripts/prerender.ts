// Renders every route of the built site to static HTML, then writes the sitemap, robots.txt and redirects for old URLs.
// Runs after `vite build` (client) and `vite build --ssr` (server bundle in .ssr/).
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Head, ServerEntry } from '../src/types.ts';

// The server bundle imports React from node_modules; use its production build.
process.env.NODE_ENV ??= 'production';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssr = join(root, '.ssr');

const { render, PATHS, SITE }: ServerEntry = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);
const template = await readFile(join(dist, 'index.html'), 'utf8');
const manifestFile = join(dist, '.vite', 'manifest.json');
// The fields used from https://vite.dev/guide/backend-integration
type Manifest = Record<string, { file: string; css?: string[]; imports?: string[] }>;
const manifest: Manifest = JSON.parse(await readFile(manifestFile, 'utf8'));

// Pages are lazy chunks. Linking their CSS and JS up front avoids a flash of unstyled content and a request waterfall.
function assetTags(files: string[]): string {
  const css = new Set<string>();
  const js = new Set<string>();
  const visit = (key: string) => {
    const chunk = manifest[key];
    if (!chunk || js.has(chunk.file)) return;
    js.add(chunk.file);
    chunk.css?.forEach((href) => css.add(href));
    chunk.imports?.forEach(visit);
  };
  files.forEach(visit);
  const linked = (href: string) => template.includes(`/${href}"`);
  return [
    ...[...css].filter((href) => !linked(href)).map((href) => `<link rel="stylesheet" href="/${href}" />`),
    ...[...js].filter((href) => !linked(href)).map((href) => `<link rel="modulepreload" href="/${href}" />`),
  ].join('\n  ');
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);

function headTags(head: Head): string {
  const tags = [`<title>${escape(head.title)}</title>`, `<meta name="description" content="${escape(head.description)}" />`];
  if (head.url) tags.push(`<link rel="canonical" href="${head.url}" />`, `<meta property="og:url" content="${head.url}" />`);
  tags.push(
    `<meta property="og:type" content="${head.type}" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${escape(head.title)}" />`,
    `<meta property="og:description" content="${escape(head.description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta property="og:image" content="${new URL(head.image ?? SITE.image, SITE.url).href}" />`,
  );
  if (!head.image) tags.push('<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />');
  if (head.published) tags.push(`<meta property="article:published_time" content="${head.published}" />`);
  if (head.modified) tags.push(`<meta property="article:modified_time" content="${head.modified}" />`);
  if (head.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(head.jsonLd).replace(/</g, '\\u003c')}</script>`);
  if (!head.url) tags.push('<meta name="robots" content="noindex" />');
  return tags.join('\n  ');
}

// Last commit touching any of the files, so crawlers can skip pages that haven't changed. Needs full git history.
function lastModified(files: string[]): string | null {
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { cwd: root, encoding: 'utf8' }).trim();
    return date || null;
  } catch {
    return null;
  }
}

// Index pages change when anything they list changes.
const SOURCES: Record<string, string[]> = { '/': ['src', 'content'], '/blog/': ['src/pages/Blog.tsx', 'content/posts'] };

const outputFor = (path: string) => (path.endsWith('.html') ? join(dist, path) : join(dist, path, 'index.html'));

const sitemap: { url: string; lastmod: string | null }[] = [];
for (const path of PATHS) {
  const { html, head, files } = await render(path);
  // Posts state their own modified date (`updated` in the front matter), so the sitemap agrees with the page.
  if (head.url) sitemap.push({ url: head.url, lastmod: head.modified ?? lastModified(SOURCES[path] ?? files) });
  // Page CSS goes after the shared stylesheet that Vite links at the end of <head>, so it wins ties.
  const page = template
    .replace('<!--app-head-->', headTags(head))
    .replace('</head>', `  ${assetTags(files)}\n</head>`)
    .replace('<div id="root">', `<div id="root" data-path="${path}">`)
    .replace('<!--app-html-->', html);
  const output = outputFor(path);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, page);
  console.log(`  prerendered ${path}`);
}

await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(({ url, lastmod }) => `  <url><loc>${url}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`,
);

await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', SITE.url).href}\n`);

// GitHub Pages can't send real redirects, so old URLs get a page that refreshes to the new one. The canonical link
// tells search engines where the content lives now.
// Project pages used to live under /projects/; their write-ups are posts now. The Duophonic guide was merged into its post.
const REDIRECTS: Record<string, string> = {
  '/projects/': '/',
  '/projects/duophonic/': '/blog/duophonic/',
  '/projects/car-configurator-mcp/': '/blog/car-configurator-mcp/',
  '/blog/play-mac-audio-on-two-outputs/': '/blog/duophonic/',
};

for (const [from, to] of Object.entries(REDIRECTS)) {
  if (PATHS.includes(from)) throw new Error(`Redirect from ${from} would overwrite a page`);
  const target = new URL(to, SITE.url).href;
  const output = outputFor(from);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Moved</title>
  <link rel="canonical" href="${target}" />
  <meta name="robots" content="noindex" />
  <meta http-equiv="refresh" content="0; url=${to}" />
</head>
<body><p>This page has moved to <a href="${to}">${target}</a>.</p></body>
</html>
`,
  );
  console.log(`  redirect ${from} -> ${to}`);
}

await rm(ssr, { recursive: true, force: true });
await rm(join(dist, '.vite'), { recursive: true, force: true });
console.log(`  wrote sitemap.xml, robots.txt`);
