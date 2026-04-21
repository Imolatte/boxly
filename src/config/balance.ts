export const BOARD_W = 5;
export const BOARD_H = 5;

export const ENERGY_START_CAP = 100;
export const ENERGY_REGEN_MS = 4 * 60 * 1000;
export const ENERGY_CAP_PER_LEVEL = 10;
export const CREATE_COST = 1;

export const PART_WEIGHTS = [
  { value: 1, weight: 35 },
  { value: 2, weight: 22 },
  { value: 3, weight: 15 },
  { value: 4, weight: 10 },
  { value: 5, weight: 7 },
  { value: 6, weight: 5 },
  { value: 7, weight: 3 },
  { value: 8, weight: 2 },
  { value: 9, weight: 0.8 },
  { value: 10, weight: 0.2 },
] as const;

export const ROULETTE_PROB_PER_CREATE = 0.02;

export const totalXpToReach = (n: number): number => n * n * 100;

export const LEVEL_UP_ENERGY = (n: number): number => n * 15;

export const LEVEL_UP_CAP_BONUS = 10;
