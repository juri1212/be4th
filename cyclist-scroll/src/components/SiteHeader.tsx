import type { NavLink } from '../site';
import PaletteButton from './PaletteButton';

interface SiteHeaderProps {
  links: NavLink[];
  // The `id` of the link to mark as the current page or section.
  current?: string | null;
  brand?: boolean;
}

export default function SiteHeader({ links, current, brand = true }: SiteHeaderProps) {
  return (
    <header className={`site-header${brand ? '' : ' site-header--bare'}`}>
      {brand && (
        <a className="brand" href="/">
          be4th
        </a>
      )}
      <nav aria-label="Main">
        {links.map(({ href, label, id }) => (
          <a key={href} href={href} aria-current={current === id ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <PaletteButton />
    </header>
  );
}
