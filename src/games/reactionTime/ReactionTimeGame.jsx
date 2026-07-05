import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Zap } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const TOTAL_ROUNDS = 5;
const DIFFICULTIES = {
  easy: { minDelay: 2000, maxDelay: 5000 },
  medium: { minDelay: 1000, maxDelay: 3500 },
  hard: { minDelay: 500, maxDelay: 2000 },
};

// stages: 'idle' | 'waiting' | 'go' | 'tooEarly' | 'between' | 'done'
export default function ReactionTimeGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [difficulty, setDifficulty] = useState('medium');
  const [stage, setStage] = useState('idle');
  const [round, setRound] = useState(0);
  const [results, setResults] = useState([]); // ms per round
  const [lastReaction, setLastReaction] = useState(null);
  const [resultData, setResultData] = useState(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const highScore = currentUser?.gameStats?.['reaction-time']?.highScore || 0;

  // ניקיון של setTimeout שנותר
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // התחלת סבב
  const startRound = () => {
    setStage('waiting');
    setLastReaction(null);
    const { minDelay, maxDelay } = DIFFICULTIES[difficulty];
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    timeoutRef.current = setTimeout(() => {
      setStage('go');
      startTimeRef.current = performance.now();
    }, delay);
  };

  const handleStart = () => {
    play('click');
    setRound(0);
    setResults([]);
    setLastReaction(null);
    setResultData(null);
    setStage('waiting');
    startRound();
  };

  const handleClick = () => {
    if (stage === 'waiting') {
      // לחץ לפני שהיה אדום - false start
      clearTimeout(timeoutRef.current);
      setStage('tooEarly');
      play('fail');
      return;
    }
    if (stage === 'go') {
      const reaction = Math.round(performance.now() - startTimeRef.current);
      setLastReaction(reaction);
      const newResults = [...results, reaction];
      setResults(newResults);
      play('point');

      if (round + 1 >= TOTAL_ROUNDS) {
        // סיום המשחק
        finishGame(newResults);
      } else {
        setRound(round + 1);
        setStage('between');
      }
    }
  };

  const finishGame = (allResults) => {
    const avg = allResults.reduce((a, b) => a + b, 0) / allResults.length;
    // חישוב ניקוד: ככל שמהר יותר - יותר נקודות. בסיס 100 נקודות פחות 1 לכל ms מעל 200
    const score = Math.max(0, Math.round(150 - (avg - 200) / 8));
    setStage('done');

    const pts = calculatePoints(score, 'reaction');
    const result = addGameScore('reaction-time', score, pts);
    setResultData({ ...result, score, avg });
    if (result.newRecord) play('fanfare');
    else play('success');
  };

  const handleNextRound = () => {
    play('click');
    startRound();
  };

  const handleRetryEarly = () => {
    play('click');
    startRound();
  };

  const reset = () => {
    clearTimeout(timeoutRef.current);
    setStage('idle');
    setRound(0);
    setResults([]);
    setLastReaction(null);
    setResultData(null);
  };

  // צבע ותוכן הלוח לפי שלב
  const board =
    stage === 'idle'
      ? { bg: 'bg-pink-100', icon: '⚡', title: t('games.reaction-time.title'), desc: t('games.reaction-time.intro') }
      : stage === 'waiting'
      ? { bg: 'bg-error-red', icon: '🔴', title: t('games.reaction-time.waitTitle'), desc: t('games.reaction-time.waitDesc') }
      : stage === 'go'
      ? { bg: 'bg-success-green', icon: '🟢', title: t('games.reaction-time.goTitle'), desc: t('games.reaction-time.goDesc') }
      : stage === 'tooEarly'
      ? { bg: 'bg-accent-orange', icon: '⚠️', title: t('games.reaction-time.tooEarly'), desc: t('games.reaction-time.tooEarlyDesc') }
      : stage === 'between'
      ? { bg: 'bg-blue-100', icon: '✨', title: `${lastReaction} ${t('gameUI.msAbbr')}!`, desc: t('games.reaction-time.betweenDesc', round + 1, TOTAL_ROUNDS) }
      : { bg: 'bg-pink-100', icon: '🎯', title: t('games.reaction-time.doneTitle'), desc: '' };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      {/* בקרים עליונים */}
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">
            ⚡ {t('gameUI.round')}: {Math.min(round + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
          </div>
          {results.length > 0 && (
            <div className="bg-secondary/20 px-3 py-2 rounded-2xl text-sm font-bold">
              {t('games.reaction-time.avg')}: {Math.round(results.reduce((a, b) => a + b, 0) / results.length)} {t('gameUI.msAbbr')}
            </div>
          )}
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">
              ⭐ {t('gameUI.record')}: {highScore}
            </div>
          )}
        </div>
        {stage === 'idle' && (
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm"
          >
            <option value="easy">{t('games.reaction-time.descEasy')}</option>
            <option value="medium">{t('games.reaction-time.descMedium')}</option>
            <option value="hard">{t('games.reaction-time.descHard')}</option>
          </select>
        )}
      </div>

      {/* לוח המשחק - לחיץ */}
      <AnimatePresence mode="wait">
        <motion.button
          key={stage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={
            stage === 'waiting' || stage === 'go'
              ? handleClick
              : stage === 'tooEarly'
              ? handleRetryEarly
              : stage === 'between'
              ? handleNextRound
              : stage === 'idle'
              ? handleStart
              : undefined
          }
          disabled={stage === 'done'}
          className={`
            w-full aspect-square max-w-[min(100%,calc(100dvh_-_345px))] mx-auto rounded-3xl
            flex flex-col items-center justify-center text-white p-8
            transition-all duration-300
            ${stage === 'go' ? 'animate-pulse' : ''}
            ${stage === 'done' ? 'opacity-80 cursor-default' : 'cursor-pointer hover:brightness-110 active:brightness-95'}
          `}
          style={{
            background:
              stage === 'waiting'
                ? 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #c92a2a 100%)'
                : stage === 'go'
                ? 'radial-gradient(circle at 30% 30%, #6ee7b7 0%, #059669 100%)'
                : stage === 'tooEarly'
                ? 'radial-gradient(circle at 30% 30%, #fb923c 0%, #c2410c 100%)'
                : stage === 'between'
                ? 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #4fc3f7 100%)'
                : stage === 'idle'
                ? 'linear-gradient(135deg, #ffeef8 0%, #ffd4ec 50%, #fec0e2 100%)'
                : 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)',
            boxShadow:
              stage === 'waiting'
                ? '0 0 60px rgba(220,38,38,0.6), 0 20px 50px rgba(0,0,0,0.3), inset 0 4px 12px rgba(255,255,255,0.25)'
                : stage === 'go'
                ? '0 0 80px rgba(16,185,129,0.7), 0 20px 50px rgba(16,185,129,0.4), inset 0 4px 12px rgba(255,255,255,0.4)'
                : stage === 'tooEarly'
                ? '0 0 60px rgba(234,88,12,0.6), 0 20px 50px rgba(0,0,0,0.3)'
                : '0 14px 40px rgba(79,195,247,0.35), inset 0 4px 12px rgba(255,255,255,0.5)',
            color: stage === 'between' || stage === 'idle' ? '#5b21b6' : '#fff',
          }}
        >
          <div className="text-8xl md:text-9xl mb-4">{board.icon}</div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 text-center">{board.title}</h2>
          <p className="text-lg opacity-90 text-center">{board.desc}</p>
        </motion.button>
      </AnimatePresence>

      {/* פירוט תוצאות */}
      {results.length > 0 && stage !== 'done' && (
        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {results.map((r, i) => (
            <div key={i} className="bg-white px-3 py-1 rounded-full text-sm font-bold shadow">
              {i + 1}: {r}{t('gameUI.msAbbr')}
            </div>
          ))}
        </div>
      )}

      {/* כפתור reset */}
      {stage !== 'idle' && stage !== 'done' && (
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset} className="mt-4">
          {t('common.restart')}
        </Button>
      )}

      {!results.length && stage === 'idle' && (
        <Button variant="primary" size="lg" icon={Play} onClick={handleStart} className="mt-4">
          {t('common.start')}
        </Button>
      )}

      <GameResultModal
        open={stage === 'done' && !!resultData}
        isWin={resultData?.score >= 50}
        score={resultData?.score || 0}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
