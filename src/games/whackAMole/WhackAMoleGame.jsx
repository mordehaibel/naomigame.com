import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';
import MoleIcon from '../../components/games/MoleIcon';

const GAME_DURATION = 30; // שניות
const HOLE_COUNT = 9; // 3x3
const DIFFICULTIES = {
  easy: { moleTime: 1400, spawnInterval: 1000 },
  medium: { moleTime: 1000, spawnInterval: 750 },
  hard: { moleTime: 600, spawnInterval: 550 },
};

export default function WhackAMoleGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [difficulty, setDifficulty] = useState('medium');
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [time, setTime] = useState(GAME_DURATION);
  const [moles, setMoles] = useState(new Set()); // hole indices currently showing
  const [hits, setHits] = useState({}); // visual feedback - {idx: timestamp}
  const [done, setDone] = useState(false);
  const [resultData, setResultData] = useState(null);

  const moleTimersRef = useRef({}); // idx -> timeoutId
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);

  const highScore = currentUser?.gameStats?.['whack-a-mole']?.highScore || 0;

  const cleanup = useCallback(() => {
    Object.values(moleTimersRef.current).forEach(clearTimeout);
    moleTimersRef.current = {};
    clearInterval(spawnTimerRef.current);
    clearInterval(gameTimerRef.current);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const spawnMole = useCallback(() => {
    setMoles((prev) => {
      // בחר חור אקראי שלא תפוס
      const available = [];
      for (let i = 0; i < HOLE_COUNT; i++) {
        if (!prev.has(i)) available.push(i);
      }
      if (available.length === 0) return prev;
      const idx = available[Math.floor(Math.random() * available.length)];
      const next = new Set(prev);
      next.add(idx);

      // טיימר להעלמה
      moleTimersRef.current[idx] = setTimeout(() => {
        setMoles((m) => {
          const newSet = new Set(m);
          if (newSet.has(idx)) {
            newSet.delete(idx);
            setMissed((mi) => mi + 1);
          }
          return newSet;
        });
        delete moleTimersRef.current[idx];
      }, DIFFICULTIES[difficulty].moleTime);

      return next;
    });
  }, [difficulty]);

  const startGame = () => {
    play('click');
    cleanup();
    setScore(0);
    setMissed(0);
    setTime(GAME_DURATION);
    setMoles(new Set());
    setHits({});
    setDone(false);
    setResultData(null);
    setRunning(true);

    // טיימר משחק
    gameTimerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          // סיום
          cleanup();
          setRunning(false);
          setMoles(new Set());
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // טיימר ספאון
    spawnTimerRef.current = setInterval(spawnMole, DIFFICULTIES[difficulty].spawnInterval);
    // ספאון ראשון מיידי
    spawnMole();
  };

  // סיום משחק
  useEffect(() => {
    if (running || done) return;
    if (time === 0 && score >= 0 && (score > 0 || missed > 0)) {
      setDone(true);
      const pts = calculatePoints(score * 5, 'reaction');
      const result = addGameScore('whack-a-mole', score * 10, pts);
      setResultData(result);
      play(result.newRecord ? 'fanfare' : 'success');
    }
  }, [running, time, score, missed, done, addGameScore, play]);

  const handleHit = (idx) => {
    if (!running) return;
    if (!moles.has(idx)) return;
    play('point');
    clearTimeout(moleTimersRef.current[idx]);
    delete moleTimersRef.current[idx];
    setMoles((m) => {
      const next = new Set(m);
      next.delete(idx);
      return next;
    });
    setScore((s) => s + 1);
    setHits((h) => ({ ...h, [idx]: Date.now() }));
    // ניקוי הפידבק אחרי 0.4ש׳
    setTimeout(() => {
      setHits((h) => {
        const copy = { ...h };
        delete copy[idx];
        return copy;
      });
    }, 400);
  };

  const reset = () => {
    cleanup();
    setRunning(false);
    setScore(0);
    setMissed(0);
    setTime(GAME_DURATION);
    setMoles(new Set());
    setHits({});
    setDone(false);
    setResultData(null);
  };

  const timePercent = (time / GAME_DURATION) * 100;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      {/* בקרים עליונים */}
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">
            {t('games.whack-a-mole.hits')}: {score}
          </div>
          <div className="bg-error-red/20 px-3 py-2 rounded-2xl text-sm font-bold">
            {t('games.whack-a-mole.misses')}: {missed}
          </div>
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">
              ⭐ {t('gameUI.record')}: {highScore}
            </div>
          )}
        </div>
        {!running && (
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm"
          >
            <option value="easy">{t('games.whack-a-mole.descEasy')}</option>
            <option value="medium">{t('games.whack-a-mole.descMedium')}</option>
            <option value="hard">{t('games.whack-a-mole.descHard')}</option>
          </select>
        )}
      </div>

      {/* טיימר */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold">⏱️ {t('gameUI.time')}: {time}{t('gameUI.secAbbr')}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              timePercent < 30 ? 'bg-error-red' : timePercent < 60 ? 'bg-accent-orange' : 'bg-success-green'
            }`}
            animate={{ width: `${timePercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* רשת חורים - דשא תוסס מודרני */}
      <div
        className="grid grid-cols-3 gap-3 md:gap-4 w-full aspect-square p-4 rounded-3xl mx-auto"
        style={{
          maxWidth: 'min(28rem, calc(100dvh - 490px))',
          background:
            'radial-gradient(circle at 30% 20%, #84cc16 0%, transparent 50%), radial-gradient(circle at 70% 80%, #65a30d 0%, transparent 60%), linear-gradient(180deg, #4ade80 0%, #16a34a 50%, #15803d 100%)',
          boxShadow:
            '0 25px 60px rgba(21,128,61,0.45), inset 0 4px 12px rgba(255,255,255,0.2), inset 0 -8px 20px rgba(0,0,0,0.25)',
        }}
      >
        {Array.from({ length: HOLE_COUNT }).map((_, idx) => (
          <Hole
            key={idx}
            hasMole={moles.has(idx)}
            wasHit={!!hits[idx]}
            onClick={() => handleHit(idx)}
          />
        ))}
      </div>

      {!running && !done && (
        <Button variant="primary" size="lg" icon={Play} onClick={startGame} className="mt-4">
          {score > 0 ? t('common.playAgain') : t('common.start')}
        </Button>
      )}

      {running && (
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset} className="mt-4">
          {t('common.restart')}
        </Button>
      )}

      <GameResultModal
        open={done && !!resultData}
        isWin={score >= 10}
        score={score * 10}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={startGame}
      />
    </div>
  );
}

function Hole({ hasMole, wasHit, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-accent-yellow/50"
      style={{
        background:
          'radial-gradient(circle at 50% 30%, #78350f 0%, #451a03 60%, #1c0701 100%)',
        boxShadow:
          'inset 0 8px 16px rgba(0,0,0,0.6), inset 0 -2px 6px rgba(120,53,15,0.4), 0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* עומק החור - אליפסה כהה במרכז עם זוהר עדין */}
      <div
        className="absolute inset-3 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, #1f0a02 0%, #000 70%)',
          boxShadow: 'inset 0 6px 14px rgba(0,0,0,0.8)',
        }}
      />

      <AnimatePresence>
        {hasMole && (
          <motion.div
            key="mole"
            initial={{ y: '60%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '60%', opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-2 flex items-end justify-center"
          >
            <MoleIcon />
          </motion.div>
        )}
      </AnimatePresence>

      {/* פידבק פגיעה */}
      <AnimatePresence>
        {wasHit && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none"
          >
            ⭐
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

