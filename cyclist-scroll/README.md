# be4th.com

Personal site of Juri Beforth. The start page is a scroll-driven ride: each section is a stage, and the rider moves along the route as you read. Projects and posts are written in Markdown and prerendered to static HTML.

```sh
npm install
npm run dev     # http://localhost:5173, rendered in the browser
npm run build   # prerendered site in dist/
npm run preview # serve dist/
```

## How it's built

- **Content** lives in `content/projects/*.md` and `content/posts/*.md`, with YAML frontmatter. `plugins/markdown.js` turns each file into a module at build time: headings get anchors for the table of contents, and code blocks are highlighted with Shiki, so neither a Markdown parser nor a highlighter ships to the browser.
- **Routes** are defined once in `src/routes.js`. Each page is its own chunk.
- **Prerendering:** `npm run build` builds the client, then a server bundle, then `scripts/prerender.js` renders every route to `dist/<path>/index.html` and writes `sitemap.xml`, `feed.xml` and `robots.txt`. Each page's CSS and chunks are linked from the Vite manifest, and the browser hydrates the prerendered HTML.
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
project: duophonic # optional, links the post and the project to each other
image: /images/<slug>/og-image.jpg # optional, link preview image
---

Write Markdown here. `## Headings` show up in the table of contents.
```

It appears on the start page, the blog, the command palette, the RSS feed and the sitemap automatically.

## Adding a project

Create `content/projects/<slug>.md` with `title`, `order`, `kind`, `year`, `tagline`, `summary`, `stack`, `highlights` and `links` (`live`, `source`, `download`). See `content/projects/duophonic.md` for a full example. The first four projects by `order` get a stage on the start page.
