---
title: Artifact Viewer
order: 3
kind: Web app
year: 2026
tagline: Open GitHub Actions HTML reports right in the browser.
summary: Paste a workflow run or artifact URL and browse the HTML report inside — no downloading, unzipping or hosting. Everything happens client-side, behind a service worker.
stack: [TypeScript, Service Workers, fflate, GitHub API, Vite]
highlights:
  - Unzips artifacts in the browser and serves them through a service worker
  - Relative links, CSS, JS and fetch() work like on a real static host
  - Shareable links to any run or artifact
links:
  live: https://juri1212.github.io/artifact-viewer/
  source: https://github.com/juri1212/artifact-viewer
---

## The problem

CI jobs produce useful HTML: test reports, coverage, Playwright traces, built previews. GitHub stores them as zip artifacts, so looking at one means downloading, unzipping and opening files locally — and anything that loads data with `fetch()` breaks on `file://` anyway.

## How it works

1. Paste a run or artifact URL, such as `github.com/o/r/actions/runs/123`.
2. The app downloads the zip through the GitHub API and unpacks it in the browser with [fflate](https://github.com/101arrowz/fflate). GitHub Pages artifacts — a tarball inside the zip — are unpacked too.
3. A **service worker** serves the files under `view/<artifactId>/…`. Relative links, stylesheets, scripts and `fetch()` calls for data files resolve exactly like on a static host.

Viewer links are shareable, for example `#/<owner>/<repo>/runs/<id>`, so a link in a pull request comment opens straight into the report.

## Security, honestly

Artifact downloads need a token, even for public repositories. The app asks for a fine-grained token with read-only *Actions* access, keeps it in local storage and only ever sends it to `api.github.com`.

Because artifact pages run on the viewer's origin, a script inside an artifact could read that token. The README says so plainly: only open artifacts you trust, and keep the token read-only.

## Stack

Plain TypeScript and Vite, with one runtime dependency for unzipping. Deployed to GitHub Pages by a GitHub Actions workflow.
