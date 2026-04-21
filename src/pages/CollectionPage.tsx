import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { COLLECTIBLE_IDS, COLLECTIBLE_CONFIGS } from '../config/collectibles';
import { Modal } from '../components/common/Modal';
import type { CollectibleId } from '../types/gift';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CollectionPage(): JSX.Element {
  const collection = useGameStore((s) => s.player.collection);
  const [selectedId, setSelectedId] = useState<CollectibleId | null>(null);

  const collected = COLLECTIBLE_IDS.filter((id) => (collection[id] ?? 0) > 0).length;
  const total = COLLECTIBLE_IDS.length;
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  const selectedCfg = selectedId ? COLLECTIBLE_CONFIGS[selectedId] : null;
  const selectedCount = selectedId ? (collection[selectedId] ?? 0) : 0;
  const selectedUnlocked = selectedCount > 0;

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-boxly-text">Коллекция</h1>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: collected > 0 ? 'rgba(232,180,160,0.18)' : 'rgba(229,223,214,0.5)',
            color: collected > 0 ? '#D89A84' : 'rgba(42,38,32,0.35)',
            border: `1px solid ${collected > 0 ? 'rgba(232,180,160,0.35)' : 'rgba(229,223,214,0.7)'}`,
          }}
        >
          {collected} / {total}
        </span>
      </div>

      {/* Progress bar with pct label */}
      <div>
        <div
          className="w-full h-3 rounded-full overflow-hidden relative"
          style={{ background: 'rgba(229,223,214,0.6)' }}
        >
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(90deg, #F0C4B0 0%, #E8B4A0 55%, #D89A84 100%)',
              boxShadow: '0 1px 4px rgba(232,180,160,0.5)',
            }}
          >
            {pct > 12 && (
              <span
                className="absolute top-0 bottom-0 w-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                  animation: 'shimmer 2.8s ease-in-out infinite',
                }}
              />
            )}
          </motion.div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-boxly-text/40">Прогресс</span>
          <span className="text-[10px] font-semibold text-boxly-text/50">{pct}%</span>
        </div>
      </div>

      {/* Empty collection hint */}
      {collected === 0 && (
        <div
          className="flex flex-col items-center gap-2 py-5 rounded-2xl"
          style={{ background: 'rgba(229,223,214,0.25)', border: '1.5px dashed rgba(229,223,214,0.8)' }}
        >
          <Icon icon="ph:compass" width={36} height={36} style={{ color: 'rgba(42,38,32,0.2)' }} />
          <p className="text-xs text-boxly-text/40 text-center leading-relaxed max-w-[200px]">
            Здесь будут редкие находки — сливай подарки lvl 10
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {COLLECTIBLE_IDS.map((id) => {
          const count = collection[id] ?? 0;
          const cfg = COLLECTIBLE_CONFIGS[id];
          const unlocked = count > 0;

          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className="aspect-square rounded-xl flex flex-col items-center justify-center relative gap-0.5"
              style={{
                background: unlocked
                  ? `radial-gradient(circle at 40% 35%, ${hexToRgba(cfg.color, 0.9)} 0%, ${cfg.color} 100%)`
                  : 'rgba(229,223,214,0.35)',
                border: `1.5px solid ${unlocked ? hexToRgba(cfg.color, 0.6) : 'rgba(229,223,214,0.6)'}`,
                boxShadow: unlocked
                  ? `0 0 0 0 ${hexToRgba(cfg.color, 0)}, 0 2px 8px ${hexToRgba(cfg.color, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.4)`
                  : 'inset 0 2px 4px rgba(42,38,32,0.05)',
                animation: unlocked ? 'breathe-mint 2.6s ease-in-out infinite' : undefined,
              }}
              onClick={() => setSelectedId(id)}
            >
              {unlocked ? (
                <>
                  <Icon
                    icon={cfg.icon}
                    width={22}
                    height={22}
                    style={{ color: 'rgba(42,38,32,0.75)' }}
                  />
                  {count > 1 ? (
                    <span
                      className="absolute top-0.5 right-0.5 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none"
                      style={{
                        width: 14, height: 14,
                        background: 'linear-gradient(135deg, #F0C4B0, #E8B4A0)',
                        boxShadow: '0 1px 3px rgba(232,180,160,0.5)',
                      }}
                    >
                      {count}
                    </span>
                  ) : null}
                  {/* Sparkle badge */}
                  <span className="absolute bottom-0.5 right-0.5">
                    <Icon icon="ph:sparkle-fill" width={9} height={9} style={{ color: hexToRgba(cfg.color, 0.5), animation: 'sparkle-spin 2.4s ease-in-out infinite' }} />
                  </span>
                </>
              ) : (
                <Icon icon="ph:lock-simple" width={18} height={18} style={{ color: 'rgba(42,38,32,0.22)' }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Name labels */}
      <div className="grid grid-cols-5 gap-2 -mt-2">
        {COLLECTIBLE_IDS.map((id) => {
          const cfg = COLLECTIBLE_CONFIGS[id];
          const count = collection[id] ?? 0;
          const unlocked = count > 0;
          return (
            <div key={`label_${id}`} className="text-center">
              <span
                className={`text-[9px] leading-tight ${unlocked ? 'text-boxly-text/65 font-medium' : 'text-boxly-text/22'}`}
              >
                {cfg.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
      >
        {selectedCfg ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div
              className="flex items-center justify-center relative"
              style={{
                width: 88, height: 88,
                borderRadius: 24,
                background: selectedUnlocked
                  ? `radial-gradient(circle at 40% 30%, ${hexToRgba(selectedCfg.color, 0.9)} 0%, ${selectedCfg.color} 100%)`
                  : 'rgba(229,223,214,0.4)',
                boxShadow: selectedUnlocked
                  ? `inset 0 2px 0 rgba(255,255,255,0.45), 0 8px 28px ${hexToRgba(selectedCfg.color, 0.5)}, 0 0 0 3px ${hexToRgba(selectedCfg.color, 0.3)}`
                  : 'inset 0 2px 6px rgba(42,38,32,0.07)',
                animation: selectedUnlocked ? 'collectible-glow 2.2s ease-in-out infinite' : undefined,
              }}
            >
              <Icon
                icon={selectedUnlocked ? selectedCfg.icon : 'ph:lock-simple'}
                width={48}
                height={48}
                style={{ color: selectedUnlocked ? 'rgba(42,38,32,0.75)' : 'rgba(42,38,32,0.25)' }}
              />
              {selectedUnlocked && (
                <span className="absolute top-1 right-1">
                  <Icon icon="ph:sparkle-fill" width={14} height={14} style={{ color: hexToRgba(selectedCfg.color, 0.7), animation: 'sparkle-spin 2.4s ease-in-out infinite' }} />
                </span>
              )}
            </div>

            <div className="text-lg font-bold text-boxly-text">
              {selectedUnlocked ? selectedCfg.name : 'Ещё не найдена'}
            </div>

            {selectedUnlocked ? (
              <div
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: hexToRgba(selectedCfg.color, 0.2),
                  color: 'rgba(42,38,32,0.65)',
                  border: `1px solid ${hexToRgba(selectedCfg.color, 0.35)}`,
                }}
              >
                {selectedCount} × найдено
              </div>
            ) : null}

            <div className="mt-1 text-xs text-boxly-text/45 text-center leading-relaxed">
              {selectedUnlocked
                ? '2 одинаковые → +50 ⚡ и 2000 XP'
                : 'Получить: объедини два подарка lvl 10'}
            </div>

            <button
              onClick={() => setSelectedId(null)}
              className="mt-2 px-8 py-2.5 rounded-xl text-white text-sm font-semibold relative overflow-hidden"
              style={{
                background: 'linear-gradient(150deg, #F2C8B2 0%, #E8B4A0 50%, #D89A84 100%)',
                boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.35), 0 3px 12px rgba(232,180,160,0.4)',
              }}
            >
              Понятно
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
