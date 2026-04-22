import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useEnergyTick(): void {
  const tick = useGameStore((s) => s.tickEnergyRegen);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 5000);
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [tick]);
}
