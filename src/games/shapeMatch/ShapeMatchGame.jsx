import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
const COLORS = ['#FF6B9D', '#4ECDC4', '#FFD93D', '#9B59B6', '#FF8C42', '#48BB78'];

const LEVELS = {
  easy: { options: 3, time: 25 },
  medium: { options: 4, time: 30 },
  hard: { options: 6, time: 30 },
};

function buildRound(numOptions) {
  const target = {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
  const options = [target];
  while (options.length < numOptions) {
    const opt = {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    if (!options.some((o) => o.shape === opt.shape && o.color === opt.color)) {
      options.push(opt);
    }
  }
  return { target, options: options.sort(() => Math.random() - 0.5) };
}

function ShapeIcon({ shape, color, size = 60 }) {
  const s = size;
  if (shape === 'circle') return <svg width={s} height={s}><circle cx={s/2} cy={s/2} r={s/2 - 4} fill={color} /></svg>;
  if (shape === 'square') return <svg width={s} height={s}><rect x="4" y="4" width={s-8} height={s-8} rx="6" fill={color} /></svg>;
  if (shape === 'triangle') return <svg width={s} height={s}><polygon points={`${s/2},4 ${s-4},${s-4} 4,${s-4}`} fill={color} /></svg>;
  if (shape === 'star') return <svg width={s} height={s} viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill={color} /></svg>;
  if (shape === 'heart') return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z" fill={color} /></svg>;
  if (shape === 'diamond') return <svg width={s} height={s}><polygon points={`${s/2},4 ${s-4},${s/2} ${s/2},${s-4} 4,${s/2}`} fill={color} /></svg>;
  return null;
}

export default function ShapeMatchGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('easy');
  const [round, setRound] = useState(() => buildRound(LEVELS.easy.options));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(LEVELS.easy.time);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [resultData, setResultData] = useState(null);

  const highScore = currentUser?.gameStats?.['shape-match']?.highScore || 0;

  const next = useCallback(() => {
    setRound(buildRound(LEVELS[level].options));
  }, [level]);

  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          setDone(true);
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
    const result = addGameScore('shape-match', score, pts);
    setResultData(result);
    if (result.newRecord) play('fanfare');
  }, [done, score, addGameScore, play, resultData]);

  const handleClick = (opt) => {
    if (!running || feedback) return;
    if (opt.shape === round.target.shape && opt.color === round.target.color) {
      setScore((s) => s + 10);
      setFeedback('correct');
      play('point');
      setTimeout(() => { setFeedback(null); next(); }, 250);
    } else {
      setFeedback('wrong');
      play('fail');
      setTimeout(() => setFeedback(null), 350);
    }
  };

  const handleStart = () => {
    play('click');
    setScore(0);
    setTime(LEVELS[level].time);
    setRunning(true);
    setDone(false);
    setResultData(null);
    next();
  };

  const timePercent = (time / LEVELS[level].time) * 100;

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
          <select value={level} onChange={(e) => { setLevel(e.target.value); setTime(LEVELS[e.target.value].time); }} className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm">
            <option value="easy">{t('games.shape-match.descEasy')}</option>
            <option value="medium">{t('games.shape-match.descMedium')}</option>
            <option value="hard">{t('games.shape-match.descHard')}</option>
          </select>
        )}
      </div>

      <div className="w-full mb-4">
        <span className="font-bold text-sm">⏱️ {time}{t('gameUI.secAbbr')}</span>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
          <motion.div className={`h-full ${timePercent < 30 ? 'bg-error-red' : 'bg-success-green'}`} animate={{ width: `${timePercent}%` }} />
        </div>
      </div>

      {running ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${round.target.shape}-${round.target.color}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-6 rounded-3xl shadow-lg mb-4 ${feedback === 'correct' ? 'bg-green-100' : feedback === 'wrong' ? 'bg-red-100' : 'bg-white'}`}
            >
              <div className="text-center text-sm text-gray-600 mb-2">{t('games.shape-match.findShape')}</div>
              <div className="flex justify-center"><ShapeIcon {...round.target} size={100} /></div>
            </motion.div>
          </AnimatePresence>
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            {round.options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleClick(opt)}
                className="aspect-square bg-white rounded-2xl shadow flex items-center justify-center hover:shadow-lg transition"
              >
                <ShapeIcon {...opt} size={70} />
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 w-full">
          <div className="text-5xl mb-3">🔷</div>
          <h3 className="text-2xl font-bold mb-2">{t('games.shape-match.title')}</h3>
          <p className="text-gray-600 mb-6">{t('games.shape-match.instructions')}</p>
          <Button variant="primary" size="lg" icon={Play} onClick={handleStart}>{t('common.start')}</Button>
        </div>
      )}

      <GameResultModal
        open={done && !!resultData}
        isWin={score >= 80}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
