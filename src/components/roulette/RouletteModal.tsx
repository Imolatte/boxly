import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { GIFT_CONFIGS } from '../../config/gifts';
import { COLLECTIBLE_CONFIGS } from '../../config/collectibles';
import type { RouletteReward } from '../../types/events';
import { selection, impact } from '../../telegram/haptics';
import { sfx } from '../../audio/sfx';

type SpinState = 'spinning' | 'stopped';

interface SectorDef {
  label: string;
  icon: string;
  bg: string;
}

const SECTOR_DEFS: SectorDef[] = [
  { label: '+10 ⚡',    icon: 'ph:lightning',      bg: '#F5D5C8' },
  { label: '+25 ⚡',    icon: 'ph:lightning',      bg: '#F2C8A8' },
  { label: '+50 ⚡',    icon: 'ph:lightning',      bg: '#F0B8B8' },
  { label: '+100 ⚡',   icon: 'ph:lightning',      bg: '#ECBFA8' },
  { label: '+200 XP',   icon: 'ph:star',           bg: '#D4C9A8' },
  { label: '+500 XP',   icon: 'ph:star-four',      bg: '#C5D4B0' },
  { label: 'Подарок',   icon: 'ph:gift',           bg: '#B0D4C0' },
  { label: 'Редкий',    icon: 'ph:crown-simple',   bg: '#A8C8D4' },
  { label: 'Легенда',   icon: 'ph:trophy',         bg: '#B8A8D4' },
  { label: 'Коллекция', icon: 'ph:moon-stars',     bg: '#D4A8C8' },
];

const SECTOR_COUNT = SECTOR_DEFS.length;
const FULL_ANGLE = 360;
const SECTOR_ANGLE = FULL_ANGLE / SECTOR_COUNT;

function rewardToSectorIndex(reward: RouletteReward): number {
  if (reward.kind === 'energy') {
    if (reward.amount === 10) return 0;
    if (reward.amount === 25) return 1;
    if (reward.amount === 50) return 2;
    return 3;
  }
  if (reward.kind === 'xp') {
    return reward.amount === 200 ? 4 : 5;
  }
  if (reward.kind === 'gift') {
    const item = reward.item;
    if (item.kind === 'collectible') return 9;
    const lvl = item.level;
    if (lvl <= 5) return 6;
    if (lvl <= 8) return 7;
    return 8;
  }
  return 9;
}

function buildSectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

interface WheelProps {
  rotation: number;
}

