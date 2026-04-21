import { isTelegramEnv } from '../telegram/sdk';
import { localFallback } from './localFallback';
import { cloudStorage } from './cloudStorage';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function getStorage(): StorageAdapter {
  return isTelegramEnv() ? cloudStorage : localFallback;
}
