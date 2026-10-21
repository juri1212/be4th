import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { POSTS } from './content';
import Root from './Root';
import { PATHS, contentFile, headFor, loadRoute, pageFile, resolve } from './routes';
import { SITE } from './site';
import type { RenderResult } from './types';

export { PATHS, POSTS, SITE };

export async function render(path: string): Promise<RenderResult> {
  const route = await loadRoute(resolve(path));
  const html = renderToString(
    <StrictMode>
      <Root route={route} />
    </StrictMode>,
  );
  return { html, head: headFor(route), files: [pageFile(route), contentFile(route)].filter((file) => file !== null) };
}
