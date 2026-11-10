import { openPalette, useShortcutLabel } from '../palette';
import { Search } from './icons';

export default function PaletteButton({ className = 'palette-button' }: { className?: string }) {
  const shortcut = useShortcutLabel();
  return (
    <button type="button" className={className} onClick={openPalette} aria-label="Search and jump to…">
      <Search />
      <span className="palette-button__label">Search</span>
      <kbd>{shortcut}</kbd>
    </button>
  );
}
