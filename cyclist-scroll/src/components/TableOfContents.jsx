import { useEffect, useState } from 'react';

const MAX_ITEMS = 12;

// Highlights the last heading that scrolled past the top third of the viewport.
// Long pages list only their sections, so the outline stays scannable.
export default function TableOfContents({ headings: all }) {
  const headings = all.length > MAX_ITEMS ? all.filter(({ depth }) => depth === 2) : all;
  const [active, setActive] = useState(null);

  useEffect(() => {
    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const update = () => {
      const line = window.innerHeight / 3;
      const current = elements.filter((element) => element.getBoundingClientRect().top < line).pop();
      setActive(current?.id ?? null);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="toc" aria-label="On this page">
      <h2>On this page</h2>
      <ol>
        {headings.map(({ id, text, depth }) => (
          <li key={id} data-depth={depth}>
            <a href={`#${id}`} aria-current={active === id ? 'location' : undefined}>
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
