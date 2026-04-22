import { getInitData, isTelegramEnv } from '../telegram/sdk';

const BASE = 'https://boxly-webhook.vercel.app/api';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  level: number;
  xpTotal: number;
}

export async function submitScore(level: number, xpTotal: number): Promise<void> {
  if (!isTelegramEnv()) return;
  const initData = getInitData();
  if (!initData) return;
  try {
    await fetch(`${BASE}/leaderboard-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, level, xpTotal }),
      keepalive: true,
    });
  } catch {
    // Silent fail — leaderboard is non-critical
  }
}

export async function fetchTopPlayers(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${BASE}/leaderboard-top`);
    if (!res.ok) return [];
    const data = (await res.json()) as { entries?: LeaderboardEntry[] };
    return data.entries ?? [];
  } catch {
    return [];
  }
}
