import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps): JSX.Element | null {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(42,38,32,0.45)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="max-w-sm w-full mx-4 relative"
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(250,247,242,0.98) 100%)',
              borderRadius: 24,
              padding: 24,
              boxShadow: `
                inset 0 1.5px 0 rgba(255,255,255,0.9),
                0 8px 40px rgba(42,38,32,0.18),
                0 2px 8px rgba(42,38,32,0.08)
              `,
              border: '1px solid rgba(229,223,214,0.7)',
            }}
          >
            {/* Top highlight bar */}
            <span
              className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{ background: 'rgba(255,255,255,0.85)' }}
            />

            {title ? (
              <h2 className="text-lg font-bold text-boxly-text mb-4">{title}</h2>
            ) : null}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
