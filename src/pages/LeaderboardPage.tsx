import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { fetchTopPlayers, type LeaderboardEntry, type MyRank } from '../leaderboard/client';
import { getTelegramUser } from '../telegram/sdk';

interface RowProps {
  rank: number;
  name: string;
  level: number;
  xpTotal: number;
  isMe: boolean;
  striped?: boolean;
  topOfCard?: boolean;
}

function Row({ rank, name, level, xpTotal, isMe, striped, topOfCard }: RowProps): JSX.Element {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        background: isMe ? 'rgba(232,180,160,0.22)' : striped ? 'rgba(229,223,214,0.18)' : 'transparent',
        borderTop: topOfCard ? 'none' : '1px solid rgba(229,223,214,0.35)',
      }}
    >
      <div className="flex-shrink-0 w-10 flex items-center justify-center">
        {medal ? (
          <span style={{ fontSize: 26, lineHeight: 1 }}>{medal}</span>
        ) : (
          <span className="text-base font-bold" style={{ color: 'rgba(42,38,32,0.5)' }}>{rank}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: isMe ? '#C47B5A' : '#2a2620' }}
          >
            {name}
          </span>
          {isMe ? (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
              style={{ background: '#E8B4A0', color: '#fff' }}
            >
              ты
            </span>
          ) : null}
        </div>
        <div className="text-xs" style={{ color: 'rgba(42,38,32,0.5)' }}>
          {xpTotal.toLocaleString('ru')} XP
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
        <span className="text-base font-bold leading-none">{level}</span>
      </div>
    </div>
  );
}

export function LeaderboardPage(): JSX.Element {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [me, setMe] = useState<MyRank | null>(null);
  const [error, setError] = useState(false);
  const tgUser = getTelegramUser();
  const myId = tgUser ? String(tgUser.id) : null;

  useEffect(() => {
    let cancelled = false;
    setError(false);
    fetchTopPlayers()
      .then((res) => {
        if (cancelled) return;
        setEntries(res.entries);
        setMe(res.me);
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
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#2a2620' }}>Топ-5 игроков</h1>
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
        {entries.map((entry, idx) => (
          <Row
            key={entry.userId}
            rank={idx + 1}
            name={entry.name}
            level={entry.level}
            xpTotal={entry.xpTotal}
            isMe={myId !== null && entry.userId === myId}
            striped={idx % 2 === 1}
            topOfCard={idx === 0}
          />
        ))}
      </div>

      {me ? (
        <>
          <div className="flex items-center gap-3 px-2" style={{ color: 'rgba(42,38,32,0.35)' }}>
            <span className="flex-1 h-px" style={{ background: 'rgba(229,223,214,0.8)' }} />
            <span className="text-xs">из {me.total}</span>
            <span className="flex-1 h-px" style={{ background: 'rgba(229,223,214,0.8)' }} />
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(232,180,160,0.5)',
              boxShadow: '0 2px 12px rgba(232,180,160,0.18)',
            }}
          >
            <Row
              rank={me.rank}
              name={me.name}
              level={me.level}
              xpTotal={me.xpTotal}
              isMe={true}
              topOfCard={true}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
