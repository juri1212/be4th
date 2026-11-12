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
- **Deploy:** pushing to `main` builds the site and publishes `dist/` to GitHub Pages at be4th.com (`.github/workflows/deploy.yml`). Pages serves the prerendered `404.html` for unknown paths. Old URLs get small pages that refresh to their new location, written by `scripts/prerender.ts` (`REDIRECTS`), because Pages can't send real redirects.
- **Activity graphs:** the start page shows GitHub contributions and Strava training per day for the past year. Every deploy, and a scheduled one every night, runs `scripts/fetch-activity.ts` before building, and the build ships the JSON as `/data/`. If fetching fails, nothing is deployed and the live site keeps its current data. Visitors only load those files from be4th.com; their browsers never contact GitHub or Strava. Both graphs share one scale, set by `ACTIVITY` in `src/site.ts`.

## The garage

`/garage/` is a 3D walkthrough of loading the bike onto the car, drawn with three.js in `src/garage/`. `scene.ts` runs the sequence as a function of time (`timeline.ts`), so it can be scrubbed as well as played. The bike (`bike.ts`) and the roof rack (`rack.ts`) are modelled in code; the rack is fitted to the car's roof at load time by casting rays onto it. A switch on the page turns the studio's lights off for night and the car's on: the headlights and the tail light's glow are lights fixed to the car in `car.ts`, and `studio.ts` dims the room. The page loads three.js and the model only in the browser, after the prerendered text. The sequence opens with the bike being put together: the bike needs nothing but the scene's script, so that can start while the car is still downloading, and the car rolls in once the bike is done. If the car is late, the sequence waits for it there.

The car is `public/models/911.glb`, adapted from [Porsche 911 992](https://sketchfab.com/3d-models/porsche-911-992-dd10a7e346a645af8ba80be48b604854) by Márcio Meireles, licensed [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/), so it is credited on the page and must stay out of anything commercial. To rebuild it from the Sketchfab download:

```sh
npm install --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
node scripts/models/build-911.mjs <downloaded .glb> public/models/911.glb
```

The last stage of that, `scripts/models/pack-911.mjs`, is what keeps the file small: the four wheels are one rim and one brake disc placed four times, positions are stored to a quarter of a millimetre, and only paint and glass keep finely graded normals.

How the page loads is measured rather than guessed: `npm run measure`, after a build, opens it in headless Chrome with a cold cache, once as a desktop and once as a phone on 4G, and reports the bytes received and the time until the sequence starts playing. `npm run measure -- --log "<what changed>"` appends the result to `docs/garage-loading.md`, which has a section for every change to the loading so far.

## Activity data

```sh
npm run fetch-activity  # writes .data/*.json, which dev and preview serve at /data/ and the build copies to dist/data/
```

Without Strava credentials it only fetches GitHub. To connect Strava:

1. Create an API app at <https://www.strava.com/settings/api> with the callback domain `localhost`.
2. Run `npm run strava-auth`, enter the app's client ID and secret, and approve in the browser tab that opens. It catches the redirect on `localhost:8723`, and with the [GitHub CLI](https://cli.github.com) signed in, stores the variable `STRAVA_CLIENT_ID` and the secrets `STRAVA_CLIENT_SECRET` and `STRAVA_REFRESH_TOKEN` in this repository. Without it, the script prints them to add by hand.
3. Run "Deploy website" from the Actions tab once instead of waiting for the night.

Only the hours per day are published, from all activity types. If Strava ever revokes the refresh token, deploys fail and the site keeps showing the last good data; run step 2 again.

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
