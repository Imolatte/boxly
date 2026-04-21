import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useGameStore } from '../../store/gameStore';

const STEPS = [
  {
    icon: 'ph:sparkle-fill',
    iconColor: '#E8B4A0',
    title: 'Создавай части подарков',
    body: 'Тапай "Создать" — на поле появятся части подарков. Каждый тап стоит 1 ⚡',
    hint: 'Нажми кнопку "Создать" внизу экрана',
    highlightArea: 'create',
  },
  {
    icon: 'ph:arrows-merge',
    iconColor: '#A8C5B8',
    title: 'Объединяй одинаковые',
    body: 'Перетаскивай две одинаковые части друг на друга — получишь целый подарок',
    hint: 'Просто потяни один предмет на такой же',
    highlightArea: 'board',
  },
  {
    icon: 'ph:books-fill',
    iconColor: '#E8B4A0',
    title: 'Собери всю коллекцию',
    body: 'Получи 10 уникальных коллекционок — слей два подарка lvl 10. Редкие предметы светятся!',
    hint: 'Коллекция хранится на вкладке "Коллекция"',
    highlightArea: 'collection',
  },
];

const TOTAL = STEPS.length;

export function OnboardingOverlay(): JSX.Element | null {
  const step = useGameStore((s) => s.ui.onboardingStep);
  const advance = useGameStore((s) => s.advanceOnboarding);

  const isVisible = step < TOTAL;
  const current = STEPS[step];

  const isLast = step === TOTAL - 1;

  return createPortal(
    <AnimatePresence>
      {isVisible && current && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center pb-36"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: 'rgba(42,38,32,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={advance}
        >
          <motion.div
            key={step}
            initial={{ y: 24, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-4 w-full max-w-sm"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(250,247,242,0.99) 100%)',
              borderRadius: 24,
              padding: '20px 22px',
              boxShadow: `
                inset 0 1.5px 0 rgba(255,255,255,0.9),
                0 16px 48px rgba(42,38,32,0.22),
                0 4px 12px rgba(42,38,32,0.1)
              `,
              border: '1px solid rgba(229,223,214,0.7)',
            }}
          >
            {/* Step dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 20 : 6,
                    height: 6,
                    background: i === step
                      ? 'linear-gradient(90deg, #F0C4B0, #E8B4A0)'
                      : i < step
                        ? 'rgba(232,180,160,0.4)'
                        : 'rgba(229,223,214,0.7)',
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${current.iconColor}22`,
                  border: `1.5px solid ${current.iconColor}44`,
                  boxShadow: `0 4px 16px ${current.iconColor}33`,
                }}
              >
                <Icon icon={current.icon} width={28} height={28} style={{ color: current.iconColor }} />
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-2">
              <div className="text-base font-bold text-boxly-text mb-1.5">{current.title}</div>
              <div className="text-sm text-boxly-text/60 leading-relaxed">{current.body}</div>
            </div>

            {/* Hint */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mt-3 mb-4"
              style={{
                background: 'rgba(229,223,214,0.35)',
                border: '1px solid rgba(229,223,214,0.6)',
              }}
            >
              <Icon icon="ph:info" width={14} height={14} style={{ color: 'rgba(42,38,32,0.4)', flexShrink: 0 }} />
              <span className="text-xs text-boxly-text/45">{current.hint}</span>
            </div>

            {/* Button */}
            <button
              onClick={advance}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
              style={{
                background: 'linear-gradient(150deg, #F2C8B2 0%, #E8B4A0 50%, #D89A84 100%)',
                boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.35), 0 3px 12px rgba(232,180,160,0.4)',
              }}
            >
              <span
                className="absolute top-0 left-6 right-6 h-px rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.45)' }}
              />
              {isLast ? 'Понятно, играть!' : 'Далее →'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
