import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Root from './Root';
import { loadRoute, resolve } from './routes';

const container = document.getElementById('root');
// Prerendered pages name the route they were rendered for. The 404 page is served at any unknown URL.
const route = await loadRoute(resolve(container.dataset.path ?? window.location.pathname));
const app = (
  <StrictMode>
    <Root route={route} />
  </StrictMode>
);

// Built pages arrive prerendered and only need hydrating; the dev server renders from scratch.
if (container.dataset.path) hydrateRoot(container, app);
else createRoot(container).render(app);
