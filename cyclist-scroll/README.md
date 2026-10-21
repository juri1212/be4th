# be4th.com

Personal site of Juri Beforth. The start page is a scroll-driven ride: each section is a stage, and the rider moves along the route as you read. Posts, including the project write-ups, are written in Markdown and prerendered to static HTML.

```sh
npm install
npm run dev     # http://localhost:5173, rendered in the browser
npm run build   # prerendered site in dist/
npm run preview # serve dist/
npm run typecheck
npm run lint
```

## How it's built

- **TypeScript** throughout, checked by `npm run typecheck` and before every build. `tsconfig.app.json` covers the site in `src/`; `tsconfig.node.json` covers the Vite config, `plugins/` and `scripts/`, which Node 24 runs as `.ts` without a build step. Types shared by both, like the shape of a post, live in `src/types.ts`.
- **Content** lives in `content/posts/*.md`, with YAML frontmatter. `plugins/markdown.ts` turns each file into a module at build time: headings get anchors for the table of contents, and code blocks are highlighted with Shiki, so neither a Markdown parser nor a highlighter ships to the browser.
- **Routes** are defined once in `src/routes.ts`. Each page is its own chunk.
- **Prerendering:** `npm run build` builds the client, then a server bundle, then `scripts/prerender.ts` renders every route to `dist/<path>/index.html` and writes `sitemap.xml` and `robots.txt`. Each page's CSS and chunks are linked from the Vite manifest, and the browser hydrates the prerendered HTML.
- **Deploy:** pushing to `main` builds the site and uploads `dist/` over FTPS (`.github/workflows/deploy-ftp.yml`). `public/.htaccess` sets up the 404 page and asset caching on Apache.
- **Activity graphs:** the start page shows GitHub commits and Strava training per day for the past year. Every night, `.github/workflows/activity-data.yml` runs `scripts/fetch-activity.ts` and uploads the JSON to `/data/` on the server, separately from the site, so neither upload overwrites the other. Visitors only load those files from be4th.com; their browsers never contact GitHub or Strava. Both graphs share one scale, set by `ACTIVITY` in `src/site.ts`.

## Activity data

```sh
npm run fetch-activity  # writes .data/*.json, which dev and preview serve at /data/
```

Without Strava credentials it only fetches GitHub. To connect Strava:

1. Create an API app at <https://www.strava.com/settings/api> with the callback domain `localhost`.
2. Run `npm run strava-auth`, enter the app's client ID and secret, and approve in the browser tab that opens. It catches the redirect on `localhost:8723`, and with the [GitHub CLI](https://cli.github.com) signed in, stores the variable `STRAVA_CLIENT_ID` and the secrets `STRAVA_CLIENT_SECRET` and `STRAVA_REFRESH_TOKEN` in this repository. Without it, the script prints them to add by hand.
3. Run "Update activity data" from the Actions tab once instead of waiting for the night.

Only the hours per day are published, from all activity types. If Strava ever revokes the refresh token, the nightly run fails and the site keeps showing the last good data; run step 2 again.

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

See `content/posts/duophonic.md` for a full example. The first two projects get a stage on the start page; `ANCHORS` in `src/pages/Home.tsx` picks which stages.
