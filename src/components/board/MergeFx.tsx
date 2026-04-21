import { motion } from 'framer-motion';

interface MergeFxProps {
  type: 'merge' | 'sell';
}

export function MergeFx({ type }: MergeFxProps): JSX.Element {
  const bg = type === 'merge' ? 'rgba(232,180,160,0.7)' : 'rgba(168,197,184,0.7)';

  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none z-10"
      style={{ background: bg, filter: 'blur(6px)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 1] }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    />
  );
}
