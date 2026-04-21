import type { GiftItem } from './gift';

export interface Coord {
  x: number;
  y: number;
}

export const BOARD_W = 5;
export const BOARD_H = 6;

export interface BoardCell {
  id: string;
  coord: Coord;
  item: GiftItem | null;
}

export type Board = BoardCell[];
