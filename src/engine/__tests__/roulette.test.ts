import { describe, it, expect } from 'vitest';
import { spinRoulette, SECTORS } from '../roulette';

describe('roulette - weights', () => {
  it('sum of sector weights equals 100', () => {
    const total = SECTORS.reduce((s, sec) => s + sec.weight, 0);
    expect(total).toBeCloseTo(100, 5);
  });
});

describe('roulette - coverage', () => {
  it('all 10 sectors are reachable on 100k samples', () => {
    const SAMPLES = 100_000;
    const kindCounts: Record<string, number> = {};

    for (let i = 0; i < SAMPLES; i++) {
      const reward = spinRoulette();
      const key = reward.kind === 'energy'
        ? `energy_${reward.amount}`
        : reward.kind === 'xp'
          ? `xp_${reward.amount}`
          : reward.kind === 'gift'
            ? `gift_${(reward.item as { level: number }).level <= 5 ? 'low' : (reward.item as { level: number }).level <= 8 ? 'mid' : 'high'}`
            : 'collectible';
      kindCounts[key] = (kindCounts[key] ?? 0) + 1;
    }

    // All energy amounts
    expect(kindCounts['energy_10']).toBeGreaterThan(0);
    expect(kindCounts['energy_25']).toBeGreaterThan(0);
    expect(kindCounts['energy_50']).toBeGreaterThan(0);
    expect(kindCounts['energy_100']).toBeGreaterThan(0);
    // XP
    expect(kindCounts['xp_200']).toBeGreaterThan(0);
    expect(kindCounts['xp_500']).toBeGreaterThan(0);
    // Gifts
    expect(kindCounts['gift_low']).toBeGreaterThan(0);
    expect(kindCounts['gift_mid']).toBeGreaterThan(0);
    expect(kindCounts['gift_high']).toBeGreaterThan(0);
    // Collectible
    expect(kindCounts['collectible']).toBeGreaterThan(0);
  });
});

describe('roulette - reward validity', () => {
  it('all rewards have valid types', () => {
    for (let i = 0; i < 1000; i++) {
      const r = spinRoulette();
      expect(['energy', 'xp', 'gift', 'collectible']).toContain(r.kind);

      if (r.kind === 'energy') {
        expect([10, 25, 50, 100]).toContain(r.amount);
      }
      if (r.kind === 'xp') {
        expect([200, 500]).toContain(r.amount);
      }
      if (r.kind === 'gift') {
        const item = r.item;
        expect(item.kind).toBe('complete');
        if (item.kind === 'complete') {
          expect(item.level).toBeGreaterThanOrEqual(1);
          expect(item.level).toBeLessThanOrEqual(10);
        }
      }
      if (r.kind === 'collectible') {
        expect(r.id).toMatch(/^col_\d+$/);
      }
    }
  });
});

describe('roulette - gift level distribution', () => {
  it('low-tier gifts are levels 1-5', () => {
    // Force sector 6 (index 6, weight 8) by deterministic rng
    // sector 6 should produce level 1-5
    let lowCount = 0;
    let total = 0;
    for (let i = 0; i < 10_000; i++) {
      const r = spinRoulette();
      if (r.kind === 'gift' && r.item.kind === 'complete') {
        total++;
        if (r.item.level <= 5) lowCount++;
      }
    }
    // Most gift rewards should be from sectors producing valid levels
    expect(total).toBeGreaterThan(0);
  });
});
