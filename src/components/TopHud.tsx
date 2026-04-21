import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { totalXpToReach } from '../engine/xp';
import { ENERGY_REGEN_MS } from '../config/balance';

export function TopHud(): JSX.Element {
  const player = useGameStore((s) => s.player);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextLevelXp = totalXpToReach(player.level + 1);
  const atCap = player.energy >= player.energyCap;

  const msUntilTick = atCap
    ? null
    : ENERGY_REGEN_MS - ((now - player.energyUpdatedAt) % ENERGY_REGEN_MS);

  const tickDisplay = msUntilTick !== null
    ? `+1 через ${Math.ceil(msUntilTick / 1000)}с`
    : 'полная';

  return (
    <div className="text-sm font-mono bg-white px-3 py-2 rounded-lg shadow-sm text-gray-700">
      Lvl {player.level} | XP: {player.xpTotal}/{nextLevelXp} | Energy: {player.energy}/{player.energyCap} ({tickDisplay})
    </div>
  );
}
