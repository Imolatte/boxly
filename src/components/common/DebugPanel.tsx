import { useEffect, useState } from 'react';

type LogEntry = { t: string; m: string };

const MAX_LOGS = 50;
let logs: LogEntry[] = [];
let listeners: Array<() => void> = [];

export function debugLog(message: string): void {
  const t = new Date().toTimeString().slice(0, 8);
  logs = [...logs.slice(-(MAX_LOGS - 1)), { t, m: message }];
  listeners.forEach((fn) => fn());
}

export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('debug');
}

export function DebugPanel(): JSX.Element | null {
  const [, force] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fn = (): void => force((n) => n + 1);
    listeners.push(fn);
    return () => { listeners = listeners.filter((x) => x !== fn); };
  }, []);

  if (!isDebugMode()) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        bottom: 72,
        zIndex: 99999,
        width: open ? 'calc(100vw - 16px)' : 72,
        maxHeight: open ? 240 : 32,
        background: 'rgba(0,0,0,0.82)',
        color: '#9fe',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 10,
        lineHeight: 1.35,
        borderRadius: 8,
        border: '1px solid #2a3',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '4px 8px',
          background: '#1a2a22',
          color: '#9fe',
          cursor: 'pointer',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>DEBUG ({logs.length})</span>
        <span>{open ? '−' : '+'}</span>
      </div>
      {open && (
        <div style={{ padding: 6, overflowY: 'auto', maxHeight: 208 }}>
          {logs.length === 0 && <div style={{ color: '#468' }}>no logs yet</div>}
          {logs.map((l, i) => (
            <div key={i}><span style={{ color: '#468' }}>{l.t}</span> {l.m}</div>
          ))}
        </div>
      )}
    </div>
  );
}
