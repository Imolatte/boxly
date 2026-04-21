import { describe, it, expect } from 'vitest';
import { computeRegenSince } from '../energy';
import { ENERGY_REGEN_MS } from '../../config/balance';
import type { PlayerState } from '../../types/player';

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    level: 1,
    xp: 0,
    xpTotal: 0,
    energy: 50,
    energyCap: 100,
    energyUpdatedAt: 0,
    collection: {},
    ...overrides,
  };
}

describe('computeRegenSince', () => {
  it('after exactly ENERGY_REGEN_MS -> +1 energy, updatedAt shifted', () => {
    const p = makePlayer({ energy: 50, energyCap: 100, energyUpdatedAt: 0 });
    const now = ENERGY_REGEN_MS;
    const result = computeRegenSince(now, p);
    expect(result.energy).toBe(51);
    expect(result.energyUpdatedAt).toBe(ENERGY_REGEN_MS);
  });

  it('after 3.5 ticks -> +3 energy, leftover 0.5 tick preserved', () => {
    const p = makePlayer({ energy: 50, energyCap: 100, energyUpdatedAt: 0 });
    const now = Math.floor(3.5 * ENERGY_REGEN_MS);
    const result = computeRegenSince(now, p);
    expect(result.energy).toBe(53);
    // updatedAt should be 3 * ENERGY_REGEN_MS (not 3.5)
    expect(result.energyUpdatedAt).toBe(3 * ENERGY_REGEN_MS);
  });

  it('when energy === cap -> energyUpdatedAt reset to now', () => {
    const p = makePlayer({ energy: 100, energyCap: 100, energyUpdatedAt: 0 });
    const now = ENERGY_REGEN_MS * 5;
    const result = computeRegenSince(now, p);
    expect(result.energy).toBe(100);
    expect(result.energyUpdatedAt).toBe(now);
  });

  it('does not exceed energyCap', () => {
    const p = makePlayer({ energy: 99, energyCap: 100, energyUpdatedAt: 0 });
    const now = ENERGY_REGEN_MS * 10;
    const result = computeRegenSince(now, p);
    expect(result.energy).toBe(100);
    expect(result.energy).not.toBeGreaterThan(p.energyCap);
  });

  it('less than one tick -> no change', () => {
    const p = makePlayer({ energy: 50, energyCap: 100, energyUpdatedAt: 0 });
    const now = ENERGY_REGEN_MS - 1;
    const result = computeRegenSince(now, p);
    expect(result.energy).toBe(50);
    expect(result.energyUpdatedAt).toBe(0);
  });
});
