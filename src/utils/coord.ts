import type { Coord } from '../types/board';

export function coordToIndex(coord: Coord, width: number): number {
  return coord.y * width + coord.x;
}

export function indexToCoord(index: number, width: number): Coord {
  return { x: index % width, y: Math.floor(index / width) };
}

export function coordsEqual(a: Coord, b: Coord): boolean {
  return a.x === b.x && a.y === b.y;
}
