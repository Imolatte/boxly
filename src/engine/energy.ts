import type { PlayerState } from '../types/player';
import { ENERGY_REGEN_MS } from '../config/balance';

export interface RegenResult {
  energy: number;
  energyUpdatedAt: number;
}

export function computeRegenSince(now: number, p: PlayerState): RegenResult {
  if (p.energy >= p.energyCap) {
    return { energy: p.energy, energyUpdatedAt: now };
  }

  const delta = now - p.energyUpdatedAt;
  const ticks = Math.floor(delta / ENERGY_REGEN_MS);

  if (ticks <= 0) {
    return { energy: p.energy, energyUpdatedAt: p.energyUpdatedAt };
  }

  const newEnergy = Math.min(p.energyCap, p.energy + ticks);
  const consumedMs = ticks * ENERGY_REGEN_MS;

  return {
    energy: newEnergy,
    energyUpdatedAt: p.energyUpdatedAt + consumedMs,
  };
}
