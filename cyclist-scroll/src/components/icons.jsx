const Icon = ({ children, ...props }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="icon" {...props}>
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
