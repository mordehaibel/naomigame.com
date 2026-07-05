import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import GameArena from '../../components/games/GameArena';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const COLS = 10;
const ROWS = 20;
const CELL = 26;

const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: '#06B6D4' },
  O: { shape: [[1, 1], [1, 1]], color: '#FACC15' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#A855F7' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22C55E' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#EF4444' },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: '#F97316' },
  J: { shape: [[0, 1], [0, 1], [1, 1]], color: '#3B82F6' },
};
const KEYS = Object.keys(PIECES);

const LEVELS = {
  easy: { baseDrop: 700 },
  medium: { baseDrop: 500 },
  hard: { baseDrop: 300 },
};

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const k = KEYS[Math.floor(Math.random() * KEYS.length)];
  return { type: k, ...PIECES[k] };
}

function rotateMatrix(m) {
  const rows = m.length;
  const cols = m[0].length;
  const r = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) r[j][rows - 1 - i] = m[i][j];
  return r;
}

function canPlace(board, shape, x, y) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (!shape[i][j]) continue;
      const bx = x + j;
      const by = y + i;
      if (bx < 0 || bx >= COLS || by >= ROWS) return false;
      if (by >= 0 && board[by][bx]) return false;
    }
  }
  return true;
}

function mergePiece(board, piece, shape, x, y) {
  const newBoard = board.map((r) => [...r]);
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (!shape[i][j]) continue;
      const by = y + i;
      const bx = x + j;
      if (by >= 0) newBoard[by][bx] = piece.color;
    }
  }
  return newBoard;
}

function clearLines(board) {
  const newBoard = board.filter((row) => row.some((c) => c === null));
  const cleared = ROWS - newBoard.length;
  while (newBoard.length < ROWS) newBoard.unshift(Array(COLS).fill(null));
  return { board: newBoard, cleared };
}

