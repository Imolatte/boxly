import type { CollectibleId } from '../types/gift';

export interface CollectibleConfig {
  id: CollectibleId;
  label: string;
  name: string;
  icon: string;
  color: string;
}

export const COLLECTIBLE_IDS: CollectibleId[] = [
  'col_1', 'col_2', 'col_3', 'col_4', 'col_5',
  'col_6', 'col_7', 'col_8', 'col_9', 'col_10',
];

export const COLLECTIBLE_CONFIGS: Record<CollectibleId, CollectibleConfig> = {
  col_1:  { id: 'col_1',  label: 'Collectible 1',  name: 'Луна',      icon: 'fluent-emoji:crescent-moon',           color: '#E0D4F0' },
  col_2:  { id: 'col_2',  label: 'Collectible 2',  name: 'Солнце',    icon: 'fluent-emoji:sun',                     color: '#F5E4C0' },
  col_3:  { id: 'col_3',  label: 'Collectible 3',  name: 'Кот',       icon: 'fluent-emoji:cat-face',                color: '#F0D4E0' },
  col_4:  { id: 'col_4',  label: 'Collectible 4',  name: 'Бабочка',   icon: 'fluent-emoji:butterfly',               color: '#E4D4F5' },
  col_5:  { id: 'col_5',  label: 'Collectible 5',  name: 'Гриб',      icon: 'fluent-emoji:mushroom',                color: '#D4F0E4' },
  col_6:  { id: 'col_6',  label: 'Collectible 6',  name: 'Перо',      icon: 'fluent-emoji:feather',                 color: '#F0E8D4' },
  col_7:  { id: 'col_7',  label: 'Collectible 7',  name: 'Листик',    icon: 'fluent-emoji:four-leaf-clover',        color: '#D4EECC' },
  col_8:  { id: 'col_8',  label: 'Collectible 8',  name: 'Снежинка',  icon: 'fluent-emoji:snowflake',               color: '#D4E8F5' },
  col_9:  { id: 'col_9',  label: 'Collectible 9',  name: 'Планета',   icon: 'fluent-emoji:ringed-planet',           color: '#D8D4F0' },
  col_10: { id: 'col_10', label: 'Collectible 10', name: 'Компас',    icon: 'fluent-emoji:compass',                 color: '#F0D8D4' },
};
