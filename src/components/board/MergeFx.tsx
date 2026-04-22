interface MergeFxProps {
  type: 'merge' | 'sell';
}

export function MergeFx({ type }: MergeFxProps): JSX.Element {
  const bg = type === 'merge' ? 'rgba(232,180,160,0.7)' : 'rgba(168,197,184,0.7)';
  return (
    <div
      className="absolute inset-0 rounded-xl pointer-events-none z-10"
      style={{
        background: bg,
        filter: 'blur(6px)',
        animation: 'merge-fx-pop 0.35s ease-out forwards',
      }}
    />
  );
}