export default function TetrisGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('medium');
  const [board, setBoard] = useState(() => emptyBoard());
  const [piece, setPiece] = useState(() => randomPiece());
  const [shape, setShape] = useState(() => piece.shape);
  const [pos, setPos] = useState({ x: 3, y: -1 });
  const [nextPiece, setNextPiece] = useState(() => randomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resultData, setResultData] = useState(null);

  const stateRef = useRef({ board, shape, pos, piece, nextPiece, score, lines });
  useEffect(() => {
    stateRef.current = { board, shape, pos, piece, nextPiece, score, lines };
  });

  const highScore = currentUser?.gameStats?.tetris?.highScore || 0;

  const reset = () => {
    const p = randomPiece();
    setBoard(emptyBoard());
    setPiece(p);
    setShape(p.shape);
    setPos({ x: 3, y: -1 });
    setNextPiece(randomPiece());
    setScore(0);
    setLines(0);
    setGameOver(false);
    setRunning(false);
    setPaused(false);
    setResultData(null);
  };

  const spawnNew = useCallback((b) => {
    const next = stateRef.current.nextPiece;
    const newNext = randomPiece();
    const startPos = { x: Math.floor((COLS - next.shape[0].length) / 2), y: -1 };
    if (!canPlace(b, next.shape, startPos.x, startPos.y + 1)) {
      // game over
      setGameOver(true);
      setRunning(false);
      const finalScore = stateRef.current.score;
      const pts = calculatePoints(finalScore, 'reaction');
      const result = addGameScore('tetris', finalScore, pts);
      setResultData(result);
      play('fail');
      if (result.newRecord) play('fanfare');
      return;
    }
    setPiece(next);
    setShape(next.shape);
    setPos(startPos);
    setNextPiece(newNext);
  }, [addGameScore, play]);

  const tryMove = useCallback((dx, dy) => {
    const s = stateRef.current;
    const newPos = { x: s.pos.x + dx, y: s.pos.y + dy };
    if (canPlace(s.board, s.shape, newPos.x, newPos.y)) {
      setPos(newPos);
      return true;
    }
    return false;
  }, []);

  const tryRotate = useCallback(() => {
    const s = stateRef.current;
    const newShape = rotateMatrix(s.shape);
    if (canPlace(s.board, newShape, s.pos.x, s.pos.y)) {
      setShape(newShape);
      play('click');
    }
  }, [play]);

  const drop = useCallback(() => {
    const s = stateRef.current;
    if (!tryMove(0, 1)) {
      // לוק - מזג את החלק לוח
      const merged = mergePiece(s.board, s.piece, s.shape, s.pos.x, s.pos.y);
      const { board: cleared, cleared: numCleared } = clearLines(merged);
      setBoard(cleared);
      if (numCleared > 0) {
        const pts = [0, 40, 100, 300, 1200][numCleared] || 0;
        setScore((sc) => sc + pts);
        setLines((l) => l + numCleared);
        play('success');
      } else {
        play('point');
      }
      setTimeout(() => spawnNew(cleared), 50);
    }
  }, [tryMove, spawnNew, play]);

  // לולאת נפילה
  useEffect(() => {
    if (!running || gameOver || paused) return;
    const speed = Math.max(80, LEVELS[level].baseDrop - lines * 15);
    const interval = setInterval(drop, speed);
    return () => clearInterval(interval);
  }, [running, gameOver, paused, level, lines, drop]);

  // מקלדת
  useEffect(() => {
    const handler = (e) => {
      if (!running || gameOver || paused) return;
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') { e.preventDefault(); tryMove(-1, 0); }
      else if (key === 'arrowright' || key === 'd') { e.preventDefault(); tryMove(1, 0); }
      else if (key === 'arrowdown' || key === 's') { e.preventDefault(); drop(); }
      else if (key === 'arrowup' || key === 'w' || key === ' ') { e.preventDefault(); tryRotate(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [running, gameOver, paused, tryMove, tryRotate, drop]);

  // צבע בכל תא של הלוח (הלוח + החלק הנופל)
  const renderBoard = () => {
    const display = board.map((r) => [...r]);
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (!shape[i][j]) continue;
        const by = pos.y + i;
        const bx = pos.x + j;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
          display[by][bx] = piece.color;
        }
      }
    }
    return display;
  };

  const display = renderBoard();
  const handleStart = () => { play('click'); reset(); setRunning(true); };

  const statsPanel = (
    <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
      <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {score}</div>
      <div className="bg-blue-100 px-3 py-2 rounded-2xl text-sm font-bold">{t('games.tetris.lines')}: {lines}</div>
      {highScore > 0 && (
        <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
      )}
    </div>
  );

  const asidePanel = (
    <div className="flex flex-row lg:flex-col items-center justify-center gap-2 flex-wrap">
      {!running && !gameOver && (
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm">
          <option value="easy">{t('games.tetris.descEasy')}</option>
          <option value="medium">{t('games.tetris.descMedium')}</option>
          <option value="hard">{t('games.tetris.descHard')}</option>
        </select>
      )}
      {running && (
        <Button variant="ghost" size="sm" icon={paused ? Play : Pause} onClick={() => setPaused((p) => !p)}>
          {paused ? t('gameUI.resume') : t('gameUI.pause')}
        </Button>
      )}
      <div className="bg-slate-800 text-white p-2 rounded-xl text-xs text-center">
        <div className="font-bold mb-1">{t('games.tetris.next')}</div>
        <svg width={nextPiece.shape[0].length * 20} height={nextPiece.shape.length * 20}>
          {nextPiece.shape.map((row, y) => row.map((c, x) => c ? <rect key={`${x}-${y}`} x={x * 20 + 1} y={y * 20 + 1} width={18} height={18} fill={nextPiece.color} rx="2" /> : null))}
        </svg>
      </div>
      {!running && !gameOver && (
        <Button variant="primary" size="sm" icon={Play} onClick={handleStart}>{t('gameUI.start')}</Button>
      )}
      {gameOver && (
        <Button variant="primary" size="sm" icon={RotateCcw} onClick={handleStart}>{t('gameUI.again')}</Button>
      )}
      {!running && !gameOver && (
        <p className="hidden lg:block text-xs text-gray-500 text-center">{t('games.tetris.keyHelp')}</p>
      )}
    </div>
  );

  const controlsPanel = (
    <div className="grid grid-cols-3 gap-2 md:hidden w-full max-w-xs">
      <div></div>
      <button onClick={tryRotate} className="bg-accent-purple text-white p-3 rounded-xl text-xl active:scale-95">↻</button>
      <div></div>
      <button onClick={() => tryMove(-1, 0)} className="bg-primary text-white p-3 rounded-xl text-xl active:scale-95">←</button>
      <button onClick={drop} className="bg-primary text-white p-3 rounded-xl text-xl active:scale-95">↓</button>
      <button onClick={() => tryMove(1, 0)} className="bg-primary text-white p-3 rounded-xl text-xl active:scale-95">→</button>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <GameArena stats={statsPanel} aside={asidePanel} controls={controlsPanel}>
        <div
          className="game-board p-2 mx-auto w-full"
          style={{ width: 'min(100%, calc((100dvh - var(--game-reserve, 335px) - 95px) * 10 / 20))' }}
        >
          <svg
            viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
            preserveAspectRatio="xMidYMid meet"
            className="block w-full h-auto"
          >
            {display.map((row, y) =>
              row.map((c, x) => (
                <g key={`${x}-${y}`}>
                  <rect x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill={c || 'transparent'} stroke="rgba(255,255,255,0.05)" />
                  {c && <rect x={x * CELL + 1} y={y * CELL + 1} width={CELL - 2} height={CELL - 2} fill={c} rx="3" stroke="rgba(255,255,255,0.3)" />}
                </g>
              ))
            )}
          </svg>
        </div>
      </GameArena>

      <GameResultModal
        open={gameOver && !!resultData}
        isWin={score >= 200}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
