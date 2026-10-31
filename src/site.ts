import type { Site } from './types';

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
} satisfies Site;

// Provider details for the imprint (§ 5 DDG) and the privacy policy. Fill in before deploying.
export const LEGAL = {
  name: 'Juri Beforth',
  email: 'TODO@be4th.com',
  hoster: 'GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA',
  updated: '2026-10-31',
} as const;

export interface NavLink {
  id: string;
  href: string;
  label: string;
}

export const SITE_LINKS: NavLink[] = [
  { id: 'writing', href: '/blog/', label: 'Writing' },
  { id: 'github', href: SITE.github, label: 'GitHub' },
];

// The activity graphs on the start page shade each day on one scale, so a dark square means an equally busy day in either.
// A day counts in contributions; an hour of training counts as `hourWeight` of them. `levels` are the thresholds for
// the four shades: a day with at least levels[i] reaches shade i + 1.
export const ACTIVITY = { hourWeight: 10, levels: [1, 10, 20, 30] } as const;

export const BUILD = __BUILD__;

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href;

export const formatDate = (iso: string, month: 'long' | 'short' = 'long') =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });
