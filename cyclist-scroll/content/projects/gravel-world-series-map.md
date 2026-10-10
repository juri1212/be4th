---
title: Gravel World Series Map
order: 4
kind: Web app · Data pipeline
year: 2025
tagline: Every UCI Gravel World Series race on one map.
summary: An interactive map of the UCI Gravel World Series calendar. A scheduled job scrapes and geocodes the official calendar every night, and the static site updates itself.
stack: [React, TypeScript, Leaflet, Node.js, GitHub Actions]
highlights:
  - Nightly GitHub Actions job scrapes the official calendar and commits the changes
  - Locations are geocoded with Nominatim, behind a local cache
  - Fully static — no server, no database, hosted on GitHub Pages
links:
  live: https://juri1212.github.io/gravel-world-series-map/
  source: https://github.com/juri1212/gravel-world-series-map
---

## Why

The UCI Gravel World Series is a calendar of qualifier races all over the world, published as a list. When you're planning a season — or a trip — you want to see where they are, not read about it.

## How it works

The project is two small workspaces:

- **A fetcher** in Node.js downloads the official calendar, parses it with `htmlparser2` and geocodes each location with Nominatim. Results are cached locally, so every place is only looked up once and the public service isn't hammered.
- **A frontend** in React and TypeScript renders the events with Leaflet, next to a list of races with their dates and details.

## A site that maintains itself

A GitHub Actions workflow runs the fetcher every night at 02:00 UTC. If the calendar changed, the same workflow commits the new `calendar.json` and redeploys the site to GitHub Pages.

There's no server and no database: the repository *is* the backend, and its commit history doubles as a changelog of the race calendar.
