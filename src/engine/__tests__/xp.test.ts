import { describe, it, expect } from 'vitest';
import { applyXp, totalXpToReach } from '../xp';
import type { PlayerState } from '../../types/player';

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    level: 1,
    xp: 0,
    xpTotal: 0,
    energy: 100,
    energyCap: 100,
    energyUpdatedAt: 0,
    collection: {},
    ...overrides,
  };
}

describe('totalXpToReach', () => {
  it('totalXpToReach(2) = 400', () => expect(totalXpToReach(2)).toBe(400));
  it('totalXpToReach(5) = 2500', () => expect(totalXpToReach(5)).toBe(2500));
  it('totalXpToReach(10) = 10000', () => expect(totalXpToReach(10)).toBe(10000));
});

describe('applyXp - single level up', () => {
  it('adding 400xp from lvl1 -> lvl2', () => {
    const p = makePlayer({ level: 1, xpTotal: 0 });
    const { player, leveledUpTo } = applyXp(p, 400);
    expect(player.level).toBe(2);
    expect(leveledUpTo).toEqual([2]);
    expect(player.xpTotal).toBe(400);
    // energyBonus = LEVEL_UP_ENERGY(2) = 30
    expect(player.energy).toBe(100 + 30);
    // capBonus = ENERGY_CAP_PER_LEVEL = 10
    expect(player.energyCap).toBe(100 + 10);
  });
});

describe('applyXp - multiple level ups', () => {
  it('xpTotal=15000 from lvl1 -> lvl12', () => {
    const p = makePlayer({ level: 1, xpTotal: 0 });
    // totalXpToReach(12) = 144*100 = 14400, totalXpToReach(13) = 169*100 = 16900
    const { player, leveledUpTo } = applyXp(p, 15000);
    expect(player.level).toBe(12);
    expect(leveledUpTo).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(player.xpTotal).toBe(15000);
  });

  it('energy can exceed cap on multi-level up', () => {
    const p = makePlayer({ level: 1, xpTotal: 0, energy: 90, energyCap: 100 });
    const { player } = applyXp(p, 400);
    // lvl2 bonus = +30 energy -> 120 > cap=110
    expect(player.energy).toBeGreaterThan(player.energyCap);
  });
});

describe('applyXp - no level up', () => {
  it('small xp gain below threshold', () => {
    const p = makePlayer({ level: 1, xpTotal: 0 });
    const { player, leveledUpTo } = applyXp(p, 10);
    expect(player.level).toBe(1);
    expect(leveledUpTo).toEqual([]);
    expect(player.xpTotal).toBe(10);
  });
});
