import { useGameStore } from '../store/gameStore';

function isSoundEnabled(): boolean {
  return useGameStore.getState().ui.soundEnabled;
}

function canPlay(): boolean {
  if (!isSoundEnabled()) return false;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new AudioContext();
    }
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  type: OscillatorType,
  gainPeak: number,
  attackMs: number,
  decayMs: number,
  startOffset = 0,
): void {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime + startOffset;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainPeak, now + attackMs / 1000);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (attackMs + decayMs) / 1000);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + (attackMs + decayMs) / 1000 + 0.01);
}

class Sfx {
  tap(): void {
    if (!canPlay()) return;
    try {
      playTone(600, 'sine', 0.18, 5, 40);
    } catch {}
  }

  merge(): void {
    if (!canPlay()) return;
    try {
      playTone(660, 'sine', 0.16, 5, 100);
      playTone(880, 'sine', 0.12, 5, 100);
    } catch {}
  }

  levelUp(): void {
    if (!canPlay()) return;
    try {
      // WHY: C5 E5 G5 C6 - major arpeggio fanfare
      const notes = [523, 659, 784, 1047];
      const stepMs = 80;
      notes.forEach((freq, i) => {
        playTone(freq, 'triangle', 0.2, 5, 140, (i * stepMs) / 1000);
      });
    } catch {}
  }

  rouletteSpin(): void {
    if (!canPlay()) return;
    try {
      playTone(1000, 'square', 0.06, 2, 20);
    } catch {}
  }

  rouletteStop(): void {
    if (!canPlay()) return;
    try {
      // WHY: A4 C#5 E5 - A major chord
      playTone(440, 'sine', 0.18, 5, 250);
      playTone(554, 'sine', 0.14, 5, 250);
      playTone(659, 'sine', 0.12, 5, 250);
    } catch {}
  }

  sell(): void {
    if (!canPlay()) return;
    try {
      const c = getCtx();
      if (!c) return;
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.155);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  collectible(): void {
    if (!canPlay()) return;
    try {
      const c = getCtx();
      if (!c) return;
      const now = c.currentTime;

      // WHY: glissando 660->1320 Hz over 300ms + delay echo
      const createGlide = (delaySeconds: number, gainPeak: number): void => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        const t = now + delaySeconds;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, t);
        osc.frequency.exponentialRampToValueAtTime(1320, t + 0.3);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(gainPeak, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.31);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t);
        osc.stop(t + 0.32);
      };

      createGlide(0, 0.22);
      createGlide(0.18, 0.12);
      createGlide(0.32, 0.06);
    } catch {}
  }
}

export const sfx = new Sfx();
