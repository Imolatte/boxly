import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { sellValue } from '../../engine/sell';
import { sfx } from '../../audio/sfx';

export function SellButton(): JSX.Element | null {
  const selectedCellId = useGameStore((s) => s.ui.selectedCellId);
  const board = useGameStore((s) => s.board);
  const sellSelected = useGameStore((s) => s.sellSelected);

  if (!selectedCellId) return null;

  const cell = board.find((c) => c.id === selectedCellId);
  if (!cell?.item) return null;

  const value = sellValue(cell.item);
  if (value === null) return null;

  const isComplete = cell.item.kind === 'complete';
  const isCollectible = cell.item.kind === 'collectible';
  const level = cell.item.kind === 'complete' ? cell.item.level : null;
  let label: string;
  if (isComplete && level !== null) {
    label = `C${level} → +1 ⚡`;
  } else if (isCollectible) {
    label = `Продать → +${value} ⚡`;
  } else {
    label = 'Удалить';
  }

  const isFree = !isComplete && !isCollectible;

  return (
    <motion.button
      onClick={() => { sfx.sell(); sellSelected(); }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="w-full py-3 rounded-xl font-semibold text-sm select-none flex items-center justify-center gap-2 relative"
      style={{
        background: isFree
          ? 'rgba(229,223,214,0.6)'
          : 'linear-gradient(150deg, #C4D9D1 0%, #A8C5B8 50%, #8EB5A6 100%)',
        color: isFree ? 'rgba(42,38,32,0.55)' : '#2A3830',
        boxShadow: isFree
          ? 'inset 0 1px 2px rgba(42,38,32,0.05)'
          : 'inset 0 1.5px 0 rgba(255,255,255,0.4), 0 2px 10px rgba(168,197,184,0.4)',
        border: isFree ? '1.5px solid rgba(229,223,214,0.8)' : '1.5px solid rgba(142,181,166,0.6)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {/* top highlight */}
      {!isFree && (
        <span
          className="absolute top-0 left-4 right-4 h-px rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.45)' }}
        />
      )}
      <Icon
        icon={isComplete || isCollectible ? 'ph:hand-coins-fill' : 'ph:trash-simple'}
        width={17}
        height={17}
        style={{ color: isFree ? 'rgba(42,38,32,0.4)' : '#3A6858', flexShrink: 0 }}
      />
      <span>{label}</span>
    </motion.button>
  );
}
