import type { Post, PostMeta, Project } from './types';

// Metadata for every post is bundled eagerly (it's small and every page lists some of it).
// Full bodies are loaded per page, so each page only downloads its own content.

const byDate = (a: PostMeta, b: PostMeta) => b.date.localeCompare(a.date);

export const POSTS = Object.values(
  import.meta.glob<PostMeta>('../content/posts/*.md', { query: '?meta', import: 'default', eager: true }),
).sort(byDate);

// A project is a post with the extra front matter for its chapter on the start page.
const isProject = (post: PostMeta): post is Project => post.featured !== undefined;

// Write-ups of things I've built. `featured` sets their order on the start page, where each gets its own stage.
export const PROJECTS = POSTS.filter(isProject).sort((a, b) => a.featured - b.featured);

const postBodies = import.meta.glob<Post>('../content/posts/*.md', { import: 'default' });

export async function loadPost(slug: string): Promise<Post> {
  const load = postBodies[`../content/posts/${slug}.md`];
  if (!load) throw new Error(`No post named ${slug}`);
  return load();
}

export const postUrl = (post: Pick<PostMeta, 'slug'>) => `/blog/${post.slug}/`;
