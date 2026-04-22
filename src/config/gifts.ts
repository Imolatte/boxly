import type { GiftLevel } from '../types/gift';

export interface GiftConfig {
  level: GiftLevel;
  label: string;
  icon: string;
  color: string;
}

export const GIFT_CONFIGS: Record<GiftLevel, GiftConfig> = {
  1:  { level: 1,  label: 'Gift 1',  icon: 'fluent-emoji:wrapped-gift',     color: '#F5D5C8' },
  2:  { level: 2,  label: 'Gift 2',  icon: 'fluent-emoji:teddy-bear',       color: '#F2C8A8' },
  3:  { level: 3,  label: 'Gift 3',  icon: 'fluent-emoji:growing-heart',    color: '#F0B8B8' },
  4:  { level: 4,  label: 'Gift 4',  icon: 'fluent-emoji:cherry-blossom',   color: '#ECBFA8' },
  5:  { level: 5,  label: 'Gift 5',  icon: 'fluent-emoji:glowing-star',     color: '#D4C9A8' },
  6:  { level: 6,  label: 'Gift 6',  icon: 'fluent-emoji:1st-place-medal',  color: '#C5D4B0' },
  7:  { level: 7,  label: 'Gift 7',  icon: 'fluent-emoji:crown',            color: '#B0D4C0' },
  8:  { level: 8,  label: 'Gift 8',  icon: 'fluent-emoji:gem-stone',        color: '#A8C8D4' },
  9:  { level: 9,  label: 'Gift 9',  icon: 'fluent-emoji:trophy',           color: '#B8A8D4' },
  10: { level: 10, label: 'Gift 10', icon: 'fluent-emoji:sparkles',         color: '#D4A8C8' },
};
