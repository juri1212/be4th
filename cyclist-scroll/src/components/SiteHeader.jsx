import PaletteButton from './PaletteButton';

export default function SiteHeader({ links, current, brand = true }) {
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
