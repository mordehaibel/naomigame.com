import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import DifficultySelector from '../../components/games/DifficultySelector';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';
import { getDefaultDifficulty, getMathTier } from '../../utils/difficulty';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// תרגיל לפי טייר גיל ורמת קושי
// tier1 (5-8): + - up to 10
// tier2 (9-12): + - up to 20, simple ×
// tier3 (13-16): × ÷ up to 144
// tier4 (17-20): division with decimals, larger numbers
function genQuestion(tier, level) {
  if (tier === 'tier1') {
    // גיל 5-8: חיבור וחיסור עד 10
    if (level === 'easy') {
      // חיבור פשוט עד 5+5
      const a = randInt(1, 5);
      const b = randInt(1, 5);
      return { text: `${a} + ${b}`, answer: a + b };
    }
    if (level === 'medium') {
      // + או - עד 10
      const op = Math.random() > 0.5 ? '+' : '-';
      let a = randInt(1, 10), b = randInt(1, 10);
      if (op === '-' && b > a) [a, b] = [b, a];
      return { text: `${a} ${op} ${b}`, answer: op === '+' ? a + b : a - b };
    }
    // hard: + - מעורבב עד 10, פעולה כפולה לפעמים
    const op1 = Math.random() > 0.5 ? '+' : '-';
    let a = randInt(1, 10), b = randInt(1, 8);
    if (op1 === '-' && b > a) [a, b] = [b, a];
    return { text: `${a} ${op1} ${b}`, answer: op1 === '+' ? a + b : a - b };
  }

  if (tier === 'tier2') {
    // גיל 9-12: עד 20 + כפל פשוט
    if (level === 'easy') {
      const op = Math.random() > 0.5 ? '+' : '-';
      let a = randInt(5, 20), b = randInt(1, 15);
      if (op === '-' && b > a) [a, b] = [b, a];
      return { text: `${a} ${op} ${b}`, answer: op === '+' ? a + b : a - b };
    }
    if (level === 'medium') {
      // כפל פשוט עד 5×5
      const a = randInt(2, 5);
      const b = randInt(2, 6);
      return { text: `${a} × ${b}`, answer: a * b };
    }
    // hard: + - × מעורבב, עד 20
    const ops = ['+', '-', '×'];
    const op = ops[randInt(0, 2)];
    if (op === '×') {
      const a = randInt(2, 7), b = randInt(2, 7);
      return { text: `${a} × ${b}`, answer: a * b };
    }
    let a = randInt(5, 20), b = randInt(2, 15);
    if (op === '-' && b > a) [a, b] = [b, a];
    return { text: `${a} ${op} ${b}`, answer: op === '+' ? a + b : a - b };
  }

  if (tier === 'tier3') {
    // גיל 13-16: × ÷ עד 144
    if (level === 'easy') {
      const a = randInt(2, 9);
      const b = randInt(2, 12);
      return { text: `${a} × ${b}`, answer: a * b };
    }
    if (level === 'medium') {
      // חילוק נקי
      const b = randInt(2, 12);
      const ans = randInt(2, 12);
      return { text: `${b * ans} ÷ ${b}`, answer: ans };
    }
    // hard: כפל גדול עד 12×12
    const a = randInt(6, 12);
    const b = randInt(6, 12);
    return { text: `${a} × ${b}`, answer: a * b };
  }

  // tier4 (גיל 17-20): חילוק עם עשרוניות, מספרים גדולים
  if (level === 'easy') {
    // חילוק נקי גדול
    const b = randInt(3, 15);
    const ans = randInt(5, 20);
    return { text: `${b * ans} ÷ ${b}`, answer: ans };
  }
  if (level === 'medium') {
    // כפל גדול
    const a = randInt(11, 25);
    const b = randInt(2, 12);
    return { text: `${a} × ${b}`, answer: a * b };
  }
  // hard: חילוק עם תוצאה עשרונית פשוטה (חצי / רבע)
  const halfChoices = [
    { a: 9, b: 2, ans: 4.5 },
    { a: 15, b: 2, ans: 7.5 },
    { a: 25, b: 2, ans: 12.5 },
    { a: 5, b: 4, ans: 1.25 },
    { a: 21, b: 4, ans: 5.25 },
    { a: 11, b: 4, ans: 2.75 },
    { a: 17, b: 2, ans: 8.5 },
    { a: 33, b: 2, ans: 16.5 },
  ];
  const c = halfChoices[randInt(0, halfChoices.length - 1)];
  return { text: `${c.a} ÷ ${c.b}`, answer: c.ans };
}

