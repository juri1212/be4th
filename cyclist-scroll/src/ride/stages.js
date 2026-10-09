import { FINISH_X, segmentStats } from './route';

const STAGE_DEFINITIONS = [
  {
    title: 'Netherlands → Bocholt',
    region: 'Lowlands',
    place: 'Gelderland · Münsterland',
    from: 0,
    to: 3900,
    anchor: 2100,
    text: 'Start on the open lanes west of Bocholt: straight horizons, canals, windmills, brick villages, and a tailwind that feels almost suspiciously generous.',
  },
  {
    title: 'Stuttgart’s rolling climbs',
    region: 'Swabia',
    place: 'Baden-Württemberg',
    from: 3900,
    to: 7400,
    anchor: 5900,
    text: 'The flatlands give way to wooded slopes and vineyards around Stuttgart. The roads tighten, the city peeks through, and every ridge earns its view.',
  },
  {
    title: 'Mont Ventoux',
    region: 'Provence',
    place: 'Bédoin → Summit',
    from: 7400,
    to: 10800,
    anchor: 9600,
    text: 'Then comes Provence’s giant: forest on the lower slopes, exposed limestone near the summit, and the unmistakable silhouette of the weather station above.',
  },
  {
    title: 'Alpe d’Huez',
    region: 'Isère',
    place: '21 hairpins',
    from: 10800,
    to: 13700,
    anchor: 13700,
    text: 'Finish high in the Alps, tracing the famous switchbacks beneath sharp peaks. Each bend is a small promise that the next one is closer to the top.',
  },
  {
    title: 'Across every landscape',
    region: 'High road',
    place: 'Col de Sarenne',
    from: 13700,
    to: 14900,
    anchor: 14900,
    text: 'The scenery changes, but the rhythm stays the same: road, breath, wheels, horizon.',
  },
  {
    title: 'The descent',
    region: 'Descent',
    place: 'Romanche valley',
    from: 14900,
    to: 16100,
    anchor: 15550,
    text: 'After the climbing comes the reward — smooth corners, cold air, and the quiet hum of tires carrying you home.',
  },
  {
    title: 'Finishing strong',
    region: 'Finale',
    place: 'Bourg d’Oisans',
    from: 16100,
    to: FINISH_X,
    anchor: 16750,
    text: 'Your favourite roads live in the legs long after the ride ends: local loops, city climbs, and the mountains that keep calling you back.',
  },
];

export const STAGES = STAGE_DEFINITIONS.map((stage, index) => ({
  ...stage,
  number: String(index + 1).padStart(2, '0'),
  stats: segmentStats(stage.from, stage.to),
}));

export const TOTALS = segmentStats(0, FINISH_X);

export function stageIndexAt(x) {
  const index = STAGES.findIndex((stage) => x <= stage.to);
  return index === -1 ? STAGES.length - 1 : index;
}
