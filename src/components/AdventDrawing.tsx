import { Suspense, lazy } from 'react';
import { loadDrawings } from '../advent/drawings/load';

const Drawing = lazy(loadDrawings);

// A child's drawing of the story behind a door. The sheet keeps its place until the drawing is there.
export default function AdventDrawing({ day, label }: { day: number; label: string }) {
  return (
    <div className="advent-drawing" role="img" aria-label={label}>
      <Suspense>
        <Drawing day={day} />
      </Suspense>
    </div>
  );
}
