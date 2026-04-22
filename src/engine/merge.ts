import type { GiftItem, CollectibleId, GiftLevel } from '../types/gift';
import { COLLECTIBLE_IDS } from '../config/collectibles';

export type MergeSuccess = {
  ok: true;
  produced: GiftItem | null;
  xpGained: number;
  energyBonus?: number;
  sideEffect?: 'collectible_drop' | 'collectible_duplicate';
};

type MergeResult = { ok: false } | MergeSuccess;

export function canMerge(a: GiftItem, b: GiftItem): boolean {
  return doMerge(a, b).ok;
}

export function doMerge(a: GiftItem, b: GiftItem, rnd = Math.random): MergeResult {
  // Scenario 1 & 2: part + part same level
  if (a.kind === 'part' && b.kind === 'part') {
    if (a.level !== b.level) return { ok: false };
    const L = a.level;
    if (L <= 5) {
      return {
        ok: true,
        produced: { kind: 'complete', level: L },
        xpGained: L * L,
      };
    } else {
      // L >= 6: produce intermediate stage=1
      const level = L as 6 | 7 | 8 | 9 | 10;
      return {
        ok: true,
        produced: { kind: 'intermediate', level, stage: 1 },
        xpGained: L,
      };
    }
  }

  // Scenario 3: intermediate + intermediate same level & same stage
  if (a.kind === 'intermediate' && b.kind === 'intermediate') {
    if (a.level !== b.level) return { ok: false };
    if (a.stage !== b.stage) return { ok: false };
    const L = a.level;
    const stage = a.stage;

    if (stage === 1) {
      // lvl 6-7: stage 1 -> complete
      if (L <= 7) {
        return {
          ok: true,
          produced: { kind: 'complete', level: L as GiftLevel },
          xpGained: L * L,
        };
      }
      // lvl 8-10: stage 1 -> stage 2
      return {
        ok: true,
        produced: { kind: 'intermediate', level: L, stage: 2 },
        xpGained: L,
      };
    }

    // stage === 2 (only valid for lvl 8-10) -> complete
    return {
      ok: true,
      produced: { kind: 'complete', level: L as GiftLevel },
      xpGained: L * L,
    };
  }

  // Scenario 4 & 5: complete + complete same level
  if (a.kind === 'complete' && b.kind === 'complete') {
    if (a.level !== b.level) return { ok: false };
    const L = a.level;
    if (L < 10) {
      const nextLevel = (L + 1) as GiftLevel;
      return {
        ok: true,
        produced: { kind: 'complete', level: nextLevel },
        xpGained: nextLevel * nextLevel * 2,
      };
    } else {
      // Scenario 5: complete(10) + complete(10) -> random collectible
      const idx = Math.floor(rnd() * COLLECTIBLE_IDS.length);
      const id = COLLECTIBLE_IDS[idx] as CollectibleId;
      return {
        ok: true,
        produced: { kind: 'collectible', id },
        xpGained: 500,
        energyBonus: 10,
        sideEffect: 'collectible_drop',
      };
    }
  }

  // Scenario 6: collectible + collectible same id
  if (a.kind === 'collectible' && b.kind === 'collectible') {
    if (a.id !== b.id) return { ok: false };
    return {
      ok: true,
      produced: null,
      xpGained: 2000,
      energyBonus: 50,
      sideEffect: 'collectible_duplicate',
    };
  }

  return { ok: false };
}
