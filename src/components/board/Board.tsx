import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Cell } from './Cell';
import type { GiftItem } from '../../types/gift';
import { GIFT_CONFIGS } from '../../config/gifts';
import { COLLECTIBLE_CONFIGS } from '../../config/collectibles';

function getDragIcon(item: GiftItem): { icon: string; color: string; bg: string } {
  if (item.kind === 'collectible') {
    const cfg = COLLECTIBLE_CONFIGS[item.id];
    return { icon: cfg.icon, color: cfg.color, bg: cfg.color };
  }
  const cfg = GIFT_CONFIGS[item.level];
  return { icon: cfg.icon, color: cfg.color, bg: cfg.color };
}

function DragPreview({ item }: { item: GiftItem }): JSX.Element {
  const { icon, bg } = getDragIcon(item);
  return (
    <div
      className="w-14 h-14 flex items-center justify-center rounded-xl opacity-90 shadow-lg"
      style={{
        background: bg,
        border: '1.5px solid rgba(0,0,0,0.1)',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      <span style={{ fontSize: 30, lineHeight: 1, userSelect: 'none' }}>{icon}</span>
    </div>
  );
}

export function Board(): JSX.Element {
  const board = useGameStore((s) => s.board);
  const selectedCellId = useGameStore((s) => s.ui.selectedCellId);
  const fxList = useGameStore((s) => s.ui.fx);
  const selectCell = useGameStore((s) => s.selectCell);
  const tryMerge = useGameStore((s) => s.tryMerge);

  const [activeDragItem, setActiveDragItem] = useState<GiftItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent): void {
    const { cellId } = event.active.data.current as { cellId: string };
    const cell = board.find((c) => c.id === cellId);
    setActiveDragItem(cell?.item ?? null);
    document.body.classList.add('dnd-dragging');
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveDragItem(null);
    document.body.classList.remove('dnd-dragging');
    const { over, active } = event;
    const fromCellId = (active.data.current as { cellId: string }).cellId;
    if (!over) return;
    const toCellId = (over.data.current as { cellId: string }).cellId;
    if (fromCellId !== toCellId) {
      tryMerge(fromCellId, toCellId);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="grid grid-cols-5 p-2.5 rounded-2xl"
        style={{
          gap: '6px',
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(232,180,160,0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 80%, rgba(168,197,184,0.10) 0%, transparent 55%),
            linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(240,235,227,0.68) 100%)
          `,
          boxShadow: `
            inset 0 2px 8px rgba(42,38,32,0.06),
            inset 0 -1px 3px rgba(255,255,255,0.8),
            0 4px 20px rgba(42,38,32,0.08)
          `,
          backdropFilter: 'blur(6px)',
        }}
      >
        {board.map((cell, idx) => {
          const cellFx = fxList.find((f) => f.cellIdx === idx) ?? null;
          return (
            <Cell
              key={cell.id}
              cell={cell}
              isSelected={selectedCellId === cell.id}
              onSelect={selectCell}
              fx={cellFx ? { id: cellFx.id, type: cellFx.type } : null}
            />
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragItem !== null ? <DragPreview item={activeDragItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
