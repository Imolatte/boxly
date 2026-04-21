import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useEnergyTick(): void {
  const tick = useGameStore((s) => s.tickEnergyRegen);

  useEffect(() => {
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [tick]);
}
