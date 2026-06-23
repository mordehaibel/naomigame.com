import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const LEVELS = {
  easy: { types: ['arithmetic'], time: 45 },
  medium: { types: ['arithmetic', 'geometric'], time: 45 },
  hard: { types: ['arithmetic', 'geometric', 'fibonacci', 'square'], time: 45 },
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// המרת סוג סדרה למפתח תרגום
const TYPE_KEYS = { arithmetic: 'typeArith', geometric: 'typeGeo', fibonacci: 'typeFib', square: 'typeSquare' };

function genArithmetic() {
  const start = randInt(1, 10);
  const diff = randInt(2, 9);
  const seq = [start, start + diff, start + diff * 2, start + diff * 3];
  return { seq, answer: start + diff * 4, typeKey: 'arithmetic' };
}

function genGeometric() {
  const start = randInt(1, 5);
  const ratio = randInt(2, 4);
  const seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
  return { seq, answer: start * ratio ** 4, typeKey: 'geometric' };
}

function genFibonacci() {
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const proper = [a, b];
  for (let i = 0; i < 3; i++) proper.push(proper[i] + proper[i + 1]);
  return { seq: proper.slice(0, 4), answer: proper[4], typeKey: 'fibonacci' };
}

function genSquare() {
  const start = randInt(1, 5);
  const seq = [start ** 2, (start + 1) ** 2, (start + 2) ** 2, (start + 3) ** 2];
  return { seq, answer: (start + 4) ** 2, typeKey: 'square' };
}

function genQuestion(level) {
  const types = LEVELS[level].types;
  const t = types[Math.floor(Math.random() * types.length)];
  if (t === 'arithmetic') return genArithmetic();
  if (t === 'geometric') return genGeometric();
  if (t === 'fibonacci') return genFibonacci();
  if (t === 'square') return genSquare();
  return genArithmetic();
}

function genChoices(correct) {
  const set = new Set([correct]);
  while (set.size < 4) {
    const v = correct + randInt(-5, 5) * (Math.random() < 0.5 ? 1 : 2);
    if (v !== correct && v >= 0) set.add(v);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function NumberSequenceGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('easy');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(LEVELS.easy.time);
  const [question, setQuestion] = useState(() => genQuestion('easy'));
  const [choices, setChoices] = useState(() => genChoices(question.answer));
  const [feedback, setFeedback] = useState(null);
  const [resultData, setResultData] = useState(null);

  const highScore = currentUser?.gameStats?.['number-sequence']?.highScore || 0;

  const newQ = useCallback(() => {
    const q = genQuestion(level);
    setQuestion(q);
    setChoices(genChoices(q.answer));
  }, [level]);

  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) { clearInterval(t); setRunning(false); setDone(true); play('fail'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, done, play]);

  useEffect(() => {
    if (!done || resultData) return;
    const pts = calculatePoints(score, 'math');
    const result = addGameScore('number-sequence', score, pts);
    setResultData(result);
    if (result.newRecord) play('fanfare');
  }, [done, score, addGameScore, play, resultData]);

  const handleAnswer = (val) => {
    if (!running || feedback) return;
    if (val === question.answer) {
      setScore((s) => s + 15);
      setFeedback('correct');
      play('point');
    } else {
      setFeedback('wrong');
      play('fail');
    }
    setTimeout(() => { setFeedback(null); newQ(); }, 700);
  };

  const handleStart = () => {
    play('click');
    setScore(0);
    setTime(LEVELS[level].time);
    setRunning(true);
    setDone(false);
    setResultData(null);
    newQ();
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
            <option value="easy">{t('games.number-sequence.descEasy')}</option>
            <option value="medium">{t('games.number-sequence.descMedium')}</option>
            <option value="hard">{t('games.number-sequence.descHard')}</option>
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
              key={JSON.stringify(question.seq)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-3xl shadow-xl mb-4 w-full ${feedback === 'correct' ? 'bg-green-100' : feedback === 'wrong' ? 'bg-red-100' : 'bg-white'}`}
            >
              <div className="text-center text-sm text-gray-600 mb-2">
                {t('games.number-sequence.seqType', t(`games.number-sequence.${TYPE_KEYS[question.typeKey]}`))}
              </div>
              <div className="flex justify-center items-center gap-3 text-4xl md:text-5xl font-black flex-wrap" dir="ltr">
                {question.seq.map((n, i) => (
                  <span key={i} className="bg-white text-text-primary px-3 py-2 rounded-2xl shadow">{n}</span>
                ))}
                <span className="text-accent-purple">,</span>
                <span className="bg-accent-purple text-white px-3 py-2 rounded-2xl shadow animate-pulse">?</span>
              </div>
              {feedback === 'wrong' && (
                <div className="text-center mt-2 text-error-red font-bold">{t('gameUI.answer')}: {question.answer}</div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {choices.map((c, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: feedback ? 1 : 1.04 }}
                whileTap={{ scale: 0.95 }}
                disabled={!!feedback}
                onClick={() => handleAnswer(c)}
                className={`p-5 rounded-3xl text-2xl font-black shadow-lg ${feedback === 'correct' && c === question.answer ? 'bg-success-green text-white' : feedback === 'wrong' && c === question.answer ? 'bg-success-green text-white' : 'bg-white hover:bg-bg-start'}`}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 w-full">
          <div className="text-5xl mb-3">🔮</div>
          <h3 className="text-2xl font-bold mb-2">{t('games.number-sequence.title')}</h3>
          <p className="text-gray-600 mb-6">{t('games.number-sequence.instructions')}</p>
          <Button variant="primary" size="lg" icon={Play} onClick={handleStart}>{t('common.start')}</Button>
        </div>
      )}

      <GameResultModal
        open={done && !!resultData}
        isWin={score >= 60}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
