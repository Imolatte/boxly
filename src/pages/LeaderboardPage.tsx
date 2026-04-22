import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { fetchTopPlayers, type LeaderboardEntry } from '../leaderboard/client';
import { getTelegramUser } from '../telegram/sdk';

export function LeaderboardPage(): JSX.Element {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState(false);
  const me = getTelegramUser();

  useEffect(() => {
    let cancelled = false;
    setError(false);
    fetchTopPlayers()
      .then((res) => {
        if (!cancelled) setEntries(res);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (entries === null) {
    return (
      <div className="px-4 pt-10 flex flex-col items-center gap-3" style={{ color: 'rgba(42,38,32,0.5)' }}>
        <Icon icon="ph:spinner" width={24} height={24} className="animate-spin" />
        <span className="text-sm">Загружаем топ...</span>
      </div>
    );
  }

  if (error || entries.length === 0) {
    return (
      <div className="px-4 pt-10 flex flex-col items-center gap-3 text-center">
        <span style={{ fontSize: 44 }}>🏆</span>
        <p className="text-sm" style={{ color: 'rgba(42,38,32,0.6)' }}>
          Пока никто не засветился в топе — играй и попади первым!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6 flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#2a2620' }}>Топ игроков</h1>
        <p className="text-sm" style={{ color: 'rgba(42,38,32,0.55)' }}>
          Рейтинг по уровню и опыту. Обновляется при каждом апе.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.75)',
          border: '1px solid rgba(229,223,214,0.7)',
          boxShadow: '0 2px 12px rgba(42,38,32,0.06)',
        }}
      >
        {entries.map((entry, idx) => {
          const isMe = me && String(me.id) === entry.userId;
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
          return (
            <div
              key={entry.userId}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: isMe ? 'rgba(232,180,160,0.18)' : idx % 2 === 0 ? 'transparent' : 'rgba(229,223,214,0.18)',
                borderTop: idx === 0 ? 'none' : '1px solid rgba(229,223,214,0.35)',
              }}
            >
              <div className="flex-shrink-0 w-10 flex items-center justify-center">
                {medal ? (
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{medal}</span>
                ) : (
                  <span className="text-base font-bold" style={{ color: 'rgba(42,38,32,0.5)' }}>
                    {idx + 1}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: isMe ? '#C47B5A' : '#2a2620' }}
                  >
                    {entry.name}
                  </span>
                  {isMe ? (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background: '#E8B4A0', color: '#fff' }}
                    >
                      ты
                    </span>
                  ) : null}
                </div>
                <div className="text-xs" style={{ color: 'rgba(42,38,32,0.5)' }}>
                  {entry.xpTotal.toLocaleString('ru')} XP
                </div>
              </div>
              <div
                className="flex-shrink-0 rounded-lg px-2.5 py-1 flex items-center gap-1"
                style={{
                  background: 'linear-gradient(135deg, #F2C8B2 0%, #E8B4A0 100%)',
                  color: '#fff',
                }}
              >
                <span className="text-[10px] font-semibold opacity-80">LVL</span>
                <span className="text-base font-bold leading-none">{entry.level}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center pt-1" style={{ color: 'rgba(42,38,32,0.4)' }}>
        Показаны 20 игроков с наивысшим уровнем.
      </p>
    </div>
  );
}
