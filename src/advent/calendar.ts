// Which doors may be opened when, and which ones this visitor has already opened.

export const DOOR_COUNT = 24;
const DECEMBER = 11;

// A door opens on its day, by the visitor's own clock, and stays available until the end of December.
export const doorsDue = (now: Date) => (now.getMonth() === DECEMBER ? Math.min(now.getDate(), DOOR_COUNT) : 0);

// Whole days from today until door `day` can be opened.
export function daysUntil(day: number, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(now.getFullYear(), DECEMBER, day);
  // Rounded, so the hour lost or gained when clocks change doesn't count as a day.
  return Math.max(0, Math.round((due.getTime() - today.getTime()) / 86_400_000));
}

// The dev server takes ?tag=2026-12-05 to see the calendar on that day.
export function currentDate(): Date {
  if (import.meta.env.DEV) {
    const day = new URLSearchParams(window.location.search).get('tag');
    if (day) return new Date(`${day}T12:00:00`);
  }
  return new Date();
}

// Each year starts with every door closed.
export const storageKey = (now: Date) => `be4th:adventskalender:${now.getFullYear()}`;

export function loadOpened(key: string): number[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= DOOR_COUNT);
  } catch {
    // Storage is switched off, or holds something that isn't ours.
    return [];
  }
}

export function saveOpened(key: string, days: number[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(days));
  } catch {
    // Without storage the doors stay open until the page is left.
  }
}
