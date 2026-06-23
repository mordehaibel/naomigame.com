import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const LEVELS = {
  easy: { count: 3, time: 60, maxNum: 9 },
  medium: { count: 4, time: 60, maxNum: 9 },
  hard: { count: 5, time: 70, maxNum: 9 },
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// יוצר חידה: מספרים + יעד שבטוח אפשר להגיע אליו על ידי שילוב מסויים
function genPuzzle(level) {
  const cfg = LEVELS[level];
  const numbers = Array.from({ length: cfg.count }, () => randInt(1, cfg.maxNum));
  // לחישוב יעד - בוא נצרף את כל המספרים ב-+ פשוט עם וריאציה
  // נתחיל עם מספר אקראי ונבנה עם פעולות שונות
  let target;
  let acc = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    const op = ['+', '-', '*'][randInt(0, 2)];
    if (op === '+') acc = acc + numbers[i];
    else if (op === '-') acc = acc - numbers[i];
    else if (op === '*') acc = acc * numbers[i];
  }
  target = Math.abs(acc) || 10;
  if (target > 100) target = target % 50 + 5;
  return { numbers, target };
}

const OPS = ['+', '-', '×', '÷'];

function evalExpression(tokens) {
  // simple eval: tokens are alternating numbers and ops
  if (tokens.length === 0) return null;
  // process * and / first
  let arr = [...tokens];
  let i = 1;
  while (i < arr.length) {
    if (arr[i] === '×' || arr[i] === '÷') {
      const a = Number(arr[i - 1]);
      const b = Number(arr[i + 1]);
      if (arr[i] === '÷' && (b === 0 || a % b !== 0)) return null;
      const v = arr[i] === '×' ? a * b : a / b;
      arr.splice(i - 1, 3, v);
    } else {
      i += 2;
    }
  }
  // now + and -
  let result = Number(arr[0]);
  for (let j = 1; j < arr.length; j += 2) {
    const op = arr[j];
    const n = Number(arr[j + 1]);
    if (op === '+') result += n;
    else if (op === '-') result -= n;
  }
  return result;
}

