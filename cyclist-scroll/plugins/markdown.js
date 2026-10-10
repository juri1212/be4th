import { readFile } from 'node:fs/promises';
import { Marked } from 'marked';
import { createHighlighter } from 'shiki';
import { parse as parseYaml } from 'yaml';

// Turns content/*.md into modules at build time, so no Markdown parser or highlighter ships to the browser.
//   import post from './post.md'       → { meta, html, headings }
//   import meta from './post.md?meta'  → meta only, for lists and the command palette

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const WORDS_PER_MINUTE = 220;
const LANGUAGES = ['sh', 'swift', 'rust', 'ts', 'tsx', 'js', 'json', 'toml', 'yaml', 'html', 'css'];
const LANGUAGE_LABELS = { sh: 'Shell', ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', json: 'JSON', toml: 'TOML', yaml: 'YAML', html: 'HTML', css: 'CSS' };

const escapeHtml = (value) => value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function readingTime(body) {
  const words = body.replace(/<[^>]+>|```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function render(body, highlighter) {
  const headings = [];
  const used = new Map();
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        if (depth === 1 || depth > 3) return `<h${depth}>${inner}</h${depth}>`;
        const base = slugify(text) || 'section';
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        const id = count ? `${base}-${count}` : base;
        headings.push({ id, depth, text: inner.replace(/<[^>]+>/g, '') });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${depth}>`;
      },
      code({ text, lang }) {
        const language = LANGUAGES.includes(lang) ? lang : 'text';
        const code = highlighter.codeToHtml(text, { lang: language, theme: 'vesper' });
        const label = LANGUAGE_LABELS[language] ?? language[0].toUpperCase() + language.slice(1);
        return `<div class="code"><div class="code__bar"><span>${escapeHtml(label)}</span><button type="button" class="code__copy" data-copy>Copy</button></div>${code}</div>`;
      },
      link({ href, title, tokens }) {
        const external = /^https?:\/\//.test(href);
        const attributes = `${title ? ` title="${escapeHtml(title)}"` : ''}${external ? ' rel="noopener"' : ''}`;
        return `<a href="${escapeHtml(href)}"${attributes}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
  return { html: marked.parse(body), headings };
}

export default function markdown() {
  let highlighter;
  return {
    name: 'be4th:markdown',
    enforce: 'pre',
    async load(id) {
      const [file, query] = id.split('?');
      if (!file.endsWith('.md')) return null;
      this.addWatchFile(file);
      const source = await readFile(file, 'utf8');
      const match = source.match(FRONTMATTER);
      const body = match ? source.slice(match[0].length) : source;
      const slug = file.split('/').pop().replace(/\.md$/, '');
      const meta = { slug, ...(match ? parseYaml(match[1]) : {}), readingTime: readingTime(body) };
      if (query === 'meta') return `export default ${JSON.stringify(meta)};`;
      highlighter ??= await createHighlighter({ themes: ['vesper'], langs: LANGUAGES });
      return `export default ${JSON.stringify({ meta, ...render(body, highlighter) })};`;
    },
  };
}
