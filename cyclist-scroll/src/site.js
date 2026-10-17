export const SITE = {
  url: 'https://be4th.com',
  name: 'be4th',
  author: 'Juri Beforth',
  role: 'Full-stack developer',
  description:
    'Juri Beforth is a full-stack developer building native macOS apps in Swift, backend services in Rust and web apps in React and TypeScript.',
  github: 'https://github.com/juri1212',
  source: 'https://github.com/juri1212/be4th',
  // Social preview for pages without their own image. 1200×630.
  image: '/og-image.jpg',
};

// Provider details for the imprint (§ 5 DDG) and the privacy policy. Fill in before deploying.
export const LEGAL = {
  name: 'Juri Beforth',
  email: 'TODO@be4th.com',
  hoster: 'ALL-INKL.COM – Neue Medien Münnich, Hauptstraße 68, 02742 Friedersdorf, Germany',
  // Must match the log settings in the ALL-INKL KAS (Einstellungen → Logs & Statistiken).
  logRetentionDays: 7,
  updated: '2026-10-14',
};

export const SITE_LINKS = [
  { id: 'writing', href: '/blog/', label: 'Writing' },
  { id: 'github', href: SITE.github, label: 'GitHub' },
];

// Grouped from what the projects on this site are actually built with.
export const TOOLBOX = [
  { area: 'Apps', tools: ['Swift', 'SwiftUI', 'Core Audio', 'XCTest'] },
  { area: 'Backend', tools: ['Rust', 'axum', 'Tokio', 'Node.js', 'REST APIs'] },
  { area: 'Web', tools: ['TypeScript', 'React', 'Vite', 'Service Workers', 'Leaflet'] },
  { area: 'Delivery', tools: ['GitHub Actions', 'GitHub Apps & OAuth', 'Static hosting', 'Prerendering'] },
];

/* global __BUILD__ */
export const BUILD = __BUILD__;

export const absoluteUrl = (path) => new URL(path, SITE.url).href;

export const formatDate = (iso, month = 'long') =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });
