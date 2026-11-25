import type { ComponentType } from 'react';
import { CaesarsPoems, CoffeeSniffer, Emus, SlowMarathon, TrainCyclists, TugOfWar } from './doors01to06';
import { DancingPlague, MoneyDoesNotStink, MoonGolf, MooseAtDinner, TennisScoreboard, TwoBalls } from './doors07to12';
import { ArtOlympics, CarMarathon, FallingLords, LastThenFirst, OneMoreSoldier, RatsOnTrial } from './doors13to18';
import { ChristmasMatch, CorporalBear, FirstBikeBan, NapoleonsRabbits, PeachBasket, PicklesTheDog } from './doors19to24';

// In the order of the doors, like the facts.
const DRAWINGS: ComponentType[] = [
  Emus,
  SlowMarathon,
  CoffeeSniffer,
  TrainCyclists,
  CaesarsPoems,
  TugOfWar,
  MooseAtDinner,
  TennisScoreboard,
  MoneyDoesNotStink,
  MoonGolf,
  DancingPlague,
  TwoBalls,
  FallingLords,
  ArtOlympics,
  OneMoreSoldier,
  LastThenFirst,
  RatsOnTrial,
  CarMarathon,
  NapoleonsRabbits,
  PicklesTheDog,
  FirstBikeBan,
  PeachBasket,
  CorporalBear,
  ChristmasMatch,
];

// The story behind a door, for those who can't read it yet.
export default function Drawing({ day }: { day: number }) {
  const Story = DRAWINGS[day - 1]!;
  return <Story />;
}
