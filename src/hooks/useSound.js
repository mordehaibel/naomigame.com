import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/storage';

// יצירת צלילים ב-Web Audio API (בלי קבצים חיצוניים)
function playTone(freq, duration = 0.1, type = 'sine', volume = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore audio errors silently
  }
}

const SOUNDS = {
  click: () => playTone(700, 0.05, 'square', 0.1),
  success: () => {
    playTone(523, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 80);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 160);
  },
  fail: () => {
    playTone(200, 0.15, 'sawtooth', 0.15);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.15), 100);
  },
  point: () => playTone(880, 0.08, 'triangle', 0.15),
  fanfare: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.15, 'triangle', 0.25), i * 100)
    );
  },
};

export function useSound() {
  const [enabled, setEnabled] = useState(storage.getSoundEnabled());

  useEffect(() => {
    storage.setSoundEnabled(enabled);
  }, [enabled]);

  const play = useCallback(
    (name) => {
      if (!enabled) return;
      SOUNDS[name]?.();
    },
    [enabled]
  );

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, play, toggle };
}
