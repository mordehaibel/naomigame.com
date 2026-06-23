import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../../../hooks/useSound';
import { useT } from '../../../hooks/useT';

const COLORS = [
  { id: 0, bg: '#EF4444', light: '#FCA5A5', tone: 392 },
  { id: 1, bg: '#22C55E', light: '#86EFAC', tone: 523 },
  { id: 2, bg: '#3B82F6', light: '#93C5FD', tone: 659 },
  { id: 3, bg: '#FACC15', light: '#FEF08A', tone: 784 },
];

function playTone(freq, duration = 0.2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
}

// מיני-משחק Simon Says - הצג סדר, בקש לחזור עליו, הוסף איבר.
// {length} = אורך הסדר הסופי שצריך להגיע
export default function SimonSays({ config, onComplete, accent }) {
  const { play } = useSound();
  const { t } = useT();
  const { length } = config;

  const [sequence, setSequence] = useState(() => [Math.floor(Math.random() * 4)]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'showing' | 'input' | 'success' | 'fail'
  const [activeBtn, setActiveBtn] = useState(null);
  const showingTimerRef = useRef(null);

  const cleanup = useCallback(() => {
    clearTimeout(showingTimerRef.current);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // הצגת הסדר
  const showSequence = useCallback(
    (seq) => {
      setPhase('showing');
      setActiveBtn(null);
      let i = 0;
      const showNext = () => {
        if (i >= seq.length) {
          setActiveBtn(null);
          setPhase('input');
          setPlayerIdx(0);
          return;
        }
        const colorIdx = seq[i];
        setActiveBtn(colorIdx);
        playTone(COLORS[colorIdx].tone, 0.3);
        showingTimerRef.current = setTimeout(() => {
          setActiveBtn(null);
          showingTimerRef.current = setTimeout(showNext, 200);
          i += 1;
        }, 500);
      };
      showingTimerRef.current = setTimeout(showNext, 600);
    },
    []
  );

  // הצג סדר ראשוני בעת mount
  useEffect(() => {
    showSequence(sequence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonPress = (colorIdx) => {
    if (phase !== 'input') return;
    setActiveBtn(colorIdx);
    playTone(COLORS[colorIdx].tone, 0.25);
    setTimeout(() => setActiveBtn(null), 200);

    if (colorIdx === sequence[playerIdx]) {
      // נכון
      const nextIdx = playerIdx + 1;
      if (nextIdx === sequence.length) {
        // השלמנו את כל הסדר
        if (sequence.length >= length) {
          // ניצחון
          setPhase('success');
          play('success');
          setTimeout(() => onComplete(true, sequence.length * 20), 800);
        } else {
          // הוספת איבר חדש והמשך
          const newSeq = [...sequence, Math.floor(Math.random() * 4)];
          setSequence(newSeq);
          setTimeout(() => showSequence(newSeq), 800);
        }
      } else {
        setPlayerIdx(nextIdx);
      }
    } else {
      // טעות
      setPhase('fail');
      play('fail');
      setTimeout(() => onComplete(false, Math.max(0, (sequence.length - 1) * 10)), 800);
    }
  };

  const phaseText =
    phase === 'showing'
      ? t('games.adventure.simonListen')
      : phase === 'input'
      ? t('games.adventure.simonRepeat', playerIdx, sequence.length)
      : phase === 'success'
      ? t('games.adventure.simonSuccess')
      : phase === 'fail'
      ? t('games.adventure.simonFail')
      : '';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white/90 px-3 py-2 rounded-2xl text-sm font-bold">
          {t('games.adventure.simonRound')}: {sequence.length}/{length}
        </div>
        <div className="bg-white/90 px-3 py-2 rounded-2xl text-sm font-bold">
          {phaseText}
        </div>
      </div>

      {/* רשת 2x2 של כפתורים */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs aspect-square">
        {COLORS.map((c) => {
          const isActive = activeBtn === c.id;
          return (
            <motion.button
              key={c.id}
              onClick={() => handleButtonPress(c.id)}
              disabled={phase !== 'input'}
              whileHover={phase === 'input' ? { scale: 1.03 } : {}}
              whileTap={phase === 'input' ? { scale: 0.95 } : {}}
              className="aspect-square rounded-3xl shadow-2xl transition-all duration-150 disabled:cursor-default"
              style={{
                backgroundColor: isActive ? c.light : c.bg,
                boxShadow: isActive
                  ? `0 0 60px ${c.bg}, 0 0 30px ${c.light}, inset 0 0 30px rgba(255,255,255,0.5)`
                  : '0 8px 16px rgba(0,0,0,0.3)',
                opacity: phase === 'showing' && !isActive ? 0.4 : 1,
              }}
            >
              <span className="sr-only">{c.id}</span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-sm text-white/90 max-w-xs">
        {t('games.adventure.simonHowTo')}
      </p>
    </div>
  );
}
