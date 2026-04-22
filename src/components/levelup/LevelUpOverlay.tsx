import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { sfx } from '../../audio/sfx';

export function LevelUpOverlay(): JSX.Element | null {
  const levelUp = useGameStore((s) => s.ui.levelUp);
  const dismissLevelUp = useGameStore((s) => s.dismissLevelUp);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!levelUp || firedRef.current) return;
    firedRef.current = true;

    sfx.levelUp();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#E8B4A0', '#A8C5B8', '#F5D5C8', '#D4A8C8', '#D4C9A8'],
    });

    return () => {
      firedRef.current = false;
    };
  }, [levelUp]);

  return (
    <AnimatePresence>
      {levelUp ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(42,38,32,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={dismissLevelUp}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="bg-boxly-bg rounded-3xl px-8 py-10 flex flex-col items-center gap-4 mx-6 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-boxly-text text-center">
              Уровень {levelUp.level}!
            </h2>
            <div className="flex flex-col items-center gap-1">
              <p className="text-base text-boxly-text/80">+{levelUp.energyBonus} ⚡ энергии</p>
              <p className="text-base text-boxly-text/80">+{levelUp.capBonus} к cap энергии</p>
            </div>
            <button
              onClick={dismissLevelUp}
              className="mt-2 w-full py-3 rounded-2xl font-bold text-base text-white"
              style={{ background: 'linear-gradient(135deg, #EFC0A8 0%, #E8B4A0 100%)' }}
            >
              Ура!
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
