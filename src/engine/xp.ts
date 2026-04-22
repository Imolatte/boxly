import type { PlayerState } from '../types/player';
import { totalXpToReach, LEVEL_UP_ENERGY, LEVEL_UP_CAP_BONUS } from '../config/balance';

export { totalXpToReach };

export interface ApplyXpResult {
  player: PlayerState;
  leveledUpTo: number[];
}

export function applyXp(p: PlayerState, add: number): ApplyXpResult {
  const newXpTotal = p.xpTotal + add;
  let level = p.level;
  const leveledUpTo: number[] = [];

  while (newXpTotal >= totalXpToReach(level + 1)) {
    level++;
    leveledUpTo.push(level);
  }

  const energyBonus = leveledUpTo.reduce((s, lv) => s + LEVEL_UP_ENERGY(lv), 0);
  const capBonus = leveledUpTo.length * LEVEL_UP_CAP_BONUS;
  const newCap = p.energyCap + capBonus;

  return {
    player: {
      ...p,
      level,
      xpTotal: newXpTotal,
      xp: newXpTotal,
      energyCap: newCap,
      energy: Math.min(newCap, p.energy + energyBonus),
    },
    leveledUpTo,
  };
}
