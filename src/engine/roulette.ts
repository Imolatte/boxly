import type { RouletteReward } from '../types/events';
import type { CollectibleId, GiftLevel } from '../types/gift';
import { COLLECTIBLE_IDS } from '../config/collectibles';
import { weightedPick } from './weightedPick';

interface Sector {
  weight: number;
  make: (rnd: () => number) => RouletteReward;
}

const SECTORS: Sector[] = [
  { weight: 30, make: () => ({ kind: 'energy', amount: 10 as const }) },
  { weight: 22, make: () => ({ kind: 'energy', amount: 25 as const }) },
  { weight: 13, make: () => ({ kind: 'energy', amount: 50 as const }) },
  { weight: 6, make: () => ({ kind: 'energy', amount: 100 as const }) },
  { weight: 10, make: () => ({ kind: 'xp', amount: 200 as const }) },
  { weight: 5, make: () => ({ kind: 'xp', amount: 500 as const }) },
  {
    weight: 8,
    make: (rnd) => {
      const level = weightedPick(
        [
          { value: 1, weight: 40 },
          { value: 2, weight: 30 },
          { value: 3, weight: 20 },
          { value: 4, weight: 7 },
          { value: 5, weight: 3 },
        ],
        rnd,
      ) as GiftLevel;
      return { kind: 'gift', item: { kind: 'complete', level } };
    },
  },
  {
    weight: 4,
    make: (rnd) => {
      const level = weightedPick(
        [
          { value: 6, weight: 40 },
          { value: 7, weight: 35 },
          { value: 8, weight: 25 },
        ],
        rnd,
      ) as GiftLevel;
      return { kind: 'gift', item: { kind: 'complete', level } };
    },
  },
  {
    weight: 1.5,
    make: (rnd) => {
      const level = weightedPick(
        [
          { value: 9, weight: 70 },
          { value: 10, weight: 30 },
        ],
        rnd,
      ) as GiftLevel;
      return { kind: 'gift', item: { kind: 'complete', level } };
    },
  },
  {
    weight: 0.5,
    make: (rnd) => {
      const idx = Math.floor(rnd() * COLLECTIBLE_IDS.length);
      const id = COLLECTIBLE_IDS[idx] as CollectibleId;
      return { kind: 'collectible', id };
    },
  },
];

export function spinRoulette(rnd = Math.random): RouletteReward {
  const sectorIndex = weightedPick(
    SECTORS.map((s, i) => ({ value: i, weight: s.weight })),
    rnd,
  );
  return SECTORS[sectorIndex].make(rnd);
}

export { SECTORS };
