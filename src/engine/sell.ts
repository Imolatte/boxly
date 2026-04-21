import type { GiftItem } from '../types/gift';

/** Returns energy gained from selling, or null if item cannot be sold. */
export function sellValue(item: GiftItem): number | null {
  if (item.kind === 'complete') return 1;
  if (item.kind === 'part' || item.kind === 'intermediate') return 0;
  // collectible - cannot sell
  return null;
}