function genChoices(correct) {
  const choices = new Set([correct]);
  const isDecimal = correct % 1 !== 0;
  while (choices.size < 4) {
    let v;
    if (isDecimal) {
      // לעשרוניות - וריאציות עדינות
      const variation = (randInt(-4, 4)) * 0.25;
      v = +(correct + variation).toFixed(2);
    } else {
      const variation = randInt(-5, 5);
      v = correct + variation;
    }
    if (v !== correct && v >= 0) choices.add(v);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

const TIME_PER_LEVEL = { easy: 35, medium: 30, hard: 30 };

export default function QuickMathGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const tier = getMathTier(currentUser?.age);
  const [level, setLevel] = useState(() => getDefaultDifficulty(currentUser?.age));
  const [phase, setPhase] = useState('select'); // 'select' | 'playing' | 'done'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(TIME_PER_LEVEL.easy);
  const [question, setQuestion] = useState(() => genQuestion(tier, getDefaultDifficulty(currentUser?.age)));
  const [choices, setChoices] = useState(() => genChoices(question.answer));
  const [feedback, setFeedback] = useState(null);
  const [resultData, setResultData] = useState(null);

  const highScore = currentUser?.gameStats?.math?.highScore || 0;

  const startNew = useCallback(() => {
    const q = genQuestion(tier, level);
    setQuestion(q);
    setChoices(genChoices(q.answer));
  }, [tier, level]);

  // טיימר
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTime((sec) => {
        if (sec <= 1) {
          clearInterval(t);
          setPhase('done');
          play('fail');
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, play]);

  useEffect(() => {
    if (phase !== 'done' || resultData) return;
    const points = calculatePoints(score, 'math');
    const result = addGameScore('math', score, points);
    setResultData(result);
    if (result.newRecord) play('fanfare');
  }, [phase, score, addGameScore, play, resultData]);

  const handleAnswer = (val) => {
    if (phase !== 'playing' || feedback) return;
    if (val === question.answer) {
      const newStreak = streak + 1;
      const bonus = newStreak >= 3 ? 5 : 0;
      setScore((s) => s + 10 + bonus);
      setStreak(newStreak);
      setFeedback('correct');
      play('point');
    } else {
      setStreak(0);
      setFeedback('wrong');
      play('fail');
    }
    setTimeout(() => {
      setFeedback(null);
      startNew();
    }, 600);
  };

  const handleStart = () => {
    play('click');
    setScore(0);
    setStreak(0);
    setTime(TIME_PER_LEVEL[level]);
    setResultData(null);
    setPhase('playing');
    startNew();
  };

  const timePercent = (time / TIME_PER_LEVEL[level]) * 100;

  if (phase === 'select') {
    const tierLabel = t(`games.math.tierAge${tier === 'tier1' ? '58' : tier === 'tier2' ? '912' : tier === 'tier3' ? '1316' : '1720'}`);
    const tierDesc = t(`games.math.${tier}`);
    return (
      <div className="flex flex-col items-center">
        <DifficultySelector
          current={level}
          onSelect={setLevel}
          onStart={handleStart}
          emoji="🧮"
          title={t('games.math.titleWithTier', tierLabel)}
          recommendedAge={currentUser?.age}
          descriptions={tierDesc}
        />
        <p className="text-xs text-gray-500 mt-3 text-center max-w-md">
          {t('games.math.ageNote', currentUser?.age)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {t('gameUI.score')}: {score}</div>
          {streak >= 2 && (
            <div className="bg-accent-orange/30 px-3 py-2 rounded-2xl text-sm font-bold animate-pulse">
              🔥 {t('gameUI.streak')} x{streak}
            </div>
          )}
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPhase('select')}>{t('difficulty.changeLevel')}</Button>
      </div>

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

      <AnimatePresence mode="wait">
        <motion.div
          key={question.text}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center mb-6 p-8 rounded-3xl w-full transition-colors duration-300"
          style={{
            background:
              feedback === 'correct'
                ? 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)'
                : feedback === 'wrong'
                ? 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)'
                : 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #4fc3f7 100%)',
            boxShadow:
              feedback === 'correct'
                ? '0 12px 40px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.5)'
                : feedback === 'wrong'
                ? '0 12px 40px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.5)'
                : '0 14px 40px rgba(79,195,247,0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <div className="text-5xl md:text-6xl font-black mb-2 font-mono" dir="ltr">
            {question.text} = ?
          </div>
          {feedback === 'correct' && (
            <div className="text-2xl text-success-green font-bold">{t('gameUI.correct')}</div>
          )}
          {feedback === 'wrong' && (
            <div className="text-2xl text-error-red font-bold">
              ✗ {t('gameUI.answer')}: {question.answer}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 w-full">
        {choices.map((c) => (
          <motion.button
            key={c}
            whileHover={{ scale: feedback ? 1 : 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(c)}
            disabled={!!feedback}
            className="p-6 rounded-3xl text-3xl font-black transition-all"
            style={{
              background:
                (feedback === 'correct' && c === question.answer) ||
                (feedback === 'wrong' && c === question.answer)
                  ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #fff5fb 50%, #ffeef8 100%)',
              color:
                (feedback === 'correct' && c === question.answer) ||
                (feedback === 'wrong' && c === question.answer)
                  ? '#fff'
                  : '#5b21b6',
              boxShadow:
                (feedback === 'correct' && c === question.answer) ||
                (feedback === 'wrong' && c === question.answer)
                  ? '0 10px 30px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.4)'
                  : '0 8px 24px rgba(196,113,237,0.2), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0 1px rgba(196,113,237,0.15)',
            }}
          >
            {c}
          </motion.button>
        ))}
      </div>

      <GameResultModal
        open={phase === 'done' && !!resultData}
        isWin={score > 30}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
