// Rendered Markdown. Code blocks come with a copy button from the build; one delegated handler serves them all.
export default function Prose({ html, className = '' }) {
  const onClick = async (event) => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    await navigator.clipboard.writeText(button.closest('.code').querySelector('pre').innerText);
    button.textContent = 'Copied';
    button.dataset.copied = '';
    setTimeout(() => {
      button.textContent = 'Copy';
      delete button.dataset.copied;
    }, 1600);
  };

  return <div className={`prose ${className}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
