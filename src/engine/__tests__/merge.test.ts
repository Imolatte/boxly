import { describe, it, expect } from 'vitest';
import { doMerge, canMerge } from '../merge';
import type { GiftItem } from '../../types/gift';

describe('merge - valid scenarios', () => {
  it('part(1) + part(1) -> complete(1), xp=1', () => {
    const a: GiftItem = { kind: 'part', level: 1 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 1 });
    expect(r.xpGained).toBe(1);
  });

  it('part(5) + part(5) -> complete(5), xp=25', () => {
    const a: GiftItem = { kind: 'part', level: 5 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 5 });
    expect(r.xpGained).toBe(25);
  });

  it('part(3) + part(3) -> complete(3), xp=9', () => {
    const a: GiftItem = { kind: 'part', level: 3 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 3 });
    expect(r.xpGained).toBe(9);
  });

  it('part(6) + part(6) -> intermediate(6) stage=1, xp=6', () => {
    const a: GiftItem = { kind: 'part', level: 6 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'intermediate', level: 6, stage: 1 });
    expect(r.xpGained).toBe(6);
  });

  it('part(10) + part(10) -> intermediate(10) stage=1, xp=10', () => {
    const a: GiftItem = { kind: 'part', level: 10 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'intermediate', level: 10, stage: 1 });
    expect(r.xpGained).toBe(10);
  });

  it('part(8) + part(8) -> intermediate(8) stage=1, xp=8', () => {
    const a: GiftItem = { kind: 'part', level: 8 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'intermediate', level: 8, stage: 1 });
    expect(r.xpGained).toBe(8);
  });

  it('2 intermediate lvl 6 stage 1 -> complete(6), xp=36', () => {
    const a: GiftItem = { kind: 'intermediate', level: 6, stage: 1 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 6 });
    expect(r.xpGained).toBe(36);
  });

  it('2 intermediate lvl 7 stage 1 -> complete(7), xp=49', () => {
    const a: GiftItem = { kind: 'intermediate', level: 7, stage: 1 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 7 });
    expect(r.xpGained).toBe(49);
  });

  it('2 intermediate lvl 8 stage 1 -> intermediate lvl 8 stage 2, xp=8', () => {
    const a: GiftItem = { kind: 'intermediate', level: 8, stage: 1 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'intermediate', level: 8, stage: 2 });
    expect(r.xpGained).toBe(8);
  });

  it('2 intermediate lvl 10 stage 1 -> intermediate lvl 10 stage 2, xp=10', () => {
    const a: GiftItem = { kind: 'intermediate', level: 10, stage: 1 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'intermediate', level: 10, stage: 2 });
    expect(r.xpGained).toBe(10);
  });

  it('2 intermediate lvl 8 stage 2 -> complete(8), xp=64', () => {
    const a: GiftItem = { kind: 'intermediate', level: 8, stage: 2 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 8 });
    expect(r.xpGained).toBe(64);
  });

  it('2 intermediate lvl 10 stage 2 -> complete(10), xp=100', () => {
    const a: GiftItem = { kind: 'intermediate', level: 10, stage: 2 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 10 });
    expect(r.xpGained).toBe(100);
  });

  it('complete(3) + complete(3) -> complete(4), xp=32', () => {
    const a: GiftItem = { kind: 'complete', level: 3 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 4 });
    expect(r.xpGained).toBe(4 * 4 * 2); // 32
  });

  it('complete(9) + complete(9) -> complete(10), xp=200', () => {
    const a: GiftItem = { kind: 'complete', level: 9 };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toEqual({ kind: 'complete', level: 10 });
    expect(r.xpGained).toBe(10 * 10 * 2); // 200
  });

  it('complete(10) + complete(10) -> collectible, xp=500, energyBonus=10', () => {
    const a: GiftItem = { kind: 'complete', level: 10 };
    const r = doMerge(a, a, () => 0);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced?.kind).toBe('collectible');
    expect(r.xpGained).toBe(500);
    expect(r.energyBonus).toBe(10);
    expect(r.sideEffect).toBe('collectible_drop');
  });

  it('collectible(col_3) + collectible(col_3) -> null, xp=2000, energyBonus=50', () => {
    const a: GiftItem = { kind: 'collectible', id: 'col_3' };
    const r = doMerge(a, a);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.produced).toBeNull();
    expect(r.xpGained).toBe(2000);
    expect(r.energyBonus).toBe(50);
    expect(r.sideEffect).toBe('collectible_duplicate');
  });
});

describe('merge - invalid scenarios', () => {
  it('part + complete -> false', () => {
    const a: GiftItem = { kind: 'part', level: 1 };
    const b: GiftItem = { kind: 'complete', level: 1 };
    expect(canMerge(a, b)).toBe(false);
  });

  it('part + intermediate -> false', () => {
    const a: GiftItem = { kind: 'part', level: 6 };
    const b: GiftItem = { kind: 'intermediate', level: 6, stage: 1 };
    expect(canMerge(a, b)).toBe(false);
  });

  it('different level parts -> false', () => {
    const a: GiftItem = { kind: 'part', level: 1 };
    const b: GiftItem = { kind: 'part', level: 2 };
    expect(canMerge(a, b)).toBe(false);
  });

  it('different level intermediates -> false', () => {
    const a: GiftItem = { kind: 'intermediate', level: 6, stage: 1 };
    const b: GiftItem = { kind: 'intermediate', level: 7, stage: 1 };
    expect(canMerge(a, b)).toBe(false);
  });

  it('same level different stage intermediates -> false', () => {
    const a: GiftItem = { kind: 'intermediate', level: 8, stage: 1 };
    const b: GiftItem = { kind: 'intermediate', level: 8, stage: 2 };
    expect(canMerge(a, b)).toBe(false);
  });

  it('different collectible ids -> false', () => {
    const a: GiftItem = { kind: 'collectible', id: 'col_1' };
    const b: GiftItem = { kind: 'collectible', id: 'col_2' };
    expect(canMerge(a, b)).toBe(false);
  });

  it('complete(10) + complete(9) -> false', () => {
    const a: GiftItem = { kind: 'complete', level: 10 };
    const b: GiftItem = { kind: 'complete', level: 9 };
    expect(canMerge(a, b)).toBe(false);
  });

  it('collectible + complete -> false', () => {
    const a: GiftItem = { kind: 'collectible', id: 'col_1' };
    const b: GiftItem = { kind: 'complete', level: 10 };
    expect(canMerge(a, b)).toBe(false);
  });
});
