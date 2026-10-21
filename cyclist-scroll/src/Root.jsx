import { useEffect } from 'react';
import CommandPalette from './components/CommandPalette';
import { headFor } from './routes';
// Self-hosted, so no visitor data goes to a font CDN.
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/archivo/standard-italic.css';
import './styles/base.css';

export default function Root({ route }) {
  // The prerendered head already has the title; this keeps it right in the dev server too.
  useEffect(() => {
    document.title = headFor(route).title;
  }, [route]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <route.Page {...route} />
      <CommandPalette />
    </>
  );
}
