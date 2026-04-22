import { getInitData, isTelegramEnv } from '../telegram/sdk';
import { debugLog } from '../components/common/DebugPanel';

const BASE = 'https://boxly-webhook.vercel.app/api';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  level: number;
  xpTotal: number;
}

export async function submitScore(level: number, xpTotal: number): Promise<void> {
  if (!isTelegramEnv()) {
    debugLog(`lb submit skipped: not in Telegram env`);
    return;
  }
  const initData = getInitData();
  if (!initData) {
    debugLog(`lb submit skipped: no initData`);
    return;
  }
  debugLog(`lb submit: lvl=${level} xp=${xpTotal} initDataLen=${initData.length}`);
  try {
    const res = await fetch(`${BASE}/leaderboard-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, level, xpTotal }),
      keepalive: true,
    });
    const text = await res.text().catch(() => '');
    debugLog(`lb submit resp ${res.status}: ${text.slice(0, 140)}`);

    // On 401 — also call debug-verify to see HMAC detail
    if (res.status === 401) {
      try {
        const dbg = await fetch(`${BASE}/debug-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        const dbgText = await dbg.text();
        debugLog(`hmac dbg: ${dbgText.slice(0, 400)}`);
      } catch {
        // ignore
      }
    }
  } catch (e) {
    debugLog(`lb submit error: ${(e as Error).message ?? 'unknown'}`);
  }
}

export interface MyRank {
  rank: number;
  userId: string;
  name: string;
  level: number;
  xpTotal: number;
  total: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  me: MyRank | null;
}

export async function fetchTopPlayers(): Promise<LeaderboardResponse> {
  try {
    const initData = getInitData();
    const res = await fetch(`${BASE}/leaderboard-top`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    if (!res.ok) return { entries: [], me: null };
    return (await res.json()) as LeaderboardResponse;
  } catch {
    return { entries: [], me: null };
  }
}
