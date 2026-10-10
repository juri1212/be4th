import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { POSTS, PROJECTS, postUrl, projectUrl } from '../content';
import { SITE, formatDate } from '../site';
import { ArrowRight, External, Search } from './icons';

const ITEMS = [
  { group: 'Pages', label: 'Home', href: '/', keywords: 'start ride intro' },
  { group: 'Pages', label: 'Work', href: '/projects/', keywords: 'projects portfolio' },
  { group: 'Pages', label: 'Writing', href: '/blog/', keywords: 'blog posts articles' },
  ...PROJECTS.map((project) => ({
    group: 'Projects',
    label: project.title,
    hint: project.kind,
    href: projectUrl(project),
    keywords: `${project.tagline} ${project.stack.join(' ')}`,
  })),
  ...POSTS.map((post) => ({
    group: 'Writing',
    label: post.title,
    hint: formatDate(post.date, 'short'),
    href: postUrl(post),
    keywords: (post.tags ?? []).join(' '),
  })),
  { group: 'Elsewhere', label: 'GitHub', hint: 'juri1212', href: SITE.github, keywords: 'code profile' },
  { group: 'Elsewhere', label: 'Source of this site', href: SITE.source, keywords: 'github repository be4th' },
  { group: 'Elsewhere', label: 'RSS feed', href: '/feed.xml', keywords: 'subscribe atom' },
  { group: 'Actions', label: 'Copy link to this page', action: 'copy', keywords: 'share url clipboard' },
  { group: 'Actions', label: 'Back to top', action: 'top', keywords: 'scroll up start' },
];

const isExternal = (href) => /^https?:\/\//.test(href);

function matches(item, words) {
  const haystack = `${item.label} ${item.group} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
}

const isTyping = (target) => target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

export default function CommandPalette() {
  const dialogRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [notice, setNotice] = useState('');
  const id = useId();

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return ITEMS.filter((item) => matches(item, words));
  }, [query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const open = () => {
      if (dialog.open) return;
      setQuery('');
      setSelected(0);
      setNotice('');
      dialog.showModal();
    };
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.open) dialog.close();
        else open();
      } else if (event.key === '/' && !dialog.open && !isTyping(event.target)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('palette:open', open);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('palette:open', open);
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected, results]);

  const run = async (item) => {
    if (item.action === 'copy') {
      await navigator.clipboard.writeText(window.location.href.split('#')[0]);
      setNotice('Link copied');
      setTimeout(() => dialogRef.current?.close(), 700);
      return;
    }
    dialogRef.current.close();
    if (item.action === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else if (isExternal(item.href)) window.open(item.href, '_blank', 'noopener');
    else window.location.assign(item.href);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setSelected((index) => (index + step + results.length) % Math.max(results.length, 1));
    } else if (event.key === 'Enter' && results[selected]) {
      event.preventDefault();
      run(results[selected]);
    }
  };

  let lastGroup = null;

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Search and jump to"
      onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
    >
      <div className="palette__panel">
        <label className="palette__search">
          <Search />
          <input
            type="text"
            value={query}
            placeholder="Search projects, posts, pages…"
            autoComplete="off"
            spellCheck="false"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={results[selected] ? `${id}-${selected}` : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd>esc</kbd>
        </label>

        <ul className="palette__list" id={`${id}-list`} role="listbox" ref={listRef}>
          {results.map((item, index) => {
            const heading = item.group !== lastGroup && item.group;
            lastGroup = item.group;
            return (
              <li key={`${item.group}-${item.label}`} role="presentation">
                {heading && <div className="palette__group">{heading}</div>}
                <div
                  id={`${id}-${index}`}
                  role="option"
                  aria-selected={index === selected}
                  className="palette__item"
                  onMouseMove={() => setSelected(index)}
                  onClick={() => run(item)}
                >
                  <span className="palette__label">{item.label}</span>
                  {item.hint && <span className="palette__hint">{item.hint}</span>}
                  {item.href && isExternal(item.href) ? <External /> : <ArrowRight />}
                </div>
              </li>
            );
          })}
          {!results.length && <li className="palette__empty">Nothing matches “{query}”.</li>}
        </ul>

        <div className="palette__footer" aria-live="polite">
          {notice || (
            <>
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> to move
              </span>
              <span>
                <kbd>↵</kbd> to open
              </span>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
