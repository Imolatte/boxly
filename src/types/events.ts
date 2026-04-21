import type { CollectibleId, GiftItem } from './gift';

export type RouletteReward =
  | { kind: 'energy'; amount: 10 | 25 | 50 | 100 }
  | { kind: 'xp'; amount: 200 | 500 }
  | { kind: 'gift'; item: GiftItem }
  | { kind: 'collectible'; id: CollectibleId };
