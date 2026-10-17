// Metadata for every post is bundled eagerly (it's small and every page lists some of it).
// Full bodies are loaded per page, so each page only downloads its own content.

const byDate = (a, b) => b.date.localeCompare(a.date);

const metaOf = (modules) => Object.values(modules).map((module) => module.default);

export const POSTS = metaOf(import.meta.glob('../content/posts/*.md', { query: '?meta', eager: true })).sort(byDate);
// Write-ups of things I've built. `featured` sets their order on the start page, where each gets its own stage.
export const PROJECTS = POSTS.filter((post) => post.featured).sort((a, b) => a.featured - b.featured);

const postBodies = import.meta.glob('../content/posts/*.md');

export const loadPost = async (slug) => (await postBodies[`../content/posts/${slug}.md`]()).default;

export const postUrl = (post) => `/blog/${post.slug}/`;
