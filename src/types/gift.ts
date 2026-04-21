export type GiftLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type CollectibleId =
  | 'col_1'
  | 'col_2'
  | 'col_3'
  | 'col_4'
  | 'col_5'
  | 'col_6'
  | 'col_7'
  | 'col_8'
  | 'col_9'
  | 'col_10';

export type GiftItem =
  | { kind: 'part'; level: GiftLevel }
  | { kind: 'intermediate'; level: 6 | 7 | 8 | 9 | 10 }
  | { kind: 'complete'; level: GiftLevel }
  | { kind: 'collectible'; id: CollectibleId };
