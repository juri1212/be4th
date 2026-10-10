// Everything the start page lists. Each project and post has its own static page under /projects and /blog.

export const PROJECTS = [
  {
    name: 'Duophonic',
    tagline: 'Play your Mac’s audio on two outputs at once.',
    description:
      'A free menu bar app that sends sound to two devices together: two pairs of AirPods, headphones and speakers, or any two outputs. Built on Core Audio and kept in sync with drift compensation.',
    icon: '/projects/duophonic/icon-256.png',
    url: '/projects/duophonic/',
    source: 'https://github.com/juri1212/Duophonic',
    facts: [
      ['Platform', 'macOS'],
      ['Built with', 'Swift'],
      ['License', 'MIT'],
    ],
  },
];

export const POSTS = [
  {
    title: 'How to play audio on two AirPods (or any two outputs) on a Mac',
    summary: 'The built-in way with Audio MIDI Setup, and the one-switch way with Duophonic.',
    date: '2026-10-05',
    url: '/blog/play-mac-audio-on-two-outputs/',
  },
];

export const LINKS = {
  github: 'https://github.com/juri1212',
};

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
