import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import type { BoardCell } from '../../types/board';
import { GiftSprite } from './GiftSprite';
import { MergeFx } from './MergeFx';

interface CellProps {
  cell: BoardCell;
  isSelected: boolean;
  onSelect: (id: string) => void;
  fx?: { id: string; type: 'merge' | 'sell' } | null;
  mergePreview?: boolean;
}

export function Cell({ cell, isSelected, onSelect, fx, mergePreview = false }: CellProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop_${cell.id}`,
    data: { cellId: cell.id },
  });

  const hasItem = cell.item !== null;

  // Styling logic
  let borderColor = '#E5DFD6';
  let boxShadow: string | undefined;
  let bgStyle: React.CSSProperties = {};

  if (isSelected) {
    borderColor = '#E8B4A0';
    boxShadow = '0 0 0 2px rgba(232,180,160,0.38), inset 0 1px 4px rgba(232,180,160,0.15)';
  } else if (mergePreview && isOver) {
    borderColor = '#A8C5B8';
    boxShadow = '0 0 0 2.5px rgba(168,197,184,0.6), 0 0 14px rgba(168,197,184,0.4), inset 0 1px 4px rgba(168,197,184,0.12)';
  } else if (isOver) {
    borderColor = '#A8C5B8';
    boxShadow = '0 0 0 1.5px rgba(168,197,184,0.4), inset 0 1px 4px rgba(168,197,184,0.08)';
  }

  // Empty cell: inset "well" look
  if (!hasItem) {
    bgStyle = {
      background: isOver && !hasItem
        ? 'rgba(168,197,184,0.12)'
        : `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.5) 0%, rgba(229,223,214,0.18) 100%)`,
      boxShadow: boxShadow ?? `inset 0 2px 5px rgba(42,38,32,0.06), inset 0 1px 2px rgba(42,38,32,0.04)`,
    };
  } else {
    bgStyle = {
      background: 'transparent',
      boxShadow: boxShadow,
    };
  }

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelect(cell.id)}
      className="rounded-xl flex items-center justify-center relative cursor-pointer boxly-cell"
      style={{
        width: '100%',
        aspectRatio: '1',
        border: `1.5px solid ${borderColor}`,
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        contain: 'layout paint style',
        ...bgStyle,
      }}
    >
      <AnimatePresence>
        {hasItem ? (
          <div
            key={
              cell.item!.kind === 'collectible'
                ? cell.item!.id
                : `${cell.item!.kind}_${'level' in cell.item! ? cell.item!.level : 0}`
            }
            className="w-full h-full p-1"
          >
            <GiftSprite item={cell.item!} cellId={cell.id} />
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {fx ? <MergeFx key={fx.id} type={fx.type} /> : null}
      </AnimatePresence>
    </div>
  );
}
