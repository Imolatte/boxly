import type { CollectibleId } from './gift';

export interface PlayerState {
  level: number;
  xp: number;
  xpTotal: number;
  energy: number;
  energyCap: number;
  energyUpdatedAt: number;
  collection: Partial<Record<CollectibleId, number>>;
}
