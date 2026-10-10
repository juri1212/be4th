import { POSTS, PROJECTS, loadPost, loadProject, postUrl, projectUrl } from './content';
import { SITE, absoluteUrl } from './site';

// Every page of the site. The build prerenders each path; the browser resolves the same table to hydrate.
export const PATHS = ['/', '/projects/', ...PROJECTS.map(projectUrl), '/blog/', ...POSTS.map(postUrl), '/404.html'];

export function resolve(pathname) {
  const path = pathname.endsWith('/') || pathname.endsWith('.html') ? pathname : `${pathname}/`;
  if (path === '/' || path === '/index.html') return { page: 'home', path: '/' };
  if (path === '/projects/') return { page: 'projects', path };
  if (path === '/blog/') return { page: 'blog', path };
  const project = PROJECTS.find((item) => projectUrl(item) === path);
  if (project) return { page: 'project', path, slug: project.slug };
  const post = POSTS.find((item) => postUrl(item) === path);
  if (post) return { page: 'post', path, slug: post.slug };
  return { page: 'not-found', path: '/404.html' };
}

// Each page is its own chunk, so the blog doesn't download the ride and the home page doesn't download posts.
const PAGE_FILES = { home: 'Home', projects: 'Projects', project: 'Project', blog: 'Blog', post: 'Post', 'not-found': 'NotFound' };
const pages = import.meta.glob('./pages/*.jsx');

export const pageFile = (route) => `src/pages/${PAGE_FILES[route.page]}.jsx`;

export function contentFile(route) {
  if (route.page === 'project') return `content/projects/${route.slug}.md`;
  if (route.page === 'post') return `content/posts/${route.slug}.md`;
  return null;
}

async function loadData(route) {
  if (route.page === 'project') return { project: await loadProject(route.slug) };
  if (route.page === 'post') return { post: await loadPost(route.slug) };
  return {};
}

export async function loadRoute(route) {
  const [page, data] = await Promise.all([pages[`./pages/${PAGE_FILES[route.page]}.jsx`](), loadData(route)]);
  return { ...route, ...data, Page: page.default };
}

const person = { '@type': 'Person', name: SITE.author, url: SITE.url, sameAs: [SITE.github] };

export function headFor(route) {
  const base = { url: absoluteUrl(route.path), type: 'website', image: null, jsonLd: null };
  switch (route.page) {
    case 'home':
      return {
        ...base,
        title: `${SITE.author} · ${SITE.role}`,
        description: SITE.description,
        jsonLd: { '@context': 'https://schema.org', ...person, jobTitle: SITE.role },
      };
    case 'projects':
      return { ...base, title: `Work · ${SITE.name}`, description: `Projects by ${SITE.author}: native apps, backend services and web apps.` };
    case 'blog':
      return { ...base, title: `Writing · ${SITE.name}`, description: `Notes by ${SITE.author} on the things I build and how they work.` };
    case 'project': {
      const { meta } = route.project;
      return {
        ...base,
        title: `${meta.title} — ${meta.tagline} · ${SITE.name}`,
        description: meta.summary,
        image: meta.image?.endsWith('.webp') ? null : meta.image,
      };
    }
    case 'post': {
      const { meta } = route.post;
      return {
        ...base,
        type: 'article',
        title: `${meta.title} · ${SITE.name}`,
        description: meta.description,
        image: meta.image,
        published: meta.date,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: meta.title,
          description: meta.description,
          datePublished: meta.date,
          dateModified: meta.updated ?? meta.date,
          author: person,
          image: meta.image && absoluteUrl(meta.image),
          mainEntityOfPage: base.url,
        },
      };
    }
    default:
      return { ...base, url: null, title: `Wrong turn · ${SITE.name}`, description: 'This page doesn’t exist.' };
  }
}
