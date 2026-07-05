import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const LEVELS = {
  easy: { count: 16, baseTime: 30 },
  medium: { count: 24, baseTime: 30 },
  hard: { count: 36, baseTime: 30 },
};

function buildBoard(count) {
  const numbers = Array.from({ length: count }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  return numbers;
}

function pickTarget(board) {
  return board[Math.floor(Math.random() * board.length)];
}

export default function NumberHuntGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('easy');
  const [board, setBoard] = useState(() => buildBoard(LEVELS.easy.count));
  const [target, setTarget] = useState(() => pickTarget(buildBoard(LEVELS.easy.count)));
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(LEVELS.easy.baseTime);
  const [feedback, setFeedback] = useState(null);
  const [resultData, setResultData] = useState(null);

  const highScore = currentUser?.gameStats?.['number-hunt']?.highScore || 0;

  const newRound = useCallback(() => {
    const b = buildBoard(LEVELS[level].count);
    setBoard(b);
    setTarget(pickTarget(b));
  }, [level]);

  const reset = useCallback(() => {
    setRunning(false);
    setDone(false);
    setScore(0);
    setTime(LEVELS[level].baseTime);
    setFeedback(null);
    setResultData(null);
    newRound();
  }, [level, newRound]);

  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          clearInterval(t);
          setDone(true);
          setRunning(false);
          play('fail');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, done, play]);

  useEffect(() => {
    if (!done || resultData) return;
    const pts = calculatePoints(score, 'reaction');
    const result = addGameScore('number-hunt', score, pts);
    setResultData(result);
    if (result.newRecord) play('fanfare');
  }, [done, score, addGameScore, play, resultData]);

  const handleClick = (n) => {
    if (!running || feedback) return;
    if (n === target) {
      setScore((s) => s + 10);
      setFeedback('correct');
      play('point');
      setTimeout(() => {
        setFeedback(null);
        newRound();
      }, 250);
    } else {
      setFeedback('wrong');
      play('fail');
      setTimeout(() => setFeedback(null), 300);
    }
  };

  const handleStart = () => {
    play('click');
    setScore(0);
    setTime(LEVELS[level].baseTime);
    setRunning(true);
    setDone(false);
    setResultData(null);
    newRound();
  };

  const cols = level === 'easy' ? 4 : level === 'medium' ? 6 : 6;
  const timePercent = (time / LEVELS[level].baseTime) * 100;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {t('gameUI.score')}: {score}</div>
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
          )}
        </div>
        {!running && (
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setTime(LEVELS[e.target.value].baseTime);
            }}
            className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm"
          >
            <option value="easy">{t('games.number-hunt.descEasy')}</option>
            <option value="medium">{t('games.number-hunt.descMedium')}</option>
            <option value="hard">{t('games.number-hunt.descHard')}</option>
          </select>
        )}
      </div>

      {/* Timer */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold">⏱️ {t('gameUI.time')}: {time}{t('gameUI.secAbbr')}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${timePercent < 30 ? 'bg-error-red' : timePercent < 60 ? 'bg-accent-orange' : 'bg-success-green'}`}
            animate={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {running ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={target}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mb-4 text-center p-5 rounded-3xl shadow-lg w-full max-w-xs ${feedback === 'correct' ? 'bg-green-100' : feedback === 'wrong' ? 'bg-red-100' : 'bg-white'}`}
            >
              <div className="text-sm text-gray-600 mb-1">{t('games.number-hunt.findIt')}</div>
              <div className="text-7xl font-black text-primary">{target}</div>
            </motion.div>
          </AnimatePresence>

          <div className="grid gap-2 w-full mx-auto max-w-[260px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {board.map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleClick(n)}
                className="aspect-square bg-white hover:bg-bg-start rounded-2xl shadow font-black text-2xl md:text-3xl transition-colors"
              >
                {n}
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 w-full mb-6">
          <div className="text-5xl mb-3">🔢</div>
          <h3 className="text-2xl font-bold mb-2">{t('games.number-hunt.title')}</h3>
          <p className="text-gray-600 mb-6">{t('games.number-hunt.instructions')}</p>
          <Button variant="primary" size="lg" icon={Play} onClick={handleStart}>{t('common.start')}</Button>
        </div>
      )}

      <GameResultModal
        open={done && !!resultData}
        isWin={score >= 50}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
