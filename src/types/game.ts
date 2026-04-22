import type { Board } from './board';
import type { PlayerState } from './player';
import type { RouletteReward } from './events';

export interface GameState {
  board: Board;
  player: PlayerState;
  meta: {
    version: number;
    createdAt: number;
    lastPlayedAt: number;
  };
  ui: {
    selectedCellId: string | null;
    activeRoulette: RouletteReward | null;
    pendingLevelUp: number | null;
    levelUp: { level: number; energyBonus: number; capBonus: number } | null;
    fx: Array<{ id: string; type: 'merge' | 'sell'; cellIdx: number }>;
    onboardingStep: number;
    soundEnabled: boolean;
  };
}
