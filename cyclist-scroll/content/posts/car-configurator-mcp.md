---
title: car-configurator-mcp
description: An MCP server that lets an AI agent configure Volkswagen and Porsche cars in the official configurators, compare prices and WLTP data, and export a link to the result.
summary: An MCP server that drives the official Volkswagen, VW Commercial Vehicles and Porsche configurators. An agent can browse models, add options, compare prices and WLTP data, and hand back a link that opens the car in the manufacturer’s own configurator.
date: "2026-10-17"
tags: [TypeScript, Node.js, MCP, Zod, Vitest]
featured: 2
kind: MCP server
year: 2026
tagline: Let an AI agent spec a car in the real configurator.
highlights:
  - One set of tools over three manufacturer backends, from model list to exported VW or Porsche Code
  - Reports what the configurator changed on its own when an option is added, so the agent can explain it
  - Tested offline against recorded backend responses, with a separate live suite against the real backends
links:
  source: https://github.com/juri1212/car-configurator-mcp
---

## The idea

Configuring a car online means clicking through dozens of steps, then doing it again for the next trim to compare. An AI agent is good at exactly that kind of patient comparison, if it can reach the configurator. car-configurator-mcp gives it that access through the [Model Context Protocol](https://modelcontextprotocol.io): ask for *“a Golf GTI in a metallic paint with 19-inch wheels, under 52,000 €, and a link to it”* and the agent builds it in Volkswagen’s own configurator.

It supports three configurators: Volkswagen cars, Volkswagen Commercial Vehicles (ID. Buzz, Multivan, California and the rest) and Porsche.

## The tools

The server exposes one set of tools for every brand:

- **Catalogue.** `list_models` and `list_variants` return model lines, trims and engines with prices, power and gearbox.
- **Configuring.** `start_configuration` opens a configuration, `list_options` and `get_option` browse paint, wheels, interiors and packages, and `change_options` adds or removes them, with a `dry_run` to preview the price first.
- **Results.** `get_summary` gives the price breakdown, performance, WLTP efficiency and technical data. `compare_configurations` puts several side by side.
- **Codes.** `export_code` saves the car with the manufacturer and returns a link that opens it in the official configurator, along with its VW Code or Porsche Code. `import_code` loads one back in and works out the brand by itself.

## When the configurator decides for you

Car configurators keep every car buildable. Add a package and the backend may quietly add a second option, remove a third and swap the standard seats for sports seats. If the agent doesn’t know, it can’t tell you.

So `change_options` reports `side_effects` next to the price change: what was added or removed to keep the car valid, which paint or wheel choice was replaced, and which standard parts were swapped for a package’s versions. When a backend needs a decision, as Porsche sometimes does for seats or interiors, the server applies the configurator’s default, names it, and lists the alternatives in `choices_required`, so the agent can ask you.

## Behind the tools

The configurators run on undocumented backends, so each brand has its own adapter that maps them onto the shared tools. The Volkswagen adapter discovers its API key and tenant from the public site and caches the catalogue by its cache key. The Porsche adapter reads the configurator’s data routes and supports other markets through a locale setting.

The server is meant for personal, low-volume use. Requests go out one at a time with a gap between them, catalogue responses are cached, and no login or personal data is involved.

## Tested without the network

Backends that can change any day need tests that don’t depend on them. The unit and MCP tests run against recorded responses in `test/fixtures/`, so they’re fast and offline. A separate live suite runs end to end against the real configurators and exports real codes, which shows when a manufacturer changed something.
