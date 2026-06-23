import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import DifficultySelector from '../../components/games/DifficultySelector';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';
import { getDefaultDifficulty } from '../../utils/difficulty';

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// כל רמה - גודל לוח, גודל תא, מהירות
const DIFFICULTIES = {
  easy: { grid: 15, cell: 28, speed: 200 },
  medium: { grid: 20, cell: 22, speed: 130 },
  hard: { grid: 25, cell: 18, speed: 80 },
};

function randApple(snake, grid) {
  while (true) {
    const x = Math.floor(Math.random() * grid);
    const y = Math.floor(Math.random() * grid);
    if (!snake.some((s) => s.x === x && s.y === y)) return { x, y };
  }
}

function initialSnake(grid) {
  const mid = Math.floor(grid / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

export default function SnakeGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  // בחירת רמה ברירת מחדל לפי גיל
  const [difficulty, setDifficulty] = useState(() => getDefaultDifficulty(currentUser?.age));
  const [phase, setPhase] = useState('select'); // 'select' | 'playing' | 'paused' | 'gameOver'

  const cfg = DIFFICULTIES[difficulty];
  const GRID = cfg.grid;
  const CELL = cfg.cell;

  const [snake, setSnake] = useState(() => initialSnake(GRID));
  const [direction, setDirection] = useState('right');
  const [apple, setApple] = useState(() => randApple(initialSnake(GRID), GRID));
  const [score, setScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const directionQueue = useRef([]);

  const highScore = currentUser?.gameStats?.snake?.highScore || 0;

  // טיפול במקלדת
  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toLowerCase();
      let next;
      if (key === 'arrowup' || key === 'w') next = 'up';
      else if (key === 'arrowdown' || key === 's') next = 'down';
      else if (key === 'arrowleft' || key === 'a') next = 'left';
      else if (key === 'arrowright' || key === 'd') next = 'right';
      if (!next) return;

      e.preventDefault();
      const last = directionQueue.current[directionQueue.current.length - 1] || direction;
      const opposite =
        (last === 'up' && next === 'down') ||
        (last === 'down' && next === 'up') ||
        (last === 'left' && next === 'right') ||
        (last === 'right' && next === 'left');
      if (!opposite) directionQueue.current.push(next);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [direction]);

  // לולאת המשחק
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const nextDir = directionQueue.current.shift() || direction;
        if (nextDir !== direction) setDirection(nextDir);

        const head = prev[0];
        const move = DIRECTIONS[nextDir];
        const newHead = { x: head.x + move.x, y: head.y + move.y };

        if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
          setPhase('gameOver');
          play('fail');
          return prev;
        }
        if (prev.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          setPhase('gameOver');
          play('fail');
          return prev;
        }

        const ate = newHead.x === apple.x && newHead.y === apple.y;
        const newSnake = [newHead, ...prev];
        if (ate) {
          setScore((s) => s + 10);
          setApple(randApple(newSnake, GRID));
          play('point');
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, cfg.speed);
    return () => clearInterval(interval);
  }, [phase, direction, apple, cfg.speed, GRID, play]);

  // שמירת תוצאה
  useEffect(() => {
    if (phase !== 'gameOver' || resultData) return;
    const points = calculatePoints(score, 'snake');
    const result = addGameScore('snake', score, points);
    setResultData(result);
    if (result.newRecord) play('fanfare');
  }, [phase, score, addGameScore, play, resultData]);

  const reset = useCallback(() => {
    setSnake(initialSnake(GRID));
    setDirection('right');
    setApple(randApple(initialSnake(GRID), GRID));
    setScore(0);
    setResultData(null);
    directionQueue.current = [];
  }, [GRID]);

  const handleStart = () => {
    play('click');
    reset();
    setPhase('playing');
  };

  // אם המשתמש בחר רמה אחרת ועדיין לא התחיל - אפשר לשנות grid
  const handleSelectDifficulty = (newDiff) => {
    setDifficulty(newDiff);
    // אתחל את הלוח עם הגודל החדש כדי לטרילר נראות
    const newGrid = DIFFICULTIES[newDiff].grid;
    setSnake(initialSnake(newGrid));
    setApple(randApple(initialSnake(newGrid), newGrid));
  };

  return (
    <div className="flex flex-col items-center">
      {phase === 'select' ? (
        <DifficultySelector
          current={difficulty}
          onSelect={handleSelectDifficulty}
          onStart={handleStart}
          emoji="🐍"
          title={t('games.snake.title')}
          recommendedAge={currentUser?.age}
          descriptions={{
            easy: t('games.snake.descEasy'),
            medium: t('games.snake.descMedium'),
            hard: t('games.snake.descHard'),
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between w-full max-w-lg mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 px-4 py-2 rounded-2xl font-bold">
                {t('games.snake.apple')}: <span className="text-primary">{score}</span>
              </div>
              {highScore > 0 && (
                <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">
                  ⭐ {t('gameUI.record')}: {highScore}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {phase === 'playing' && (
                <Button variant="ghost" size="sm" icon={Pause} onClick={() => { play('click'); setPhase('paused'); }}>
                  {t('gameUI.pause')}
                </Button>
              )}
              {phase === 'paused' && (
                <Button variant="primary" size="sm" onClick={() => { play('click'); setPhase('playing'); }}>
                  {t('gameUI.resume')}
                </Button>
              )}
              {phase !== 'gameOver' && (
                <Button variant="ghost" size="sm" onClick={() => { reset(); setPhase('select'); }}>
                  {t('difficulty.changeLevel')}
                </Button>
              )}
            </div>
          </div>

          <div
            className="game-board relative"
            style={{ width: GRID * CELL, height: GRID * CELL, maxWidth: '100%' }}
          >
            <svg width="100%" height="100%" viewBox={`0 0 ${GRID * CELL} ${GRID * CELL}`} style={{ display: 'block' }}>
              <defs>
                <pattern id="grid" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
                  <path d={`M ${CELL} 0 L 0 0 0 ${CELL}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <motion.circle
                key={`${apple.x}-${apple.y}`}
                cx={apple.x * CELL + CELL / 2}
                cy={apple.y * CELL + CELL / 2}
                r={CELL * 0.42}
                fill="#F56565"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
              <text x={apple.x * CELL + CELL / 2} y={apple.y * CELL + CELL / 2 + 6} textAnchor="middle" fontSize={CELL * 0.7}>🍎</text>

              {snake.map((seg, idx) => (
                <rect
                  key={idx}
                  x={seg.x * CELL + 1}
                  y={seg.y * CELL + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={6}
                  fill={idx === 0 ? '#48BB78' : '#68D391'}
                  stroke="#22543D"
                  strokeWidth={1}
                />
              ))}
              {snake[0] && (
                <>
                  <circle cx={snake[0].x * CELL + CELL / 2 - 4} cy={snake[0].y * CELL + CELL / 2 - 2} r={2} fill="white" />
                  <circle cx={snake[0].x * CELL + CELL / 2 + 4} cy={snake[0].y * CELL + CELL / 2 - 2} r={2} fill="white" />
                </>
              )}
            </svg>

            {phase === 'paused' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {t('gameUI.paused')}
              </div>
            )}
          </div>

          {/* בקרי מובייל */}
          <div className="mt-4 grid grid-cols-3 gap-2 md:hidden">
            <div></div>
            <button onClick={() => directionQueue.current.push('up')} className="bg-primary text-white p-4 rounded-2xl text-2xl active:scale-95">⬆️</button>
            <div></div>
            <button onClick={() => directionQueue.current.push('right')} className="bg-primary text-white p-4 rounded-2xl text-2xl active:scale-95">➡️</button>
            <button onClick={() => directionQueue.current.push('down')} className="bg-primary text-white p-4 rounded-2xl text-2xl active:scale-95">⬇️</button>
            <button onClick={() => directionQueue.current.push('left')} className="bg-primary text-white p-4 rounded-2xl text-2xl active:scale-95">⬅️</button>
          </div>
        </>
      )}

      <GameResultModal
        open={phase === 'gameOver' && !!resultData}
        isWin={score > 50}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={() => { reset(); setPhase('playing'); }}
      />
    </div>
  );
}
