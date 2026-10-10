// Renders every route of the built site to static HTML, then writes the feed, sitemap and robots.txt.
// Runs after `vite build` (client) and `vite build --ssr` (server bundle in .ssr/).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The server bundle imports React from node_modules; use its production build.
process.env.NODE_ENV ??= 'production';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssr = join(root, '.ssr');

const { render, PATHS, POSTS, SITE } = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);
const template = await readFile(join(dist, 'index.html'), 'utf8');
const manifestFile = join(dist, '.vite', 'manifest.json');
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));

// Pages are lazy chunks. Linking their CSS and JS up front avoids a flash of unstyled content and a request waterfall.
function assetTags(files) {
  const css = new Set();
  const js = new Set();
  const visit = (key) => {
    const chunk = manifest[key];
    if (!chunk || js.has(chunk.file)) return;
    js.add(chunk.file);
    chunk.css?.forEach((href) => css.add(href));
    chunk.imports?.forEach(visit);
  };
  files.forEach(visit);
  const linked = (href) => template.includes(`/${href}"`);
  return [
    ...[...css].filter((href) => !linked(href)).map((href) => `<link rel="stylesheet" href="/${href}" />`),
    ...[...js].filter((href) => !linked(href)).map((href) => `<link rel="modulepreload" href="/${href}" />`),
  ].join('\n  ');
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function headTags(head) {
  const tags = [`<title>${escape(head.title)}</title>`, `<meta name="description" content="${escape(head.description)}" />`];
  if (head.url) tags.push(`<link rel="canonical" href="${head.url}" />`, `<meta property="og:url" content="${head.url}" />`);
  tags.push(
    `<meta property="og:type" content="${head.type}" />`,
    `<meta property="og:site_name" content="be4th" />`,
    `<meta property="og:title" content="${escape(head.title)}" />`,
    `<meta property="og:description" content="${escape(head.description)}" />`,
    `<meta name="twitter:card" content="${head.image ? 'summary_large_image' : 'summary'}" />`,
  );
  if (head.image) tags.push(`<meta property="og:image" content="${new URL(head.image, SITE.url).href}" />`);
  if (head.published) tags.push(`<meta property="article:published_time" content="${head.published}" />`);
  if (head.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(head.jsonLd).replace(/</g, '\\u003c')}</script>`);
  if (!head.url) tags.push('<meta name="robots" content="noindex" />');
  return tags.join('\n  ');
}

const outputFor = (path) => (path.endsWith('.html') ? join(dist, path) : join(dist, path, 'index.html'));

for (const path of PATHS) {
  const { html, head, files } = await render(path);
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

const pageUrls = PATHS.filter((path) => !path.endsWith('.html')).map((path) => new URL(path, SITE.url).href);
await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageUrls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`,
);

await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', SITE.url).href}\n`);

const items = POSTS.map((post) => {
  const url = new URL(`/blog/${post.slug}/`, SITE.url).href;
  return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(post.description ?? post.summary)}</description>
    </item>`;
});
await writeFile(
  join(dist, 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>be4th — Writing</title>
    <link>${SITE.url}/blog/</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes by ${escape(SITE.author)} on the things I build and how they work.</description>
    <language>en</language>
${items.join('\n')}
  </channel>
</rss>
`,
);

await rm(ssr, { recursive: true, force: true });
await rm(join(dist, '.vite'), { recursive: true, force: true });
console.log(`  wrote sitemap.xml, robots.txt, feed.xml`);
