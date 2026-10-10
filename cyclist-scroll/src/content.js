// Metadata for every project and post is bundled eagerly (it's small and every page lists some of it).
// Full bodies are loaded per page, so each page only downloads its own content.

const byOrder = (a, b) => a.order - b.order;
const byDate = (a, b) => b.date.localeCompare(a.date);

const metaOf = (modules) => Object.values(modules).map((module) => module.default);

export const PROJECTS = metaOf(import.meta.glob('../content/projects/*.md', { query: '?meta', eager: true })).sort(byOrder);
export const POSTS = metaOf(import.meta.glob('../content/posts/*.md', { query: '?meta', eager: true })).sort(byDate);

const projectBodies = import.meta.glob('../content/projects/*.md');
const postBodies = import.meta.glob('../content/posts/*.md');

export const loadProject = async (slug) => (await projectBodies[`../content/projects/${slug}.md`]()).default;
export const loadPost = async (slug) => (await postBodies[`../content/posts/${slug}.md`]()).default;

export const projectUrl = (project) => `/projects/${project.slug}/`;
export const postUrl = (post) => `/blog/${post.slug}/`;
