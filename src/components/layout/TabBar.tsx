import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export type TabId = 'game' | 'collection' | 'leaderboard' | 'info' | 'profile';

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: string; iconActive: string }[] = [
  { id: 'game', label: 'Игра', icon: 'ph:game-controller', iconActive: 'ph:game-controller-fill' },
  { id: 'collection', label: 'Коллекция', icon: 'ph:books', iconActive: 'ph:books-fill' },
  { id: 'leaderboard', label: 'Топ', icon: 'ph:trophy', iconActive: 'ph:trophy-fill' },
  { id: 'info', label: 'Инфо', icon: 'ph:info', iconActive: 'ph:info-fill' },
  { id: 'profile', label: 'Профиль', icon: 'ph:user-circle', iconActive: 'ph:user-circle-fill' },
];

export function TabBar({ active, onChange }: TabBarProps): JSX.Element {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'linear-gradient(180deg, rgba(250,247,242,0.92) 0%, rgba(250,247,242,0.98) 100%)',
        borderTop: '1px solid rgba(229,223,214,0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.1 }}
            className="flex-1 min-h-14 py-2 flex flex-col items-center justify-center gap-0.5 relative"
            style={{ color: isActive ? '#E8B4A0' : 'rgba(42,38,32,0.38)', transition: 'color 0.2s' }}
          >
            {/* Active pill indicator — layoutId animates between tabs */}
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute top-0 rounded-full"
                style={{
                  width: 28,
                  height: 3,
                  left: 'calc(50% - 14px)',
                  background: 'linear-gradient(90deg, #F0C4B0 0%, #E8B4A0 50%, #D89A84 100%)',
                  boxShadow: '0 1px 6px rgba(232,180,160,0.5)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}

            <Icon
              icon={isActive ? tab.iconActive : tab.icon}
              width={22}
              height={22}
            />
            <span
              className="text-[10px] font-medium leading-none"
              style={{ transition: 'color 0.2s' }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
