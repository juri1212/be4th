import { useEffect } from 'react';
import CommandPalette from './components/CommandPalette';
import { headFor } from './routes';
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
