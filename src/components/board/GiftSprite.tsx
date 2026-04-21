import { useDraggable } from '@dnd-kit/core';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import type { GiftItem, GiftLevel } from '../../types/gift';
import { GIFT_CONFIGS } from '../../config/gifts';
import { COLLECTIBLE_CONFIGS } from '../../config/collectibles';

interface GiftSpriteProps {
  item: GiftItem;
  cellId: string;
  isSelling?: boolean;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface SpriteStyle {
  bg: string;
  border: string;
  iconColor: string;
  iconOpacity: number;
  icon: string;
  kind: 'part' | 'intermediate' | 'complete' | 'collectible';
  level?: number;
}

function resolveStyle(item: GiftItem): SpriteStyle {
  if (item.kind === 'collectible') {
    const cfg = COLLECTIBLE_CONFIGS[item.id];
    return {
      bg: cfg.color,
      border: darken(cfg.color, 25),
      iconColor: darken(cfg.color, 100),
      iconOpacity: 1,
      icon: cfg.icon,
      kind: 'collectible',
    };
  }

  const level = item.level as GiftLevel;
  const cfg = GIFT_CONFIGS[level];

  if (item.kind === 'part') {
    return {
      bg: hexToRgba(cfg.color, 0.38),
      border: hexToRgba(darken(cfg.color, 20), 0.5),
      iconColor: darken(cfg.color, 80),
      iconOpacity: 0.5,
      icon: cfg.icon,
      kind: 'part',
      level,
    };
  }

  if (item.kind === 'intermediate') {
    return {
      bg: hexToRgba(cfg.color, 0.65),
      border: hexToRgba(darken(cfg.color, 30), 0.75),
      iconColor: darken(cfg.color, 75),
      iconOpacity: 0.82,
      icon: cfg.icon,
      kind: 'intermediate',
      level,
    };
  }

  // complete
  return {
    bg: cfg.color,
    border: darken(cfg.color, 35),
    iconColor: darken(cfg.color, 100),
    iconOpacity: 1,
    icon: cfg.icon,
    kind: 'complete',
    level,
  };
}

function CollectibleBadge({ color }: { color: string }): JSX.Element {
  return (
    <span
      className="absolute bottom-0.5 right-0.5 flex items-center justify-center"
      style={{ width: 14, height: 14 }}
    >
      <Icon
        icon="ph:sparkle-fill"
        width={11}
        height={11}
        style={{
          color,
          animation: 'sparkle-spin 2.4s ease-in-out infinite',
          display: 'block',
        }}
      />
    </span>
  );
}

function PartBadge({ color }: { color: string }): JSX.Element {
  return (
    <span
      className="absolute bottom-0.5 right-1 text-[8px] leading-none font-bold tracking-wider"
      style={{ color, opacity: 0.6 }}
    >
      ·
    </span>
  );
}

function IntermediateBadge({ color }: { color: string }): JSX.Element {
  return (
    <span
      className="absolute bottom-0.5 right-0.5 flex items-center justify-center"
      style={{ width: 14, height: 14 }}
    >
      <Icon
        icon="ph:circle-half-fill"
        width={11}
        height={11}
        style={{ color, opacity: 0.75, display: 'block' }}
      />
    </span>
  );
}

export function GiftSprite({ item, cellId, isSelling = false }: GiftSpriteProps): JSX.Element {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drag_${cellId}`,
    data: { cellId },
  });

  const style = resolveStyle(item);

  // Complete lvl >=7 → breathing glow
  const isHighLevel = style.kind === 'complete' && typeof style.level === 'number' && style.level >= 7;
  const isCollectible = style.kind === 'collectible';

  let extraStyle: React.CSSProperties = {};

  if (isCollectible) {
    extraStyle = {
      animation: 'collectible-glow 2.2s ease-in-out infinite',
      outline: `2px solid ${hexToRgba(style.border, 0.55)}`,
      outlineOffset: '1px',
    };
  } else if (isHighLevel) {
    extraStyle = {
      animation: 'breathe 3s ease-in-out infinite',
    };
  }

  // Part: dashed-style inset striped bg pattern
  let bgStyle: React.CSSProperties = { background: style.bg };
  if (style.kind === 'part') {
    bgStyle = {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        ${hexToRgba(style.border, 0.18)} 0px,
        ${hexToRgba(style.border, 0.18)} 2px,
        transparent 2px,
        transparent 8px
      ), linear-gradient(135deg, ${style.bg}, ${hexToRgba(style.border, 0.4)})`,
    };
  }

  const baseBoxShadow =
    style.kind === 'complete' && !isHighLevel
      ? `0 0 0 1px ${hexToRgba(style.border, 0.4)}, 0 2px 8px ${hexToRgba(style.border, 0.25)}`
      : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="w-full h-full flex items-center justify-center rounded-xl select-none cursor-grab relative"
      style={{
        ...bgStyle,
        border: `1.5px solid ${style.border}`,
        boxShadow: baseBoxShadow,
        touchAction: 'none',
        ...extraStyle,
      }}
      initial={{ y: -16, opacity: 0, scale: 0.85 }}
      animate={
        isSelling
          ? { y: 0, opacity: 0, scale: 0.7 }
          : { y: 0, opacity: isDragging ? 0.3 : 1, scale: isDragging ? 0.95 : 1 }
      }
      transition={
        isSelling
          ? { duration: 0.2 }
          : { type: 'spring', stiffness: 300, damping: 22 }
      }
    >
      <Icon
        icon={style.icon}
        width={26}
        height={26}
        style={{ color: style.iconColor, opacity: style.iconOpacity }}
      />

      {style.kind === 'collectible' && (
        <CollectibleBadge color={darken(style.border, -20)} />
      )}
      {style.kind === 'part' && (
        <PartBadge color={style.iconColor} />
      )}
      {style.kind === 'intermediate' && (
        <IntermediateBadge color={style.iconColor} />
      )}
    </motion.div>
  );
}
