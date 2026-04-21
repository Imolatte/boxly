interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = '' }: ProgressBarProps): JSX.Element {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={`w-full h-2 bg-boxly-border rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-boxly-peach rounded-full"
        style={{ width: `${pct}%`, transition: 'width 0.4s ease' }}
      />
    </div>
  );
}
