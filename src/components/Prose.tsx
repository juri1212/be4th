import type { MouseEvent } from 'react';

// Rendered Markdown. Code blocks come with a copy button from the build; one delegated handler serves them all.
export default function Prose({ html, className = '' }: { html: string; className?: string }) {
  const onClick = async (event: MouseEvent<HTMLDivElement>) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-copy]') : null;
    const code = button?.closest('.code')?.querySelector('pre');
    if (!button || !code) return;
    await navigator.clipboard.writeText(code.innerText);
    button.textContent = 'Copied';
    button.dataset.copied = '';
    setTimeout(() => {
      button.textContent = 'Copy';
      delete button.dataset.copied;
    }, 1600);
  };

  return <div className={`prose ${className}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
