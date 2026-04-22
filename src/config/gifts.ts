import type { GiftLevel } from '../types/gift';

export interface GiftConfig {
  level: GiftLevel;
  label: string;
  icon: string;
  color: string;
}

// icon = native emoji character (rendered by OS font, much faster than SVG)
export const GIFT_CONFIGS: Record<GiftLevel, GiftConfig> = {
  1:  { level: 1,  label: 'Gift 1',  icon: '🎁', color: '#F5D5C8' },
  2:  { level: 2,  label: 'Gift 2',  icon: '🧸', color: '#F2C8A8' },
  3:  { level: 3,  label: 'Gift 3',  icon: '💗', color: '#F0B8B8' },
  4:  { level: 4,  label: 'Gift 4',  icon: '🌸', color: '#ECBFA8' },
  5:  { level: 5,  label: 'Gift 5',  icon: '🌟', color: '#D4C9A8' },
  6:  { level: 6,  label: 'Gift 6',  icon: '🥇', color: '#C5D4B0' },
  7:  { level: 7,  label: 'Gift 7',  icon: '👑', color: '#B0D4C0' },
  8:  { level: 8,  label: 'Gift 8',  icon: '💎', color: '#A8C8D4' },
  9:  { level: 9,  label: 'Gift 9',  icon: '🏆', color: '#B8A8D4' },
  10: { level: 10, label: 'Gift 10', icon: '✨', color: '#D4A8C8' },
};
