import { memo } from 'react';
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

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
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
  stage?: 1 | 2;
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
      bg: cfg.color,
      border: darken(cfg.color, 25),
      iconColor: darken(cfg.color, 80),
      iconOpacity: 0.85,
      icon: cfg.icon,
      kind: 'part',
      level,
    };
  }

  if (item.kind === 'intermediate') {
    const stageAlphaBg = item.stage === 2 ? 0.7 : 0.45;
    const stageIconOpacity = item.stage === 2 ? 0.9 : 0.7;
    return {
      bg: hexToRgba(cfg.color, stageAlphaBg),
      border: hexToRgba(darken(cfg.color, 30), item.stage === 2 ? 0.9 : 0.75),
      iconColor: darken(cfg.color, 85),
      iconOpacity: stageIconOpacity,
      icon: cfg.icon,
      kind: 'intermediate',
      level,
      stage: item.stage,
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

// Icon sizes per kind/stage/level — smaller = "less complete"
function resolveIconSize(
  kind: SpriteStyle['kind'],
  stage?: 1 | 2,
  level?: number,
): number {
  if (kind === 'collectible') return 36;
  if (kind === 'complete') return level && level >= 7 ? 34 : 32;
  if (kind === 'intermediate') {
    if (stage === 2) return 30;
    return level && level >= 8 ? 24 : 28;
  }
  // part: smaller for levels with more merge steps ahead
  if (level && level >= 8) return 20;
  if (level && level >= 6) return 22;
  return 24;
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

function IntermediateBadge({ stage }: { color: string; stage: 1 | 2 }): JSX.Element {
  const icon = stage === 2 ? 'ph:circle-three-quarters-fill' : 'ph:circle-half-fill';
  return (
    <span
      className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full"
      style={{
        width: 16,
        height: 16,
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      <Icon
        icon={icon}
        width={11}
        height={11}
        style={{ color: '#4a413a', display: 'block' }}
      />
    </span>
  );
}

function GiftSpriteImpl({ item, cellId, isSelling = false }: GiftSpriteProps): JSX.Element {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drag_${cellId}`,
    data: { cellId },
  });

  const style = resolveStyle(item);

  const isHighLevel = style.kind === 'complete' && typeof style.level === 'number' && style.level >= 7;
  const isCollectible = style.kind === 'collectible';

  const iconSize = resolveIconSize(style.kind, style.stage, style.level);

  // --- Background ---
  let bgStyle: React.CSSProperties;

  if (style.kind === 'part') {
    // Tinted bg at 45% with subtle diagonal stripes overlay
    bgStyle = {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        rgba(255,255,255,0.22) 0px,
        rgba(255,255,255,0.22) 1.5px,
        transparent 1.5px,
        transparent 8px
      ), linear-gradient(135deg, ${hexToRgba(style.bg, 0.5)}, ${hexToRgba(style.bg, 0.3)})`,
    };
  } else if (style.kind === 'intermediate') {
    // Solid tinted with inset top highlight for stage 2
    bgStyle = {
      background: style.bg,
    };
  } else if (style.kind === 'complete') {
    // Saturated gradient: lighter top → full color bottom
    bgStyle = {
      background: `linear-gradient(135deg, ${lighten(style.bg, 20)} 0%, ${style.bg} 100%)`,
    };
  } else {
    // collectible: bold color gradient with gold halo
    bgStyle = {
      background: `radial-gradient(circle at 30% 25%, ${lighten(style.bg, 30)} 0%, ${style.bg} 55%, ${darken(style.bg, 15)} 100%)`,
    };
  }

  // --- Border ---
  let borderStyle: string;
  if (style.kind === 'part') {
    borderStyle = `1.5px dashed ${hexToRgba(style.border, 0.4)}`;
  } else if (style.kind === 'intermediate') {
    borderStyle = `1.5px solid ${hexToRgba(style.border, style.stage === 2 ? 0.9 : 0.7)}`;
  } else if (style.kind === 'complete') {
    borderStyle = `1.5px solid ${style.border}`;
  } else {
    borderStyle = '1.5px solid #E8B97A';
  }

  // --- Shadow / Extra ---
  let extraStyle: React.CSSProperties = {};

  if (isCollectible) {
    extraStyle = {
      animation: 'collectible-glow 2.2s ease-in-out infinite',
      outline: '2.5px solid #E8B97A',
      outlineOffset: '1px',
      boxShadow: `0 0 0 1px rgba(232,185,122,0.5), 0 4px 14px ${hexToRgba(style.bg, 0.55)}, inset 0 1px 0 rgba(255,255,255,0.6)`,
    };
  } else if (isHighLevel) {
    extraStyle = {
      animation: 'breathe 3s ease-in-out infinite',
      boxShadow: `0 4px 14px ${hexToRgba(style.border, 0.55)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
    };
  } else if (style.kind === 'complete') {
    extraStyle = {
      boxShadow: `0 3px 10px ${hexToRgba(style.border, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
    };
  } else if (style.kind === 'intermediate' && style.stage === 2) {
    // Subtle inset highlight on top edge for stage 2
    extraStyle = {
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.50), 0 2px 6px ${hexToRgba(style.border, 0.3)}`,
    };
  } else if (style.kind === 'intermediate') {
    extraStyle = {
      boxShadow: `0 1px 4px ${hexToRgba(style.border, 0.2)}`,
    };
  }

  // --- Icon filter ---
  // For part: grayscale is on the wrapper; icon needs no extra filter
  // For all fluent-emoji: do NOT pass color prop (they are multicolor SVG)
  let iconFilter: string | undefined;
  if (style.kind === 'part') {
    // grayscale already applied to wrapper via bgStyle filter;
    // extra opacity only via iconOpacity below
    iconFilter = undefined;
  }

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="w-full h-full flex items-center justify-center rounded-xl select-none cursor-grab relative overflow-hidden boxly-sprite"
      style={{
        ...bgStyle,
        border: borderStyle,
        touchAction: 'none',
        contain: 'layout paint style',
        willChange: 'transform',
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
      <span
        style={{
          fontSize: iconSize,
          lineHeight: 1,
          opacity: style.iconOpacity,
          filter: iconFilter,
          display: 'block',
          userSelect: 'none',
        }}
      >
        {style.icon}
      </span>

      {style.kind === 'collectible' && (
        <CollectibleBadge color="#B8860B" />
      )}
      {style.kind === 'part' && (
        <PartBadge color={style.iconColor} />
      )}
      {style.kind === 'intermediate' && (
        <IntermediateBadge color={darken(style.border, -10)} stage={style.stage ?? 1} />
      )}
    </motion.div>
  );
}

export const GiftSprite = memo(GiftSpriteImpl, (prev, next) => {
  if (prev.cellId !== next.cellId || prev.isSelling !== next.isSelling) return false;
  const a = prev.item;
  const b = next.item;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'collectible' && b.kind === 'collectible') return a.id === b.id;
  if ('level' in a && 'level' in b) {
    if (a.level !== b.level) return false;
    if (a.kind === 'intermediate' && b.kind === 'intermediate') return a.stage === b.stage;
    return true;
  }
  return false;
});

