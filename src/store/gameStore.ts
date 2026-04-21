import { create } from 'zustand';
import type { GameState } from '../types/game';
import type { Board, BoardCell } from '../types/board';
import type { PlayerState } from '../types/player';
import type { RouletteReward } from '../types/events';
import { BOARD_W, BOARD_H, ENERGY_START_CAP, CREATE_COST, LEVEL_UP_ENERGY } from '../config/balance';
import { computeRegenSince } from '../engine/energy';
import { applyXp } from '../engine/xp';
import { dropPart } from '../engine/dropPart';
import { canMerge, doMerge } from '../engine/merge';
import { sellValue } from '../engine/sell';
import { loadSave, debouncedSave, clearSave } from './persistence';
import { useToastStore } from './toastStore';
import { impact, notification } from '../telegram/haptics';
import { sfx } from '../audio/sfx';

function makeEmptyBoard(): Board {
  const cells: BoardCell[] = [];
  let id = 0;
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      cells.push({ id: `cell_${id++}`, coord: { x, y }, item: null });
    }
  }
  return cells;
}

function makeDefaultPlayer(): PlayerState {
  return {
    level: 1,
    xp: 0,
    xpTotal: 0,
    energy: ENERGY_START_CAP,
    energyCap: ENERGY_START_CAP,
    energyUpdatedAt: Date.now(),
    collection: {},
  };
}

function makeDefaultState(): GameState {
  return {
    board: makeEmptyBoard(),
    player: makeDefaultPlayer(),
    meta: { version: 1, createdAt: Date.now(), lastPlayedAt: Date.now() },
    ui: { selectedCellId: null, activeRoulette: null, pendingLevelUp: null, levelUp: null, fx: [], onboardingStep: 0, soundEnabled: true },
  };
}

function countEmpty(board: Board): number {
  return board.filter((c) => c.item === null).length;
}

function describeReward(reward: RouletteReward): string {
  if (reward.kind === 'energy') return `+${reward.amount} ⚡`;
  if (reward.kind === 'xp') return `+${reward.amount} XP`;
  if (reward.kind === 'gift') return `Подарок C${reward.item.kind === 'complete' ? reward.item.level : '?'}`;
  if (reward.kind === 'collectible') return `Коллекционка K${reward.id.replace('col_', '')}`;
  return 'Неизвестная награда';
}

interface GameActions {
  create: () => void;
  tryMerge: (fromId: string, toId: string) => void;
  selectCell: (id: string) => void;
  clearSelection: () => void;
  sellSelected: () => void;
  resetProgress: () => void;
  tickEnergyRegen: () => void;
  applyRouletteReward: (reward: RouletteReward) => void;
  pushFx: (type: 'merge' | 'sell', cellIdx: number) => void;
  removeFx: (id: string) => void;
  showLevelUp: (level: number, energyBonus: number) => void;
  dismissLevelUp: () => void;
  advanceOnboarding: () => void;
  toggleSound: () => void;
}

type GameStore = GameState & GameActions;

const toast = () => useToastStore.getState();

