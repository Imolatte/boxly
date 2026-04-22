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
      bg: hexToRgba(cfg.color, 0.38),
      border: hexToRgba(darken(cfg.color, 20), 0.5),
      iconColor: darken(cfg.color, 80),
      iconOpacity: 0.45,
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

// Icon sizes per kind/stage
function resolveIconSize(
  kind: SpriteStyle['kind'],
  stage?: 1 | 2,
  level?: number,
): number {
  if (kind === 'collectible') return 36;
  if (kind === 'complete') return level && level >= 7 ? 34 : 32;
  if (kind === 'intermediate') return stage === 2 ? 32 : 28;
  // part
  return 22;
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

function IntermediateBadge({ color, stage }: { color: string; stage: 1 | 2 }): JSX.Element {
  const icon = stage === 2 ? 'ph:circle-three-quarters-fill' : 'ph:circle-half-fill';
  const opacity = stage === 2 ? 0.92 : 0.75;
  return (
    <span
      className="absolute bottom-0.5 right-0.5 flex items-center justify-center"
      style={{ width: 14, height: 14 }}
    >
      <Icon
        icon={icon}
        width={11}
        height={11}
        style={{ color, opacity, display: 'block' }}
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

  const isHighLevel = style.kind === 'complete' && typeof style.level === 'number' && style.level >= 7;
  const isCollectible = style.kind === 'collectible';

  const iconSize = resolveIconSize(style.kind, style.stage, style.level);

  // --- Background ---
  let bgStyle: React.CSSProperties;

  if (style.kind === 'part') {
    // Greyscale tinted stripes on near-white base
    bgStyle = {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        ${hexToRgba(style.border, 0.22)} 0px,
        ${hexToRgba(style.border, 0.22)} 1.5px,
        transparent 1.5px,
        transparent 7px
      ), linear-gradient(135deg, rgba(255,255,255,0.60), ${hexToRgba(style.border, 0.22)})`,
      filter: 'grayscale(0.65)',
    };
  } else if (style.kind === 'intermediate') {
    // Solid tinted with inset top highlight for stage 2
    bgStyle = {
      background: style.bg,
    };
  } else if (style.kind === 'complete') {
    // Soft gradient: near-white → tinted
    bgStyle = {
      background: `linear-gradient(135deg, #FFFFFF, ${hexToRgba(style.bg, 0.72)})`,
    };
  } else {
    // collectible: soft cream base, gold outline handles the flair
    bgStyle = {
      background: `linear-gradient(135deg, #FFFDF7, ${hexToRgba(style.bg, 0.65)})`,
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
      outline: '2px solid #E8B97A',
      outlineOffset: '1px',
      boxShadow: '0 0 0 1px rgba(232,185,122,0.35), 0 3px 12px rgba(232,185,122,0.3)',
    };
  } else if (isHighLevel) {
    extraStyle = {
      animation: 'breathe 3s ease-in-out infinite',
      boxShadow: `0 3px 12px ${hexToRgba(style.border, 0.45)}`,
    };
  } else if (style.kind === 'complete') {
    extraStyle = {
      boxShadow: `0 3px 10px rgba(0,0,0,0.08)`,
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
      className="w-full h-full flex items-center justify-center rounded-xl select-none cursor-grab relative overflow-hidden"
      style={{
        ...bgStyle,
        border: borderStyle,
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
        width={iconSize}
        height={iconSize}
        style={{
          opacity: style.iconOpacity,
          display: 'block',
          filter: iconFilter,
          // No `color` prop — fluent-emoji are multicolor SVG, color would override fills
        }}
      />

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
