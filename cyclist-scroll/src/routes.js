import { POSTS, PROJECTS, loadPost, postUrl } from './content';
import { SITE, absoluteUrl } from './site';

// Every page of the site. The build prerenders each path; the browser resolves the same table to hydrate.
export const PATHS = ['/', '/blog/', ...POSTS.map(postUrl), '/imprint/', '/privacy/', '/404.html'];

export function resolve(pathname) {
  const path = pathname.endsWith('/') || pathname.endsWith('.html') ? pathname : `${pathname}/`;
  if (path === '/' || path === '/index.html') return { page: 'home', path: '/' };
  if (path === '/blog/') return { page: 'blog', path };
  if (path === '/imprint/') return { page: 'imprint', path };
  if (path === '/privacy/') return { page: 'privacy', path };
  const post = POSTS.find((item) => postUrl(item) === path);
  if (post) return { page: 'post', path, slug: post.slug };
  return { page: 'not-found', path: '/404.html' };
}

// Each page is its own chunk, so the blog doesn't download the ride and the home page doesn't download posts.
const PAGE_FILES = { home: 'Home', blog: 'Blog', post: 'Post', imprint: 'Imprint', privacy: 'Privacy', 'not-found': 'NotFound' };
const pages = import.meta.glob('./pages/*.jsx');

export const pageFile = (route) => `src/pages/${PAGE_FILES[route.page]}.jsx`;

export function contentFile(route) {
  if (route.page === 'post') return `content/posts/${route.slug}.md`;
  return null;
}

async function loadData(route) {
  if (route.page === 'post') return { post: await loadPost(route.slug) };
  return {};
}

export async function loadRoute(route) {
  const [page, data] = await Promise.all([pages[`./pages/${PAGE_FILES[route.page]}.jsx`](), loadData(route)]);
  return { ...route, ...data, Page: page.default };
}

const person = { '@type': 'Person', '@id': `${SITE.url}/#person`, name: SITE.author, url: SITE.url, sameAs: [SITE.github] };

const breadcrumbs = (...items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: SITE.name, url: SITE.url }, ...items].map(({ name, url }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: absoluteUrl(url),
  })),
});

// Projects you can download are described as apps, so search engines know what they are and where to get them.
const app = (meta) => ({
  '@type': 'SoftwareApplication',
  '@id': `${absoluteUrl(postUrl(meta))}#app`,
  name: meta.title,
  description: meta.summary,
  applicationCategory: meta.category,
  operatingSystem: meta.os,
  downloadUrl: meta.links.download,
  url: absoluteUrl(postUrl(meta)),
  image: meta.image && absoluteUrl(meta.image),
  author: person,
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  sameAs: [meta.links.source].filter(Boolean),
});

export function headFor(route) {
  const base = { url: absoluteUrl(route.path), type: 'website', image: null, jsonLd: null };
  switch (route.page) {
    case 'home':
      return {
        ...base,
        title: `${SITE.author} · ${SITE.role}`,
        description: SITE.description,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'WebSite', name: SITE.name, url: SITE.url, description: SITE.description, inLanguage: 'en', publisher: person },
            { ...person, jobTitle: SITE.role },
          ],
        },
      };
    case 'blog':
      return { ...base, title: `Writing · ${SITE.name}`, description: `Notes by ${SITE.author} on the things I build and how they work.` };
    case 'imprint':
      return { ...base, title: `Imprint · ${SITE.name}`, description: `Legal notice and provider identification for ${SITE.name}.` };
    case 'privacy':
      return { ...base, title: `Privacy policy · ${SITE.name}`, description: `How ${SITE.name} handles personal data.` };
    case 'post': {
      const { meta, faq } = route.post;
      // A project's own write-up describes the project; a guide is about the project it names.
      const project = meta.featured ? meta : PROJECTS.find((item) => item.slug === meta.project);
      const modified = meta.updated ?? meta.date;
      return {
        ...base,
        type: 'article',
        title: `${meta.title} · ${SITE.name}`,
        description: meta.description,
        image: meta.image,
        published: meta.date,
        modified,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: meta.title,
              description: meta.description,
              datePublished: meta.date,
              dateModified: modified,
              inLanguage: 'en',
              keywords: meta.tags,
              author: person,
              publisher: person,
              image: meta.image && absoluteUrl(meta.image),
              mainEntityOfPage: base.url,
              about: project?.links?.download ? app(project) : undefined,
            },
            breadcrumbs({ name: 'Writing', url: '/blog/' }, { name: meta.title, url: route.path }),
            faq.length > 0 && {
              '@type': 'FAQPage',
              url: base.url,
              mainEntity: faq.map(({ question, answer }) => ({
                '@type': 'Question',
                name: question,
                acceptedAnswer: { '@type': 'Answer', text: answer },
              })),
            },
          ].filter(Boolean),
        },
      };
    }
    default:
      return { ...base, url: null, title: `Wrong turn · ${SITE.name}`, description: 'This page doesn’t exist.' };
  }
}
