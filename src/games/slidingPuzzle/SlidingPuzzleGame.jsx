import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Shuffle } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const LEVELS = {
  easy: { size: 3 },
  medium: { size: 4 },
  hard: { size: 5 },
};

// בונה לוח מסודר: [1,2,...,n*n-1, 0] כאשר 0 הוא החור
const buildSolved = (size) => {
  const total = size * size;
  return Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
};

// מוצא אינדקס של ערך
const indexOf = (board, value) => board.indexOf(value);

// בודק אם תנועה בין שני אינדקסים אפשרית (שכנים בלוח size×size)
const areAdjacent = (a, b, size) => {
  const ra = Math.floor(a / size);
  const ca = a % size;
  const rb = Math.floor(b / size);
  const cb = b % size;
  return Math.abs(ra - rb) + Math.abs(ca - cb) === 1;
};

// ערבוב הלוח על ידי N תנועות חוקיות (ככה הלוח תמיד פתיר)
const shuffleBoard = (size, moves = 200) => {
  let board = buildSolved(size);
  for (let i = 0; i < moves; i++) {
    const zero = indexOf(board, 0);
    const neighbors = [];
    const r = Math.floor(zero / size);
    const c = zero % size;
    if (r > 0) neighbors.push(zero - size);
    if (r < size - 1) neighbors.push(zero + size);
    if (c > 0) neighbors.push(zero - 1);
    if (c < size - 1) neighbors.push(zero + 1);
    const target = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[zero], board[target]] = [board[target], board[zero]];
  }
  // וודא שהלוח לא כבר פתור
  if (board.every((v, i) => v === buildSolved(size)[i])) {
    return shuffleBoard(size, moves + 50);
  }
  return board;
};

const isSolved = (board) => {
  const size = Math.sqrt(board.length);
  const solved = buildSolved(size);
  return board.every((v, i) => v === solved[i]);
};

export default function SlidingPuzzleGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('easy');
  const [board, setBoard] = useState(() => shuffleBoard(LEVELS.easy.size));
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [started, setStarted] = useState(false);

  const size = LEVELS[level].size;
  const highScore = currentUser?.gameStats?.['sliding-puzzle']?.highScore || 0;

  const reset = useCallback(
    (newLevel = level) => {
      setBoard(shuffleBoard(LEVELS[newLevel].size));
      setMoves(0);
      setStartTime(null);
      setElapsed(0);
      setDone(false);
      setScore(0);
      setResultData(null);
      setStarted(false);
    },
    [level]
  );

  // טיימר
  useEffect(() => {
    if (!startTime || done) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 250);
    return () => clearInterval(t);
  }, [startTime, done]);

  // בדיקת ניצחון
  useEffect(() => {
    if (!started || done) return;
    if (isSolved(board)) {
      setDone(true);
      // ניקוד: בסיס לפי גודל, פחות מהלכים פחות זמן
      const baseScore = size * size * 20;
      const movePenalty = moves * 1.5;
      const timePenalty = elapsed * 1;
      const finalScore = Math.max(20, Math.round(baseScore - movePenalty - timePenalty));
      setScore(finalScore);
      const pts = calculatePoints(finalScore, 'memory');
      const result = addGameScore('sliding-puzzle', finalScore, pts);
      setResultData(result);
      play(result.newRecord ? 'fanfare' : 'success');
    }
  }, [board, started, done, moves, elapsed, size, addGameScore, play]);

  const handleClick = (idx) => {
    if (done) return;
    const zeroIdx = indexOf(board, 0);
    if (!areAdjacent(idx, zeroIdx, size)) return;
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }
    const next = [...board];
    [next[idx], next[zeroIdx]] = [next[zeroIdx], next[idx]];
    setBoard(next);
    setMoves((m) => m + 1);
    play('click');
  };

  const handleShuffle = () => {
    play('click');
    reset();
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      {/* בקרים עליונים */}
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">
            🔄 {t('gameUI.moves')}: {moves}
          </div>
          <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">
            ⏱️ {elapsed}{t('gameUI.secAbbr')}
          </div>
          {highScore > 0 && (
            <div className="bg-secondary/20 px-3 py-2 rounded-2xl text-sm font-bold">
              ⭐ {t('gameUI.record')}: {highScore}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              reset(e.target.value);
            }}
            className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm"
          >
            <option value="easy">{t('games.sliding-puzzle.descEasy')}</option>
            <option value="medium">{t('games.sliding-puzzle.descMedium')}</option>
            <option value="hard">{t('games.sliding-puzzle.descHard')}</option>
          </select>
          <Button variant="ghost" size="sm" icon={Shuffle} onClick={handleShuffle}>
            {t('gameUI.shuffle')}
          </Button>
        </div>
      </div>

      {/* הסבר */}
      {!started && (
        <p className="text-center text-gray-600 mb-4">
          {t('games.sliding-puzzle.instructions', size * size - 1)}
        </p>
      )}

      {/* לוח */}
      <div
        className="grid gap-2 bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-3xl shadow-2xl w-full mx-auto"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, aspectRatio: '1', maxWidth: 'min(28rem, calc(100dvh - 410px))' }}
      >
        {board.map((value, idx) => (
          <Tile
            key={`${value}-${idx}`}
            value={value}
            onClick={() => handleClick(idx)}
            size={size}
          />
        ))}
      </div>

      <GameResultModal
        open={done && !!resultData}
        isWin={true}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={() => reset()}
      />
    </div>
  );
}

function Tile({ value, onClick, size }) {
  const isEmpty = value === 0;
  // טקסט קטן יותר ככל שהלוח גדול יותר
  const textSize = size === 3 ? 'text-4xl md:text-5xl' : size === 4 ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl';

  if (isEmpty) {
    return <div className="bg-emerald-900/40 rounded-xl" />;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`bg-gradient-to-br from-white to-bg-start rounded-xl shadow-md font-black ${textSize} text-text-primary flex items-center justify-center hover:shadow-lg transition-shadow`}
    >
      {value}
    </motion.button>
  );
}
