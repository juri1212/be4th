# be4th.com

Personal site of Juri Beforth. The start page is a scroll-driven ride: each section is a stage, and the rider moves along the route as you read. Posts, including the project write-ups, are written in Markdown and prerendered to static HTML.

```sh
npm install
npm run dev     # http://localhost:5173, rendered in the browser
npm run build   # prerendered site in dist/
npm run preview # serve dist/
```

## How it's built

- **Content** lives in `content/posts/*.md`, with YAML frontmatter. `plugins/markdown.js` turns each file into a module at build time: headings get anchors for the table of contents, and code blocks are highlighted with Shiki, so neither a Markdown parser nor a highlighter ships to the browser.
- **Routes** are defined once in `src/routes.js`. Each page is its own chunk.
- **Prerendering:** `npm run build` builds the client, then a server bundle, then `scripts/prerender.js` renders every route to `dist/<path>/index.html` and writes `sitemap.xml` and `robots.txt`. Each page's CSS and chunks are linked from the Vite manifest, and the browser hydrates the prerendered HTML.
- **Deploy:** pushing to `main` builds the site and uploads `dist/` over FTP (`.github/workflows/deploy-ftp.yml`). `public/.htaccess` sets up the 404 page and asset caching on Apache.

## Adding a post

Create `content/posts/<slug>.md`:

```md
---
title: The headline
description: One or two sentences for search results and link previews.
summary: One line for lists on the site.
date: "2026-10-05"
tags: [macOS, Guide]
project: duophonic # optional, links the post to that project's write-up
image: /images/<slug>/og-image.jpg # optional, link preview image
---

Write Markdown here. `## Headings` show up in the table of contents.
```

It appears on the start page, the blog, the command palette and the sitemap automatically.

## Adding a project

A project is a post with a few extra fields. They give it a chapter on the start page, download and source buttons on its post, and app metadata for search engines:

```md
featured: 1 # order on the start page
kind: macOS app
year: 2025–26
tagline: One line under the title.
highlights:
  - Three short points for the start page
links: # any of live, source, download
  source: https://github.com/juri1212/<repo>
os: macOS 26.1 or later # optional, with category, for downloadable apps
category: UtilitiesApplication
```

See `content/posts/duophonic.md` for a full example. The first two projects get a stage on the start page; `ANCHORS` in `src/pages/Home.jsx` picks which stages.
