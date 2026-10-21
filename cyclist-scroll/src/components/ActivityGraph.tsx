import { useEffect, useRef, useState } from 'react';
import { ACTIVITY, formatDate } from '../site';
import type { ActivityData } from '../types';

// A year of daily activity, loaded from /data/ (uploaded nightly by .github/workflows/activity-data.yml).
// The prerendered page shows an empty grid of the same size, so nothing shifts when the data arrives.

const CELL = 10;
const GAP = 3;
const STEP = CELL + GAP;
const LABEL_HEIGHT = 16;
const LABEL_WIDTH = 28;
const WEEKS = 53;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS: [weekday: number, label: string][] = [
  [1, 'Mon'],
  [3, 'Wed'],
  [5, 'Fri'],
];
const WIDTH = LABEL_WIDTH + WEEKS * STEP - GAP;
const HEIGHT = LABEL_HEIGHT + 7 * STEP - GAP;

const plural = (count: number, word: string) => `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`;

function formatHours(hours: number): string {
  const minutes = Math.round(hours * 60);
  if (minutes < 60) return `${minutes} min`;
  return minutes % 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes / 60} h`;
}

type ActivityKind = 'github' | 'strava';

interface KindConfig {
  file: string;
  title: string;
  source: string;
  logo: { src: string; alt: string; width: number; height: number };
  // How many contributions a unit of this activity counts as, for the shared scale.
  weight: number;
  total: { label: string; format: (sum: number) => string };
  peak: { label: string; format: (value: number) => string };
  format: (value: number) => string;
  none: string;
}

const KINDS: Record<ActivityKind, KindConfig> = {
  github: {
    file: 'contributions.json',
    title: 'Code',
    source: 'GitHub',
    // Official lockups, unaltered: GitHub's white logo and Strava's white "Powered by Strava" mark for dark backgrounds.
    logo: { src: '/images/brands/github.svg', alt: 'GitHub', width: 416, height: 95 },
    weight: 1,
    total: { label: 'Contributions', format: (sum) => sum.toLocaleString('en-US') },
    peak: { label: 'Busiest day', format: (count) => count.toLocaleString('en-US') },
    format: (count) => plural(count, 'contribution'),
    none: 'No contributions',
  },
  strava: {
    file: 'training.json',
    title: 'Training',
    source: 'Strava',
    logo: { src: '/images/brands/powered-by-strava.svg', alt: 'Powered by Strava', width: 365, height: 37 },
    weight: ACTIVITY.hourWeight,
    total: { label: 'Hours', format: (sum) => Math.round(sum).toLocaleString('en-US') },
    peak: { label: 'Longest day', format: formatHours },
    format: formatHours,
    none: 'No training',
  },
};

const isoDate = (time: number) => new Date(time).toISOString().slice(0, 10);

// Sunday-first weeks, like GitHub: the last column ends at `to`, the first starts on the Sunday a year before.
function weeksUntil(to: string): string[][] {
  const end = Date.parse(`${to}T00:00:00Z`);
  const start = end - (WEEKS - 1) * 7 * DAY_MS - new Date(end).getUTCDay() * DAY_MS;
  const weeks: string[][] = [];
  for (let time = start; time <= end; time += DAY_MS) {
    if (new Date(time).getUTCDay() === 0) weeks.push([]);
    weeks.at(-1)?.push(isoDate(time));
  }
  return weeks;
}

const EMPTY_WEEKS = Array.from({ length: WEEKS }, (_, column) => Array.from({ length: 7 }, (_, row) => `${column}-${row}`));

function levelOf(value: number, weight: number): number {
  return ACTIVITY.levels.filter((threshold) => value * weight >= threshold).length;
}

// A month is labelled above the first week that starts in it, skipping a partial first column.
function monthLabels(weeks: string[][]): { index: number; label: string }[] {
  return weeks.flatMap((week, index) =>
    index > 0 && index < weeks.length - 2 && week[0].slice(0, 7) !== weeks[index - 1][0].slice(0, 7)
      ? [{ index, label: formatDate(week[0], 'short').split(' ')[0] }]
      : [],
  );
}

export default function ActivityGraph({ kind }: { kind: ActivityKind }) {
  const config = KINDS[kind];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ActivityData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/data/${config.file}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
      .then((json: ActivityData) => !cancelled && setData(json))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [config.file]);

  // On narrow screens the graph scrolls sideways; start at the most recent weeks.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, [data]);

  const weeks = data ? weeksUntil(data.to) : null;
  const days = data && weeks ? weeks.flat().map((date) => ({ date, value: data.days[date] ?? 0 })) : [];
  const sum = days.reduce((total, day) => total + day.value, 0);
  const peak = days.reduce<{ date?: string; value: number }>((best, day) => (day.value > best.value ? day : best), { value: 0 });
  const titleId = `activity-${kind}`;

  return (
    <figure className="activity-graph" aria-labelledby={titleId} aria-busy={!data && !failed}>
      <header className="activity-graph__header">
        <h3 id={titleId}>{config.title}</h3>
        <img className={`activity-graph__logo activity-graph__logo--${kind}`} {...config.logo} />
      </header>
      <div className="activity-graph__scroller" ref={scrollerRef}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={
            data
              ? `${config.total.format(sum)} ${config.total.label.toLowerCase()} on ${config.source} between ${formatDate(days[0].date)} and ${formatDate(data.to)}`
              : `${config.title} on ${config.source}`
          }
        >
          {weeks &&
            monthLabels(weeks).map(({ index, label }) => (
              <text key={index} x={LABEL_WIDTH + index * STEP} y={10} className="activity-graph__label">
                {label}
              </text>
            ))}
          {DAY_LABELS.map(([weekday, label]) => (
            <text key={weekday} x={0} y={LABEL_HEIGHT + weekday * STEP + CELL - 1} className="activity-graph__label">
              {label}
            </text>
          ))}
          {(weeks ?? EMPTY_WEEKS).map((week, column) =>
            week.map((date, row) => {
              const value = data?.days[date] ?? 0;
              return (
                <rect
                  key={date}
                  x={LABEL_WIDTH + column * STEP}
                  y={LABEL_HEIGHT + (data ? new Date(`${date}T00:00:00Z`).getUTCDay() : row) * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  data-level={levelOf(value, config.weight)}
                >
                  {data && <title>{`${value ? config.format(value) : config.none} on ${formatDate(date)}`}</title>}
                </rect>
              );
            }),
          )}
        </svg>
      </div>
      <figcaption>
        {failed ? (
          <p className="activity-graph__note">The latest {config.source} data couldn’t be loaded.</p>
        ) : (
          <dl className="activity-graph__stats">
            <div>
              <dt>{config.total.label}</dt>
              <dd>{data ? config.total.format(sum) : '–'}</dd>
            </div>
            <div>
              <dt>Active days</dt>
              <dd>{data ? days.filter((day) => day.value > 0).length : '–'}</dd>
            </div>
            <div>
              <dt>{config.peak.label}</dt>
              <dd>
                {data && peak.date ? (
                  <>
                    {config.peak.format(peak.value)} <span>on {formatDate(peak.date, 'short')}</span>
                  </>
                ) : (
                  '–'
                )}
              </dd>
            </div>
          </dl>
        )}
        {data && (
          <span className="activity-graph__updated">
            Updated <time dateTime={data.updated}>{formatDate(data.updated.slice(0, 10), 'short')}</time>
          </span>
        )}
      </figcaption>
    </figure>
  );
}

// Both graphs share one scale, so one legend serves them.
export function ActivityLegend() {
  return (
    <p className="activity-legend" aria-hidden="true">
      Less
      {[0, 1, 2, 3, 4].map((level) => (
        <i key={level} data-level={level} />
      ))}
      More
    </p>
  );
}
