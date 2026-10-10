import { useEffect, useState } from 'react';

export const openPalette = () => window.dispatchEvent(new Event('palette:open'));

// Rendered as ⌘K on the server; switched to Ctrl K after hydration on other platforms.
export function useShortcutLabel() {
  const [label, setLabel] = useState('⌘K');
  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setLabel('Ctrl K');
  }, []);
  return label;
}