export const useGameStore = create<GameStore>((set, get) => ({
  ...makeDefaultState(),

  tickEnergyRegen() {
    const { player } = get();
    const now = Date.now();
    const regen = computeRegenSince(now, player);
    if (regen.energy !== player.energy || regen.energyUpdatedAt !== player.energyUpdatedAt) {
      set((s) => ({ player: { ...s.player, ...regen } }));
    }
  },

  create() {
    const { player, board } = get();
    const now = Date.now();

    const regen = computeRegenSince(now, player);
    const regenedPlayer = { ...player, ...regen };

    const empty = countEmpty(board);

    if (regenedPlayer.energy < CREATE_COST || empty === 0) return;

    const chargedPlayer: PlayerState = {
      ...regenedPlayer,
      energy: regenedPlayer.energy - CREATE_COST,
      energyUpdatedAt: now,
    };

    const result = dropPart(board);
    const { part, placedAt, rouletteTriggered, rouletteReward } = result;

    let newBoard = board;
    if (placedAt !== null) {
      newBoard = board.map((c) =>
        c.coord.x === placedAt.x && c.coord.y === placedAt.y ? { ...c, item: part } : c,
      );
    }

    let finalPlayer = chargedPlayer;

    if (rouletteTriggered && rouletteReward) {
      const emptyAfterDrop = countEmpty(newBoard);

      if ((rouletteReward.kind === 'gift' || rouletteReward.kind === 'collectible') && emptyAfterDrop === 0) {
        toast().push('Поле полное — награду конвертировали в +50 ⚡', 'info');
        finalPlayer = { ...finalPlayer, energy: finalPlayer.energy + 50 };
      } else if (rouletteReward.kind === 'energy') {
        // Open roulette modal via ui state
        finalPlayer = { ...finalPlayer, energy: finalPlayer.energy + rouletteReward.amount };
        set((s) => ({ ui: { ...s.ui, activeRoulette: rouletteReward } }));
      } else if (rouletteReward.kind === 'xp') {
        const { player: xpPlayer, leveledUpTo } = applyXp(finalPlayer, rouletteReward.amount);
        finalPlayer = xpPlayer;
        set((s) => ({ ui: { ...s.ui, activeRoulette: rouletteReward } }));
        if (leveledUpTo.length > 0) {
          const last = leveledUpTo[leveledUpTo.length - 1];
          const bonus = leveledUpTo.reduce((s, lv) => s + LEVEL_UP_ENERGY(lv), 0);
          get().showLevelUp(last, bonus);
        }
      } else if (rouletteReward.kind === 'gift') {
        set((s) => ({ ui: { ...s.ui, activeRoulette: rouletteReward } }));
        const giftEmptyIdx = newBoard.findIndex((c) => c.item === null);
        if (giftEmptyIdx !== -1) {
          newBoard = newBoard.map((c, i) =>
            i === giftEmptyIdx ? { ...c, item: rouletteReward.item } : c,
          );
        }
      } else if (rouletteReward.kind === 'collectible') {
        set((s) => ({ ui: { ...s.ui, activeRoulette: rouletteReward } }));
        const colEmptyIdx = newBoard.findIndex((c) => c.item === null);
        if (colEmptyIdx !== -1) {
          newBoard = newBoard.map((c, i) =>
            i === colEmptyIdx ? { ...c, item: { kind: 'collectible', id: rouletteReward.id } } : c,
          );
        }
      }
    }

    const newMeta = { ...get().meta, lastPlayedAt: now };

    set((s) => ({ board: newBoard, player: finalPlayer, meta: newMeta, ui: { ...s.ui } }));

    debouncedSave({ v: 1, board: newBoard, player: finalPlayer, meta: newMeta });
  },

  tryMerge(fromId, toId) {
    if (fromId === toId) return;

    const { board, player } = get();
    const fromCell = board.find((c) => c.id === fromId);
    const toCell = board.find((c) => c.id === toId);

    if (!fromCell || !toCell) return;

    let newBoard = board;
    let newPlayer = player;

    if (toCell.item === null || !fromCell.item || !canMerge(fromCell.item, toCell.item)) {
      newBoard = board.map((c) => {
        if (c.id === fromId) return { ...c, item: toCell.item };
        if (c.id === toId) return { ...c, item: fromCell.item };
        return c;
      });
    } else if (fromCell.item && toCell.item && canMerge(fromCell.item, toCell.item)) {
      const mergeResult = doMerge(fromCell.item, toCell.item);
      if (!mergeResult.ok) return;

      const { produced, xpGained, energyBonus, sideEffect } = mergeResult;

      newBoard = board.map((c) => {
        if (c.id === fromId) return { ...c, item: null };
        if (c.id === toId) return { ...c, item: produced };
        return c;
      });

      const { player: xpPlayer, leveledUpTo } = applyXp(player, xpGained);
      newPlayer = xpPlayer;

      if (energyBonus) {
        newPlayer = { ...newPlayer, energy: newPlayer.energy + energyBonus };
      }

      if (leveledUpTo.length > 0) {
        const last = leveledUpTo[leveledUpTo.length - 1];
        const bonus = leveledUpTo.reduce((s, lv) => s + LEVEL_UP_ENERGY(lv), 0);
        get().showLevelUp(last, bonus);
      }

      impact('medium');

      const toCellIdx = newBoard.findIndex((c) => c.id === toId);
      if (toCellIdx !== -1) get().pushFx('merge', toCellIdx);

      if (sideEffect === 'collectible_drop' && produced?.kind === 'collectible') {
        sfx.collectible();
        const num = produced.id.replace('col_', '');
        toast().push(`Новая коллекционка K${num}! +10 ⚡`, 'reward');
        notification('success');

        // Update collection count
        const colId = produced.id as keyof typeof newPlayer.collection;
        const prevCount = newPlayer.collection[colId] ?? 0;
        newPlayer = {
          ...newPlayer,
          collection: { ...newPlayer.collection, [colId]: prevCount + 1 },
        };
      } else if (sideEffect === 'collectible_duplicate') {
        sfx.collectible();
        toast().push('Дубликат! +50 ⚡ +2000 XP', 'reward');
        notification('success');
      } else {
        sfx.merge();
      }
    }

    const now = Date.now();
    const newMeta = { ...get().meta, lastPlayedAt: now };

    set({ board: newBoard, player: newPlayer, meta: newMeta, ui: { ...get().ui, selectedCellId: null } });
    debouncedSave({ v: 1, board: newBoard, player: newPlayer, meta: newMeta });
  },

  selectCell(id) {
    const current = get().ui.selectedCellId;
    set((s) => ({ ui: { ...s.ui, selectedCellId: current === id ? null : id } }));
  },

  clearSelection() {
    set((s) => ({ ui: { ...s.ui, selectedCellId: null } }));
  },

  sellSelected() {
    const { board, player, ui } = get();
    if (!ui.selectedCellId) return;

    const cell = board.find((c) => c.id === ui.selectedCellId);
    if (!cell?.item) return;

    const value = sellValue(cell.item);
    if (value === null) return;

    const sellCellIdx = board.findIndex((c) => c.id === ui.selectedCellId);
    if (sellCellIdx !== -1) get().pushFx('sell', sellCellIdx);

    const newBoard = board.map((c) => (c.id === ui.selectedCellId ? { ...c, item: null } : c));
    const newPlayer = { ...player, energy: player.energy + value };
    const now = Date.now();
    const newMeta = { ...get().meta, lastPlayedAt: now };

    set({ board: newBoard, player: newPlayer, meta: newMeta, ui: { ...get().ui, selectedCellId: null } });
    debouncedSave({ v: 1, board: newBoard, player: newPlayer, meta: newMeta });
  },

  resetProgress() {
    void clearSave();
    set(makeDefaultState());
  },

  pushFx(type, cellIdx) {
    const id = `fx_${Date.now()}_${Math.random()}`;
    set((s) => ({ ui: { ...s.ui, fx: [...s.ui.fx, { id, type, cellIdx }] } }));
    setTimeout(() => {
      get().removeFx(id);
    }, 500);
  },

  removeFx(id) {
    set((s) => ({ ui: { ...s.ui, fx: s.ui.fx.filter((f) => f.id !== id) } }));
  },

  applyRouletteReward(reward) {
    const { board, player } = get();
    const empty = countEmpty(board);

    if ((reward.kind === 'gift' || reward.kind === 'collectible') && empty === 0) {
      toast().push('Поле полное — награду конвертировали в +50 ⚡', 'info');
      set({ player: { ...player, energy: player.energy + 50 } });
      return;
    }

    if (reward.kind === 'energy') {
      set({ player: { ...player, energy: player.energy + reward.amount } });
    } else if (reward.kind === 'xp') {
      const { player: updated } = applyXp(player, reward.amount);
      set({ player: updated });
    }
  },

  showLevelUp(level, energyBonus) {
    notification('success');
    set((s) => ({ ui: { ...s.ui, levelUp: { level, energyBonus } } }));
  },

  dismissLevelUp() {
    set((s) => ({ ui: { ...s.ui, levelUp: null } }));
  },

  advanceOnboarding() {
    set((s) => ({
      ui: { ...s.ui, onboardingStep: s.ui.onboardingStep + 1 },
    }));
  },

  toggleSound() {
    set((s) => ({
      ui: { ...s.ui, soundEnabled: !s.ui.soundEnabled },
    }));
  },
}));

export function describeRouletteReward(reward: RouletteReward): string {
  return describeReward(reward);
}

export async function initializeGameStore(): Promise<void> {
  const saved = await loadSave();
  if (saved) {
    useGameStore.setState({
      board: saved.board,
      player: saved.player,
      meta: saved.meta,
    });
  }
}
