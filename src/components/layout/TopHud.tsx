import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useGameStore } from '../../store/gameStore';
import { totalXpToReach } from '../../engine/xp';
import { ENERGY_REGEN_MS } from '../../config/balance';

function formatMmSs(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export function TopHud(): JSX.Element {
  const player = useGameStore((s) => s.player);
  const [now, setNow] = useState(Date.now());

  const atCap = player.energy >= player.energyCap;
  const energyLow = player.energy / player.energyCap < 0.2;

  useEffect(() => {
    if (atCap) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [atCap]);

  const xpPrevLevel = totalXpToReach(player.level);
  const xpNextLevel = totalXpToReach(player.level + 1);
  const xpInLevel = player.xpTotal - xpPrevLevel;
  const xpNextInLevel = xpNextLevel - xpPrevLevel;
  const xpPct = xpNextInLevel > 0 ? Math.min(100, (xpInLevel / xpNextInLevel) * 100) : 0;

  const msUntilTick = atCap
    ? null
    : ENERGY_REGEN_MS - ((now - player.energyUpdatedAt) % ENERGY_REGEN_MS);
  const tickDisplay = msUntilTick !== null ? `+1 через ${formatMmSs(msUntilTick)}` : null;

  return (
    <div
      className="w-full px-4 py-3 flex items-center gap-3"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(250,247,242,0.90) 100%)',
        borderBottom: '1px solid rgba(229,223,214,0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Level badge — iOS button style */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(160deg, #F0C4B0 0%, #E8B4A0 55%, #D9A08C 100%)',
          boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.45), 0 2px 8px rgba(232,180,160,0.45)',
        }}
      >
        <span className="text-white font-bold text-sm leading-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
          {player.level}
        </span>
      </div>

      {/* XP progress */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-boxly-text/50 font-medium uppercase tracking-wide">XP</span>
          <span className="text-[10px] text-boxly-text/50">{xpInLevel}/{xpNextInLevel}</span>
        </div>
        {/* Shimmer XP bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden relative"
          style={{ background: 'rgba(229,223,214,0.7)' }}
        >
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${xpPct}%`,
              background: 'linear-gradient(90deg, #EFC0A8 0%, #E8B4A0 50%, #D99A7E 100%)',
              transition: 'width 0.4s ease',
              boxShadow: '0 1px 3px rgba(232,180,160,0.5)',
            }}
          >
            {xpPct > 8 && (
              <span
                className="absolute top-0 bottom-0 w-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                  animation: 'shimmer 2.4s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Energy pill */}
      <div
        className="flex-shrink-0 flex flex-col items-end"
        style={energyLow ? { animation: 'energy-pulse 1.4s ease-in-out infinite' } : undefined}
      >
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{
            background: energyLow
              ? 'rgba(220,80,60,0.10)'
              : 'rgba(168,197,184,0.18)',
            border: `1px solid ${energyLow ? 'rgba(220,80,60,0.25)' : 'rgba(168,197,184,0.35)'}`,
          }}
        >
          <Icon
            icon="ph:lightning-fill"
            width={13}
            height={13}
            style={{ color: energyLow ? '#D45040' : '#7AADA0' }}
          />
          <span
            className="text-sm font-semibold leading-none"
            style={{ color: energyLow ? '#D45040' : '#2A2620' }}
          >
            {player.energy}/{player.energyCap}
          </span>
        </div>
        {tickDisplay ? (
          <div className="text-[9px] text-boxly-text/40 mt-0.5 pr-0.5">{tickDisplay}</div>
        ) : null}
      </div>
    </div>
  );
}
