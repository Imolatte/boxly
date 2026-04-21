import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { COLLECTIBLE_IDS } from '../config/collectibles';
import { Modal } from '../components/common/Modal';
import { getTelegramUser } from '../telegram/sdk';
import { totalXpToReach } from '../config/balance';

export function ProfilePage(): JSX.Element {
  const player = useGameStore((s) => s.player);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const soundEnabled = useGameStore((s) => s.ui.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const collected = COLLECTIBLE_IDS.filter((id) => (player.collection[id] ?? 0) > 0).length;
  const tgUser = getTelegramUser();

  // WHY: level 1 starts at 0 XP even though totalXpToReach(1)=100 — special-case or display shows negative.
  const xpPrev = player.level <= 1 ? 0 : totalXpToReach(player.level);
  const xpNext = totalXpToReach(player.level + 1);
  const curXp = Math.max(0, player.xpTotal - xpPrev);
  const xpNeeded = xpNext - xpPrev;
  const xpPct = xpNeeded > 0 ? Math.min(100, (curXp / xpNeeded) * 100) : 0;

  function handleConfirmReset(): void {
    setConfirmOpen(false);
    resetProgress();
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Avatar + name block */}
      <div className="flex flex-col items-center gap-2 py-4">
        {tgUser?.photo_url ? (
          <div
            className="rounded-full p-0.5"
            style={{
              background: 'linear-gradient(135deg, #F0C4B0 0%, #E8B4A0 40%, #A8C5B8 100%)',
              boxShadow: '0 4px 16px rgba(232,180,160,0.35)',
            }}
          >
            <img
              src={tgUser.photo_url}
              alt={tgUser.first_name}
              className="w-20 h-20 rounded-full object-cover block"
              style={{ border: '2px solid rgba(250,247,242,0.9)' }}
            />
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(150deg, #F2C8B2 0%, #E8B4A0 50%, #D89A84 100%)',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4), 0 4px 16px rgba(232,180,160,0.4)',
            }}
          >
            <span className="text-white text-2xl font-bold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
              {tgUser ? tgUser.first_name[0].toUpperCase() : 'B'}
            </span>
          </div>
        )}

        <div className="text-xl font-bold text-boxly-text">
          {tgUser ? tgUser.first_name : 'Гость'}
        </div>
        {tgUser?.username ? (
          <div className="text-sm text-boxly-text/45">@{tgUser.username}</div>
        ) : null}

        {/* Level + XP bar */}
        <div
          className="w-full mt-1 px-4 py-3 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,235,227,0.65) 100%)',
            border: '1px solid rgba(229,223,214,0.7)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-boxly-peach">Уровень {player.level}</span>
            <span className="text-xs text-boxly-text/45">{curXp} / {xpNeeded} XP</span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden relative"
            style={{ background: 'rgba(229,223,214,0.7)' }}
          >
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, #F0C4B0 0%, #E8B4A0 55%, #D89A84 100%)',
                boxShadow: '0 1px 3px rgba(232,180,160,0.5)',
              }}
            >
              {xpPct > 8 && (
                <span
                  className="absolute top-0 bottom-0 w-8 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                    animation: 'shimmer 2.4s ease-in-out infinite',
                  }}
                />
              )}
            </motion.div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-boxly-text/35">Lvl {player.level}</span>
            <span className="text-[9px] text-boxly-text/35">Lvl {player.level + 1}</span>
          </div>
        </div>
      </div>

      {/* Stats card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.8) 0%, rgba(250,247,242,0.85) 100%)',
          border: '1px solid rgba(229,223,214,0.7)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 12px rgba(42,38,32,0.05)',
        }}
      >
        <StatRow icon="ph:star-fill" label="Всего XP" value={String(player.xpTotal)} accent="#E8B4A0" />
        <div style={{ height: 1, background: 'rgba(229,223,214,0.6)', margin: '0 16px' }} />
        <StatRow icon="ph:lightning-fill" label="Энергия" value={`${player.energy} / ${player.energyCap}`} accent="#A8C5B8" />
        <div style={{ height: 1, background: 'rgba(229,223,214,0.6)', margin: '0 16px' }} />
        <StatRow icon="ph:sparkle-fill" label="Коллекционок" value={`${collected} / 10`} accent="#E8B4A0" />
      </div>

      {/* Sound toggle */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.8) 0%, rgba(250,247,242,0.85) 100%)',
          border: '1px solid rgba(229,223,214,0.7)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 12px rgba(42,38,32,0.05)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,197,184,0.18)' }}
          >
            <Icon
              icon={soundEnabled ? 'ph:speaker-high' : 'ph:speaker-slash'}
              width={16}
              height={16}
              style={{ color: '#A8C5B8' }}
            />
          </div>
          <span className="flex-1 text-sm text-boxly-text/65">Звук</span>
          <button
            onClick={toggleSound}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{
              background: soundEnabled
                ? 'linear-gradient(135deg, #C4D9D1 0%, #A8C5B8 100%)'
                : 'rgba(229,223,214,0.8)',
              boxShadow: soundEnabled
                ? 'inset 0 1px 0 rgba(255,255,255,0.35)'
                : 'inset 0 1px 3px rgba(42,38,32,0.1)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{
                left: soundEnabled ? 'calc(100% - 22px)' : '2px',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(42,38,32,0.2)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Reset button — understated destructive */}
      <button
        onClick={() => setConfirmOpen(true)}
        className="w-full py-3 rounded-xl text-sm font-medium"
        style={{
          background: 'transparent',
          color: 'rgba(200,70,60,0.65)',
          border: '1.5px solid rgba(200,70,60,0.18)',
          cursor: 'pointer',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,70,60,0.05)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        Сбросить прогресс
      </button>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Сбросить прогресс?">
        <p className="text-sm text-boxly-text/65 mb-6 leading-relaxed">
          Весь прогресс, уровни, коллекция и энергия будут потеряны. Это действие нельзя отменить.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{
              border: '1.5px solid rgba(229,223,214,0.8)',
              color: 'rgba(42,38,32,0.7)',
              background: 'transparent',
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleConfirmReset}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold"
            style={{
              background: 'linear-gradient(150deg, #E8726A 0%, #D05A52 100%)',
              boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.2), 0 3px 10px rgba(208,90,82,0.35)',
            }}
          >
            Сбросить
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface StatRowProps {
  icon: string;
  label: string;
  value: string;
  accent: string;
}

function StatRow({ icon, label, value, accent }: StatRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}28` }}
      >
        <Icon icon={icon} width={16} height={16} style={{ color: accent }} />
      </div>
      <span className="flex-1 text-sm text-boxly-text/65">{label}</span>
      <span className="text-sm font-bold text-boxly-text">{value}</span>
    </div>
  );
}
