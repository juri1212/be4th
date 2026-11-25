import { useEffect, useState, type CSSProperties } from 'react';
import AdventDoor from '../components/AdventDoor';
import AdventWindow from '../components/AdventWindow';
import PageLayout from '../components/PageLayout';
import Snow from '../components/Snow';
import TownHall from '../components/TownHall';
import { DOOR_COUNT, currentDate, daysUntil, doorsDue, loadOpened, saveOpened, storageKey } from '../advent/calendar';
import { DOORS, VIEW, type Door } from '../advent/townhall';
import '../styles/advent.css';

const percent = (value: number) => `${(value * 100).toFixed(3)}%`;

const place = ({ hit }: Door): CSSProperties => ({
  left: percent((hit.left - VIEW.x) / VIEW.width),
  top: percent((hit.top - VIEW.y) / VIEW.height),
  width: percent((hit.right - hit.left) / VIEW.width),
  height: percent((hit.bottom - hit.top) / VIEW.height),
});

const sleeps = (days: number) => (days === 1 ? 'Noch einmal schlafen.' : `Noch ${days}\u00a0Mal schlafen.`);

function statusFor(due: number, opened: number[], now: Date): string {
  if (due === 0) {
    const days = daysUntil(1, now);
    return days === 1 ? 'Morgen leuchtet das erste Fenster.' : `Noch ${days} Tage, dann leuchtet das erste Fenster.`;
  }
  const missed = due - opened.filter((day) => day <= due).length;
  if (missed === 0) return due === DOOR_COUNT ? 'Alle 24 Türchen sind offen. Frohe Weihnachten!' : 'Für heute ist alles offen. Morgen leuchtet das nächste Fenster.';
  if (opened.includes(due)) return missed === 1 ? 'Ein älteres Türchen ist noch zu.' : `${missed} ältere Türchen sind noch zu.`;
  if (now.getDate() > DOOR_COUNT) return missed === 1 ? 'Ein Türchen ist noch zu.' : `${missed} Türchen sind noch zu.`;
  return 'Das heutige Türchen ist noch zu.';
}

export default function Adventskalender() {
  // Prerendered without a date: the visitor's clock decides which doors are due.
  const [now, setNow] = useState<Date | null>(null);
  const [opened, setOpened] = useState<number[]>([]);
  const [reading, setReading] = useState<{ door: Door; from: DOMRect | null } | null>(null);
  const [locked, setLocked] = useState<{ day: number; count: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const date = currentDate();
      // Only a new day changes anything on the page.
      setNow((previous) => (previous?.toDateString() === date.toDateString() ? previous : date));
    };
    update();
    const timer = window.setInterval(update, 30_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const key = now && storageKey(now);
  useEffect(() => {
    if (!key) return;
    const load = () => setOpened(loadOpened(key));
    load();
    // Another tab opened a door.
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [key]);

  const due = now ? doorsDue(now) : 0;
  const today = now && due > 0 && now.getDate() <= DOOR_COUNT ? due : null;
  const next = today && !opened.includes(today) ? today : DOORS.find(({ day }) => day <= due && !opened.includes(day))?.day;

  const press = (door: Door) => {
    if (!now || !key) return;
    if (door.day > due) {
      setLocked((previous) => ({ day: door.day, count: (previous?.count ?? 0) + 1 }));
      return;
    }
    setLocked(null);
    const frame = document.querySelector(`#tuerchen-${door.day} .advent-door__room`);
    setReading({ door, from: frame?.getBoundingClientRect() ?? null });
    if (opened.includes(door.day)) return;
    // Read again, so a door opened in another tab meanwhile isn't lost.
    const days = [...new Set([...opened, ...loadOpened(key), door.day])].sort((a, b) => a - b);
    setOpened(days);
    saveOpened(key, days);
  };

  const status = now && (locked ? `Türchen ${locked.day} geht erst am ${locked.day}. Dezember auf. ${sleeps(daysUntil(locked.day, now))}` : statusFor(due, opened, now));
  const openedNow = opened.filter((day) => day <= due).length;

  return (
    <PageLayout>
      <article className="advent" lang="de">
        <header className="advent__intro">
          <h1>Adventskalender</h1>
          <p className="lede">Jeden Tag im Dezember leuchtet am Bocholter Rathaus ein Fenster mehr. Dahinter steckt Wissen aus Geschichte und Sport, das niemand braucht.</p>
          <div className="advent__status">
            <p aria-live="polite">{status}</p>
            {next && (
              <button type="button" className="button button--solid" onClick={() => press(DOORS[next - 1]!)}>
                Türchen {next} öffnen
              </button>
            )}
            {openedNow > 0 && (
              <p className="advent__count">
                {openedNow} von {DOOR_COUNT} geöffnet
              </p>
            )}
          </div>
        </header>

        <section className="advent__scene" aria-label="Das Bocholter Rathaus mit 24 Türchen">
          <div className="hall">
            <TownHall />
            <ol className="hall__doors">
              {DOORS.map((door) => {
                const { day } = door;
                const state = day > due ? 'locked' : opened.includes(day) ? 'opened' : 'due';
                const label = { locked: `Türchen ${day}, geht am ${day}. Dezember auf`, due: `Türchen ${day} öffnen`, opened: `Türchen ${day}, schon geöffnet, noch einmal lesen` }[state];
                const shaking = locked?.day === day;
                return (
                  <li key={day} style={place(door)}>
                    <button
                      type="button"
                      id={`tuerchen-${day}`}
                      className={`advent-door advent-door--${door.kind}`}
                      data-state={state}
                      data-today={day === today || undefined}
                      data-shake={shaking ? locked.count % 2 : undefined}
                      style={{ '--day': day } as CSSProperties}
                      aria-label={label}
                      aria-disabled={state === 'locked'}
                      onClick={() => press(door)}
                    >
                      <AdventDoor door={door} />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
        <Snow />
      </article>
      {reading && <AdventWindow key={reading.door.day} door={reading.door} from={reading.from} onClose={() => setReading(null)} />}
    </PageLayout>
  );
}
