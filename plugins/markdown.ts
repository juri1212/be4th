import { readFile } from 'node:fs/promises';
import { Marked } from 'marked';
import type { Token, Tokens } from 'marked';
import { createHighlighter, type BundledLanguage, type Highlighter } from 'shiki';
import type { Plugin } from 'vite';
import { parse as parseYaml } from 'yaml';
import type { FaqEntry, Heading, Post, PostMeta } from '../src/types.ts';

// Turns content/*.md into modules at build time, so no Markdown parser or highlighter ships to the browser.
//   import post from './post.md'       → { meta, html, headings, faq }
//   import meta from './post.md?meta'  → meta only, for lists and the command palette

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const WORDS_PER_MINUTE = 220;
const LANGUAGES: BundledLanguage[] = ['sh', 'swift', 'rust', 'ts', 'tsx', 'js', 'json', 'toml', 'yaml', 'html', 'css'];
const LANGUAGE_LABELS: Record<string, string> = { sh: 'Shell', ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', json: 'JSON', toml: 'TOML', yaml: 'YAML', html: 'HTML', css: 'CSS' };

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => HTML_ESCAPES[char] ?? char);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function readingTime(body: string): number {
  const words = body.replace(/<[^>]+>|```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const plainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .replace(/ ([.,:;?!)])/g, '$1')
    .trim();

// Questions and answers from a "## FAQ" section: each ### heading is a question, the text up to the next heading its answer.
function faqOf(tokens: Token[], marked: Marked): FaqEntry[] {
  const isHeading = (token: Token): token is Tokens.Heading => token.type === 'heading';
  const start = tokens.findIndex((token) => isHeading(token) && token.depth === 2 && /^faq$/i.test(token.text));
  if (start < 0) return [];
  const faq: { question: string; answer: string[] }[] = [];
  for (const token of tokens.slice(start + 1)) {
    if (isHeading(token) && token.depth <= 2) break;
    if (isHeading(token)) faq.push({ question: token.text, answer: [] });
    else if (token.type !== 'space') faq.at(-1)?.answer.push(token.type === 'code' ? (token as Tokens.Code).text : plainText(marked.parser([token])));
  }
  return faq.map(({ question, answer }) => ({ question, answer: answer.join(' ') }));
}

function render(body: string, highlighter: Highlighter): Omit<Post, 'meta'> {
  const headings: Heading[] = [];
  const used = new Map<string, number>();
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
        const language = LANGUAGES.find((known) => known === lang) ?? 'text';
        const code = highlighter.codeToHtml(text, { lang: language, theme: 'vesper' });
        const label = LANGUAGE_LABELS[language] ?? language.charAt(0).toUpperCase() + language.slice(1);
        return `<div class="code"><div class="code__bar"><span>${escapeHtml(label)}</span><button type="button" class="code__copy" data-copy>Copy</button></div>${code}</div>`;
      },
      link({ href, title, tokens }) {
        const external = /^https?:\/\//.test(href);
        const attributes = `${title ? ` title="${escapeHtml(title)}"` : ''}${external ? ' rel="noopener"' : ''}`;
        return `<a href="${escapeHtml(href)}"${attributes}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
  const tokens = marked.lexer(body);
  return { html: marked.parser(tokens), headings, faq: faqOf(tokens, marked) };
}

export default function markdown(): Plugin {
  let highlighter: Highlighter | undefined;
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
      const slug = file.split('/').pop()!.replace(/\.md$/, '');
      const meta: PostMeta = { slug, ...(match ? parseYaml(match[1]) : {}), readingTime: readingTime(body) };
      if (query === 'meta') return `export default ${JSON.stringify(meta)};`;
      highlighter ??= await createHighlighter({ themes: ['vesper'], langs: LANGUAGES });
      const post: Post = { meta, ...render(body, highlighter) };
      return `export default ${JSON.stringify(post)};`;
    },
  };
}
