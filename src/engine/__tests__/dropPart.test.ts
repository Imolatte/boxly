import { describe, it, expect } from 'vitest';
import { dropPart } from '../dropPart';
import type { Board, BoardCell } from '../../types/board';
import { BOARD_W, BOARD_H } from '../../config/balance';

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

function makeFullBoard(): Board {
  return makeEmptyBoard().map((c) => ({ ...c, item: { kind: 'part' as const, level: 1 as const } }));
}

describe('dropPart - distribution', () => {
  it('distribution close to weights on 100k samples (tolerance ±2%)', () => {
    const SAMPLES = 100_000;
    const counts: Record<number, number> = {};
    const board = makeEmptyBoard();

    for (let i = 0; i < SAMPLES; i++) {
      const result = dropPart(board);
      if (result.part.kind === 'part') {
        const lv = result.part.level;
        counts[lv] = (counts[lv] ?? 0) + 1;
      }
    }

    const expectedWeights: Record<number, number> = {
      1: 35, 2: 22, 3: 15, 4: 10, 5: 7,
      6: 5, 7: 3, 8: 2, 9: 0.8, 10: 0.2,
    };

    for (const [lvStr, expectedPct] of Object.entries(expectedWeights)) {
      const lv = Number(lvStr);
      const actualPct = ((counts[lv] ?? 0) / SAMPLES) * 100;
      expect(Math.abs(actualPct - expectedPct)).toBeLessThan(2);
    }
  });
});

describe('dropPart - full board', () => {
  it('returns placedAt=null when board is full, but part is still generated', () => {
    const board = makeFullBoard();
    const result = dropPart(board);
    expect(result.placedAt).toBeNull();
    expect(result.part).toBeDefined();
    expect(result.part.kind).toBe('part');
  });
});
