import { useRef } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useToastStore } from '../../store/toastStore';
import { impact } from '../../telegram/haptics';
import { sfx } from '../../audio/sfx';

const FULL_FIELD_THROTTLE_MS = 2000;

export function CreateButton(): JSX.Element {
  const create = useGameStore((s) => s.create);
  const energy = useGameStore((s) => s.player.energy);
  const board = useGameStore((s) => s.board);
  const pushToast = useToastStore((s) => s.push);
  const lastToastRef = useRef<number>(0);

  const hasEmpty = board.some((c) => c.item === null);
  const canCreate = energy >= 1 && hasEmpty;
  const fieldFull = energy >= 1 && !hasEmpty;

  function handleCreate(): void {
    if (canCreate) {
      impact('light');
      sfx.tap();
      create();
      return;
    }
    if (fieldFull) {
      const now = Date.now();
      if (now - lastToastRef.current > FULL_FIELD_THROTTLE_MS) {
        lastToastRef.current = now;
        pushToast('Поле заполнено — продай что-нибудь или сделай мёрдж', 'info');
      }
    }
  }

  return (
    <motion.button
      onClick={handleCreate}
      disabled={energy < 1}
      whileTap={canCreate ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.1 }}
      className="w-full py-4 rounded-2xl font-bold text-lg select-none flex items-center justify-center gap-2 relative overflow-hidden"
      style={{
        background: canCreate
          ? 'linear-gradient(150deg, #F2C8B2 0%, #E8B4A0 45%, #D89A84 100%)'
          : 'linear-gradient(-45deg, rgba(229,223,214,0.7) 25%, rgba(240,235,230,0.7) 50%, rgba(229,223,214,0.7) 75%)',
        backgroundSize: canCreate ? undefined : '12px 12px',
        color: canCreate ? '#fff' : 'rgba(42,38,32,0.3)',
        boxShadow: canCreate
          ? 'inset 0 1.5px 0 rgba(255,255,255,0.35), 0 4px 16px rgba(232,180,160,0.45), 0 1px 4px rgba(200,140,120,0.25)'
          : 'inset 0 1px 3px rgba(42,38,32,0.06)',
        cursor: canCreate ? 'pointer' : fieldFull ? 'pointer' : 'not-allowed',
        transition: 'background 0.25s, box-shadow 0.25s, color 0.25s',
        animation: canCreate ? 'breathe 3.5s ease-in-out infinite' : undefined,
      }}
    >
      {/* Inner top highlight */}
      {canCreate && (
        <span
          className="absolute top-0 left-4 right-4 h-px rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        />
      )}

      <Icon
        icon={canCreate ? 'ph:sparkle-fill' : 'ph:plus-circle'}
        width={20}
        height={20}
        style={{
          color: canCreate ? 'rgba(255,255,255,0.85)' : 'rgba(42,38,32,0.3)',
          flexShrink: 0,
        }}
      />
      <span style={{ textShadow: canCreate ? '0 1px 2px rgba(0,0,0,0.12)' : undefined }}>
        Создать (-1 ⚡)
      </span>
    </motion.button>
  );
}
