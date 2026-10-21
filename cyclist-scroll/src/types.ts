// Shapes shared by the site and its build tooling. Types only, so Node and the browser can both import them.

export interface PostLinks {
  live?: string;
  source?: string;
  download?: string;
}

// Front matter of content/posts/*.md, plus what the Markdown plugin derives from the file.
export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  summary: string;
  date: string;
  updated?: string;
  tags?: string[];
  readingTime: number;
  // Links the post to that project's write-up.
  project?: string;
  // Link preview image, 1200×630.
  image?: string;
  // Project fields: a post with `featured` set is a project write-up with its own chapter on the start page.
  featured?: number;
  kind?: string;
  year?: string | number;
  tagline?: string;
  highlights?: string[];
  links?: PostLinks;
  os?: string;
  category?: string;
}

export interface Project extends PostMeta {
  featured: number;
  kind: string;
  year: string | number;
  tagline: string;
  highlights: string[];
  tags: string[];
  links: PostLinks & { source: string };
}

export interface Heading {
  id: string;
  depth: number;
  text: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface Post {
  meta: PostMeta;
  html: string;
  headings: Heading[];
  faq: FaqEntry[];
}

// The <head> of a page, rendered to tags by scripts/prerender.ts. Pages without a `url` are kept out of search.
export interface Head {
  url: string | null;
  type: 'website' | 'article';
  title: string;
  description: string;
  image?: string | null;
  published?: string;
  modified?: string;
  jsonLd: object | null;
}

export interface Site {
  url: string;
  name: string;
  author: string;
  role: string;
  description: string;
  github: string;
  source: string;
  image: string;
}

export interface RenderResult {
  html: string;
  head: Head;
  // Source files of the page, for the manifest lookup and the sitemap's lastmod.
  files: string[];
}

// What src/entry-server.tsx exports for the prerender.
export interface ServerEntry {
  render(path: string): Promise<RenderResult>;
  PATHS: string[];
  SITE: Site;
}

// /data/*.json, written by scripts/fetch-activity.ts.
export interface ActivityData {
  updated: string;
  to: string;
  days: Record<string, number>;
}