export default function EquationBuilderGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('easy');
  const [puzzle, setPuzzle] = useState(() => genPuzzle('easy'));
  const [usedNumbers, setUsedNumbers] = useState([]); // indexes used in expr
  const [expression, setExpression] = useState([]); // tokens: numbers (str) and ops
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(LEVELS.easy.time);
  const [solved, setSolved] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const highScore = currentUser?.gameStats?.['equation-builder']?.highScore || 0;

  const newPuzzle = useCallback(() => {
    setPuzzle(genPuzzle(level));
    setUsedNumbers([]);
    setExpression([]);
    setFeedback(null);
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
    const result = addGameScore('equation-builder', score, pts);
    setResultData(result);
    if (result.newRecord) play('fanfare');
  }, [done, score, addGameScore, play, resultData]);

  const handleAddNumber = (idx) => {
    if (usedNumbers.includes(idx)) return;
    // האחרון בביטוי חייב להיות אופרטור או הביטוי ריק
    if (expression.length > 0 && !OPS.includes(expression[expression.length - 1])) return;
    setExpression([...expression, String(puzzle.numbers[idx])]);
    setUsedNumbers([...usedNumbers, idx]);
    play('click');
  };

  const handleAddOp = (op) => {
    if (expression.length === 0) return;
    if (OPS.includes(expression[expression.length - 1])) return;
    setExpression([...expression, op]);
    play('click');
  };

  const handleClear = () => {
    setExpression([]);
    setUsedNumbers([]);
    play('click');
  };

  const handleSubmit = () => {
    if (expression.length === 0) return;
    if (OPS.includes(expression[expression.length - 1])) return;
    const result = evalExpression(expression);
    if (result === puzzle.target) {
      const bonus = usedNumbers.length === puzzle.numbers.length ? 30 : 0; // השתמש בכל המספרים
      setScore((s) => s + 25 + bonus);
      setSolved((n) => n + 1);
      setFeedback('correct');
      play('success');
      setTimeout(() => newPuzzle(), 800);
    } else {
      setFeedback(t('games.equation-builder.gotResult', result));
      play('fail');
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  const handleStart = () => {
    play('click');
    setScore(0);
    setSolved(0);
    setTime(LEVELS[level].time);
    setRunning(true);
    setDone(false);
    setResultData(null);
    newPuzzle();
  };

  const timePercent = (time / LEVELS[level].time) * 100;

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {t('gameUI.score')}: {score}</div>
          <div className="bg-blue-100 px-3 py-2 rounded-2xl text-sm font-bold">{t('games.equation-builder.solved')}: {solved}</div>
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
          )}
        </div>
        {!running && (
          <select value={level} onChange={(e) => { setLevel(e.target.value); setTime(LEVELS[e.target.value].time); }} className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm">
            <option value="easy">{t('games.equation-builder.descEasy')}</option>
            <option value="medium">{t('games.equation-builder.descMedium')}</option>
            <option value="hard">{t('games.equation-builder.descHard')}</option>
          </select>
        )}
      </div>

      {running && (
        <div className="w-full mb-4">
          <span className="font-bold text-sm">⏱️ {time}{t('gameUI.secAbbr')}</span>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
            <motion.div className={`h-full ${timePercent < 30 ? 'bg-error-red' : 'bg-success-green'}`} animate={{ width: `${timePercent}%` }} />
          </div>
        </div>
      )}

      {running ? (
        <div className="w-full">
          {/* יעד */}
          <div className="bg-gradient-to-l from-primary to-accent-purple text-white p-4 rounded-3xl shadow-lg text-center mb-4">
            <div className="text-sm opacity-90">{t('games.equation-builder.target')}</div>
            <div className="text-5xl font-black">{puzzle.target}</div>
          </div>

          {/* המשוואה הנוכחית */}
          <div className={`p-4 rounded-2xl shadow mb-4 text-center min-h-[60px] flex items-center justify-center text-3xl font-mono ${feedback === 'correct' ? 'bg-green-100' : feedback ? 'bg-red-100' : 'bg-white'}`} dir="ltr">
            {expression.length > 0 ? expression.join(' ') : <span className="text-gray-400 text-base">{t('games.equation-builder.pickHelp')}</span>}
            {expression.length > 0 && !OPS.includes(expression[expression.length - 1]) && (
              <span className="mr-2 text-accent-purple"> = {evalExpression(expression)}</span>
            )}
          </div>
          {feedback && feedback !== 'correct' && (
            <div className="text-center text-error-red font-bold mb-2">{feedback}</div>
          )}

          {/* מספרים */}
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {puzzle.numbers.map((n, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: usedNumbers.includes(i) ? 1 : 1.05 }}
                whileTap={{ scale: 0.92 }}
                disabled={usedNumbers.includes(i)}
                onClick={() => handleAddNumber(i)}
                className={`w-16 h-16 rounded-2xl font-black text-2xl shadow ${usedNumbers.includes(i) ? 'bg-gray-200 text-gray-400' : 'bg-white hover:bg-bg-start'}`}
              >
                {n}
              </motion.button>
            ))}
          </div>

          {/* פעולות */}
          <div className="flex justify-center gap-2 mb-3">
            {OPS.map((op) => (
              <motion.button
                key={op}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAddOp(op)}
                className="w-12 h-12 rounded-2xl bg-accent-purple text-white font-black text-xl shadow hover:bg-purple-700"
              >
                {op}
              </motion.button>
            ))}
          </div>

          {/* כפתורי פעולה */}
          <div className="flex gap-2 justify-center">
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleClear}>{t('gameUI.clear')}</Button>
            <Button variant="primary" size="sm" icon={ArrowRight} onClick={handleSubmit}>{t('gameUI.check')}</Button>
            <Button variant="secondary" size="sm" onClick={newPuzzle}>{t('gameUI.newPuzzle')}</Button>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 w-full">
          <div className="text-5xl mb-3">🧮</div>
          <h3 className="text-2xl font-bold mb-2">{t('games.equation-builder.title')}</h3>
          <p className="text-gray-600 mb-6">{t('games.equation-builder.instructions')}</p>
          <Button variant="primary" size="lg" icon={Play} onClick={handleStart}>{t('common.start')}</Button>
        </div>
      )}

      <GameResultModal
        open={done && !!resultData}
        isWin={solved >= 2}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
