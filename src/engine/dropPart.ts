import type { Board, Coord } from '../types/board';
import type { GiftItem } from '../types/gift';
import type { RouletteReward } from '../types/events';
import type { GiftLevel } from '../types/gift';
import { PART_WEIGHTS, ROULETTE_PROB_PER_CREATE } from '../config/balance';
import { weightedPick } from './weightedPick';
import { spinRoulette } from './roulette';

export interface DropResult {
  part: GiftItem;
  placedAt: Coord | null;
  rouletteTriggered: boolean;
  rouletteReward?: RouletteReward;
}

export function dropPart(board: Board, rnd = Math.random): DropResult {
  const level = weightedPick(PART_WEIGHTS as unknown as Array<{ value: number; weight: number }>, rnd) as GiftLevel;
  const part: GiftItem = { kind: 'part', level };

  const emptyIdx = board.findIndex((c) => c.item === null);
  const placedAt = emptyIdx === -1 ? null : board[emptyIdx].coord;

  const rouletteTriggered = rnd() < ROULETTE_PROB_PER_CREATE;
  const rouletteReward = rouletteTriggered ? spinRoulette(rnd) : undefined;

  return { part, placedAt, rouletteTriggered, rouletteReward };
}