function Wheel({ rotation }: WheelProps): JSX.Element {
  const cx = 150;
  const cy = 150;
  const r = 138;
  const labelR = 100;

  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%' }}
    >
      {SECTOR_DEFS.map((def, i) => {
        const startAngle = i * SECTOR_ANGLE - 90;
        const endAngle = startAngle + SECTOR_ANGLE;
        const midAngle = startAngle + SECTOR_ANGLE / 2;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const lx = cx + labelR * Math.cos(toRad(midAngle));
        const ly = cy + labelR * Math.sin(toRad(midAngle));

        return (
          <g key={i}>
            <path
              d={buildSectorPath(cx, cy, r, startAngle, endAngle)}
              fill={def.bg}
              stroke="#FAF7F2"
              strokeWidth="2"
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="600"
              fill="#2A2620"
              transform={`rotate(${midAngle + 90}, ${lx}, ${ly})`}
            >
              {def.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="18" fill="#FAF7F2" stroke="#E5DFD6" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="6" fill="#E8B4A0" />
    </svg>
  );
}

function RewardDisplay({ reward }: { reward: RouletteReward }): JSX.Element {
  const emojiStyle: React.CSSProperties = { fontSize: 56, lineHeight: 1, userSelect: 'none' };
  const labelStyle: React.CSSProperties = { color: '#2A2620', fontSize: 18, fontWeight: 700 };

  if (reward.kind === 'energy') {
    return (
      <>
        <span style={emojiStyle}>⚡</span>
        <span style={labelStyle}>+{reward.amount}</span>
      </>
    );
  }

  if (reward.kind === 'xp') {
    return (
      <>
        <span style={emojiStyle}>⭐</span>
        <span style={labelStyle}>+{reward.amount} XP</span>
      </>
    );
  }

  if (reward.kind === 'gift' && reward.item.kind === 'complete') {
    const cfg = GIFT_CONFIGS[reward.item.level];
    return (
      <>
        <span style={emojiStyle}>{cfg.icon}</span>
        <span style={labelStyle}>Подарок {reward.item.level} lvl</span>
      </>
    );
  }

  if (reward.kind === 'collectible') {
    const cfg = COLLECTIBLE_CONFIGS[reward.id];
    return (
      <>
        <span style={emojiStyle}>{cfg.icon}</span>
        <span style={labelStyle}>{cfg.name}</span>
      </>
    );
  }
  return <span style={labelStyle}>Награда</span>;
}

export function RouletteModal(): JSX.Element | null {
  const activeRoulette = useGameStore((s) => s.ui.activeRoulette);
  const applyRouletteReward = useGameStore((s) => s.applyRouletteReward);

  const [spinState, setSpinState] = useState<SpinState>('spinning');
  const [rotation, setRotation] = useState(0);
  const prevRewardRef = useRef<RouletteReward | null>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeRoulette) {
      setSpinState('spinning');
      setRotation(0);
      prevRewardRef.current = null;
      if (spinIntervalRef.current !== null) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
      return;
    }

    if (prevRewardRef.current === activeRoulette) return;
    prevRewardRef.current = activeRoulette;

    const targetSector = rewardToSectorIndex(activeRoulette);
    // Arrow points up, which in SVG coordinates is -90deg.
    // Sector i center at rotation R sits at: (i*36 + 18 - 90 + R) mod 360.
    // Solve for it ≡ -90: R = -(i*36 + 18) mod 360.
    const finalAngle = -(targetSector * SECTOR_ANGLE + SECTOR_ANGLE / 2);
    const spins = 5 * 360;
    const normalized = ((finalAngle % 360) + 360) % 360;
    const totalRotation = spins + normalized;

    selection();
    setSpinState('spinning');
    setRotation(totalRotation);

    spinIntervalRef.current = setInterval(() => {
      sfx.rouletteSpin();
    }, 80);

    const timer = setTimeout(() => {
      impact('heavy');
      if (spinIntervalRef.current !== null) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
      sfx.rouletteStop();
      setSpinState('stopped');
      if (activeRoulette.kind === 'collectible') {
        setTimeout(() => sfx.collectible(), 400);
      }
    }, 3800);

    return () => {
      clearTimeout(timer);
      if (spinIntervalRef.current !== null) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
    };
  }, [activeRoulette]);

  function handleClaim(): void {
    if (activeRoulette) {
      applyRouletteReward(activeRoulette);
    }
    useGameStore.setState((s) => ({ ui: { ...s.ui, activeRoulette: null } }));
  }

  return (
    <AnimatePresence>
      {activeRoulette ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(42,38,32,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="bg-boxly-bg rounded-3xl px-6 py-8 flex flex-col items-center gap-5 mx-4 w-full max-w-xs"
          >
            <h2 className="text-xl font-bold text-boxly-text">Рулетка!</h2>

            <div className="relative w-[300px] h-[300px] flex-shrink-0">
              <motion.div
                style={{ width: '100%', height: '100%' }}
                animate={{ rotate: rotation }}
                transition={
                  spinState === 'spinning'
                    ? { duration: 3.6, ease: [0.15, 0.85, 0.35, 1.0] }
                    : { duration: 0 }
                }
              >
                <Wheel rotation={0} />
              </motion.div>

              {/* Arrow pointer */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
                style={{ pointerEvents: 'none' }}
              >
                <svg width="24" height="28" viewBox="0 0 24 28">
                  <polygon points="12,28 2,4 22,4" fill="#E8B4A0" stroke="#FAF7F2" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {spinState === 'stopped' ? (
              <div className="w-full flex flex-col items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-1"
                >
                  {activeRoulette ? <RewardDisplay reward={activeRoulette} /> : null}
                </motion.div>
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleClaim}
                  className="w-full py-3 rounded-2xl font-bold text-base text-white"
                  style={{ background: 'linear-gradient(135deg, #EFC0A8 0%, #E8B4A0 100%)' }}
                >
                  Забрать
                </motion.button>
              </div>
            ) : (
              <div className="h-[46px] flex items-center">
                <span className="text-sm text-boxly-text/50">Крутится...</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
