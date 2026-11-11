import type { ReactNode } from 'react';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="icon">
    {children}
  </svg>
);

export const ArrowRight = () => (
  <Icon>
    <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
  </Icon>
);

export const ArrowLeft = () => (
  <Icon>
    <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" />
  </Icon>
);

export const ArrowUp = () => (
  <Icon>
    <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
  </Icon>
);

export const ArrowDown = () => (
  <Icon>
    <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
  </Icon>
);

export const External = () => (
  <Icon>
    <path d="M5 11 11 5M6 5h5v5" />
  </Icon>
);

export const Search = () => (
  <Icon>
    <circle cx="7" cy="7" r="4.25" />
    <path d="m10.25 10.25 3.25 3.25" />
  </Icon>
);

export const Sun = () => (
  <Icon>
    <circle cx="8" cy="8" r="2.75" />
    <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.05 1.05M11.55 11.55l1.05 1.05M3.4 12.6l1.05-1.05M11.55 4.45l1.05-1.05" />
  </Icon>
);

export const Moon = () => (
  <Icon>
    <path d="M13.75 9.1A6 6 0 1 1 6.9 2.25a4.7 4.7 0 0 0 6.85 6.85z" />
  </Icon>
);

export const Play = () => (
  <Icon>
    <path d="M5 3.5v9l7.5-4.5z" />
  </Icon>
);

export const Pause = () => (
  <Icon>
    <path d="M5.5 3.5v9M10.5 3.5v9" />
  </Icon>
);
