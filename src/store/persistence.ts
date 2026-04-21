import type { Board } from '../types/board';
import type { PlayerState } from '../types/player';
import { getStorage } from '../storage/storage';

const SAVE_KEY = 'boxly_save_v1';
const SAVE_VERSION = 2;

export interface SaveData {
  board: Board;
  player: PlayerState;
  meta: { version: number; createdAt: number; lastPlayedAt: number };
}

interface StoredSave extends SaveData {
  v: number;
}

export async function loadSave(): Promise<SaveData | null> {
  try {
    const raw = await getStorage().getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSave;
    if (parsed.v !== SAVE_VERSION) return null;
    return { board: parsed.board, player: parsed.player, meta: parsed.meta };
  } catch {
    return null;
  }
}

export async function writeSave(data: SaveData): Promise<void> {
  try {
    const stored: StoredSave = { v: SAVE_VERSION, ...data };
    await getStorage().setItem(SAVE_KEY, JSON.stringify(stored));
  } catch {
    // Ignore write errors
  }
}

export async function clearSave(): Promise<void> {
  await getStorage().removeItem(SAVE_KEY);
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSave(data: SaveData, delayMs = 500): void {
  if (debounceTimer !== null) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    await writeSave(data);
    debounceTimer = null;
  }, delayMs);
}
