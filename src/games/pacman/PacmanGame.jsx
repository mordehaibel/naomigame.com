import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import GameArena from '../../components/games/GameArena';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

// מבוך פשוט. # = קיר, . = פיסת אוכל, ' ' = רצפה ריקה, P = פקפק, G = רוח רפאים
const MAZE = [
  '##########',
  '#........#',
  '#.##.##..#',
  '#........#',
  '#.##..##.#',
  '#........#',
  '#.##..##.#',
  '#........#',
  '#.##.##..#',
  '#........#',
  '##########',
];

const ROWS = MAZE.length;
const COLS = MAZE[0].length;
const CELL = 36;

const LEVELS = {
  easy: { ghosts: 1, ghostSpeed: 320 },
  medium: { ghosts: 2, ghostSpeed: 260 },
  hard: { ghosts: 3, ghostSpeed: 200 },
};

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// בנה לוח התחלתי מתוך MAZE
function buildBoard() {
  return MAZE.map((row) => row.split(''));
}

function isWall(board, x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  return board[y][x] === '#';
}

function findFloors(board) {
  const out = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (board[y][x] !== '#') out.push({ x, y });
  return out;
}

export default function PacmanGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('easy');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [pellets, setPellets] = useState(0);
  const [board, setBoard] = useState(() => buildBoard());
  const [pac, setPac] = useState({ x: 1, y: 1 });
  const [ghosts, setGhosts] = useState([]);
  const [resultData, setResultData] = useState(null);
  const directionRef = useRef('right');
  const queuedDirRef = useRef(null);
  const pacRef = useRef({ x: 1, y: 1 });
  const ghostsRef = useRef([]);
  const boardRef = useRef(buildBoard());
  const movePacIntervalRef = useRef(null);
  const moveGhostIntervalRef = useRef(null);
  const scoreRef = useRef(0);

  const highScore = currentUser?.gameStats?.pacman?.highScore || 0;

  const totalPellets = useRef(0);

  const reset = useCallback(() => {
    const b = buildBoard();
    const floors = findFloors(b);
    totalPellets.current = floors.length - 1; // מינוס מקום הפקפק
    boardRef.current = b;
    pacRef.current = { x: 1, y: 1 };
    // הצב רוחות בפינות אחרות
    const cfg = LEVELS[level];
    const ghostStarts = [
      { x: COLS - 2, y: ROWS - 2 },
      { x: 1, y: ROWS - 2 },
      { x: COLS - 2, y: 1 },
    ];
    const startGhosts = ghostStarts.slice(0, cfg.ghosts).map((p, i) => ({
      ...p,
      dir: ['left', 'up', 'down'][i % 3],
      color: ['#EF4444', '#FF8C42', '#9B59B6'][i],
    }));
    ghostsRef.current = startGhosts;
    setBoard(b);
    setPac(pacRef.current);
    setGhosts(startGhosts);
    setScore(0);
    setPellets(0);
    setDone(false);
    setResultData(null);
    directionRef.current = 'right';
    queuedDirRef.current = null;
    scoreRef.current = 0;
  }, [level]);

  const finishGame = useCallback((won) => {
    clearInterval(movePacIntervalRef.current);
    clearInterval(moveGhostIntervalRef.current);
    setRunning(false);
    setDone(true);
    const finalScore = won ? scoreRef.current + 200 : scoreRef.current;
    const pts = calculatePoints(finalScore, 'reaction');
    const result = addGameScore('pacman', finalScore, pts);
    setResultData({ ...result, score: finalScore, won });
    play(won ? 'fanfare' : 'fail');
  }, [addGameScore, play]);

  // לולאת תזוזת פקפק
  useEffect(() => {
    if (!running || done) return;
    movePacIntervalRef.current = setInterval(() => {
      const cur = pacRef.current;
      // נסה להחיל את התור
      if (queuedDirRef.current) {
        const d = DIRS[queuedDirRef.current];
        if (!isWall(boardRef.current, cur.x + d.x, cur.y + d.y)) {
          directionRef.current = queuedDirRef.current;
          queuedDirRef.current = null;
        }
      }
      const dir = DIRS[directionRef.current];
      const nx = cur.x + dir.x;
      const ny = cur.y + dir.y;
      if (!isWall(boardRef.current, nx, ny)) {
        pacRef.current = { x: nx, y: ny };
        setPac({ x: nx, y: ny });
        // אכל פלט
        if (boardRef.current[ny][nx] === '.') {
          boardRef.current[ny][nx] = ' ';
          setBoard([...boardRef.current.map((r) => [...r])]);
          setPellets((p) => {
            const np = p + 1;
            scoreRef.current += 10;
            setScore(scoreRef.current);
            play('point');
            if (np >= totalPellets.current) {
              setTimeout(() => finishGame(true), 100);
            }
            return np;
          });
        }
        // התנגשות עם רוח
        if (ghostsRef.current.some((g) => g.x === nx && g.y === ny)) {
          finishGame(false);
        }
      }
    }, 200);
    return () => clearInterval(movePacIntervalRef.current);
  }, [running, done, play, finishGame]);

  // לולאת רוחות
  useEffect(() => {
    if (!running || done) return;
    const cfg = LEVELS[level];
    moveGhostIntervalRef.current = setInterval(() => {
      const newGhosts = ghostsRef.current.map((g) => {
        // נסה להמשיך באותו כיוון, אחרת בחר אחר אקראי
        const tryDir = (dir) => {
          const d = DIRS[dir];
          return !isWall(boardRef.current, g.x + d.x, g.y + d.y);
        };
        const allDirs = ['up', 'down', 'left', 'right'];
        // 70% להמשיך, 30% לבחור אחרת
        let chosen = g.dir;
        const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' }[g.dir];
        if (Math.random() < 0.3 || !tryDir(chosen)) {
          // בחר אקראית מהאופציות החוקיות (לא ההפכי אם אפשר)
          const valid = allDirs.filter((d) => d !== opposite && tryDir(d));
          if (valid.length > 0) chosen = valid[Math.floor(Math.random() * valid.length)];
          else if (tryDir(opposite)) chosen = opposite;
        }
        const d = DIRS[chosen];
        const newG = { ...g, x: g.x + d.x, y: g.y + d.y, dir: chosen };
        // התנגשות עם פקפק
        if (newG.x === pacRef.current.x && newG.y === pacRef.current.y) {
          finishGame(false);
        }
        return newG;
      });
      ghostsRef.current = newGhosts;
      setGhosts(newGhosts);
    }, cfg.ghostSpeed);
    return () => clearInterval(moveGhostIntervalRef.current);
  }, [running, done, level, finishGame]);

  // מקלדת
  useEffect(() => {
    const handler = (e) => {
      if (!running) return;
      const key = e.key.toLowerCase();
      let dir;
      if (key === 'arrowup' || key === 'w') dir = 'up';
      else if (key === 'arrowdown' || key === 's') dir = 'down';
      else if (key === 'arrowleft' || key === 'a') dir = 'left';
      else if (key === 'arrowright' || key === 'd') dir = 'right';
      if (dir) { e.preventDefault(); queuedDirRef.current = dir; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [running]);

  const handleStart = () => {
    play('click');
    reset();
    setRunning(true);
  };

  const statsPanel = (
    <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
      <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {score}</div>
      <div className="bg-blue-100 px-3 py-2 rounded-2xl text-sm font-bold">{t('games.pacman.pellets')} {pellets}/{totalPellets.current}</div>
      {highScore > 0 && (
        <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
      )}
    </div>
  );

  const asidePanel = !running && !done ? (
    <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm">
      <option value="easy">{t('games.pacman.descEasy')}</option>
      <option value="medium">{t('games.pacman.descMedium')}</option>
      <option value="hard">{t('games.pacman.descHard')}</option>
    </select>
  ) : null;

  const controlsPanel = (
    <div className="grid grid-cols-3 gap-2 md:hidden w-full max-w-xs">
      <div></div>
      <button onClick={() => (queuedDirRef.current = 'up')} className="bg-primary text-white p-3 rounded-xl text-xl active:scale-95">⬆️</button>
      <div></div>
      <button onClick={() => (queuedDirRef.current = 'left')} className="bg-primary text-white p-3 rounded-xl text-xl active:scale-95">⬅️</button>
      <button onClick={() => (queuedDirRef.current = 'down')} className="bg-primary text-white p-3 rounded-xl text-xl active:scale-95">⬇️</button>
      <button onClick={() => (queuedDirRef.current = 'right')} className="bg-primary text-white p-3 rounded-xl text-xl active:scale-95">➡️</button>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <GameArena stats={statsPanel} aside={asidePanel} controls={controlsPanel}>
      <div
        className="relative bg-slate-900 p-2 rounded-2xl shadow-2xl mx-auto w-full"
        style={{ width: 'min(100%, calc((100dvh - var(--game-reserve, 335px)) * 10 / 11))' }}
      >
        <svg
          viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-auto"
        >
          {board.map((row, y) =>
            row.map((c, x) => (
              <g key={`${x}-${y}`}>
                {c === '#' && (
                  <rect x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill="#1E40AF" rx="4" />
                )}
                {c === '.' && (
                  <circle cx={x * CELL + CELL / 2} cy={y * CELL + CELL / 2} r={3} fill="#FACC15" />
                )}
              </g>
            ))
          )}
          {/* פקפק */}
          <g transform={`translate(${pac.x * CELL + CELL / 2} ${pac.y * CELL + CELL / 2})`}>
            <circle r={CELL / 2 - 4} fill="#FFD93D" />
            <polygon
              points={`0,0 ${CELL / 2 - 4},-6 ${CELL / 2 - 4},6`}
              fill="#1e293b"
            />
          </g>
          {/* רוחות */}
          {ghosts.map((g, i) => (
            <g key={i} transform={`translate(${g.x * CELL + CELL / 2} ${g.y * CELL + CELL / 2})`}>
              <path d={`M ${-(CELL / 2 - 4)} 5 L ${-(CELL / 2 - 4)} ${-(CELL / 2 - 8)} A ${CELL / 2 - 4} ${CELL / 2 - 4} 0 0 1 ${CELL / 2 - 4} ${-(CELL / 2 - 8)} L ${CELL / 2 - 4} 5 L 7 0 L 0 5 L ${-7} 0 Z`} fill={g.color} />
              <circle cx={-4} cy={-3} r={3} fill="white" />
              <circle cx={5} cy={-3} r={3} fill="white" />
              <circle cx={-4} cy={-3} r={1.5} fill="black" />
              <circle cx={5} cy={-3} r={1.5} fill="black" />
            </g>
          ))}
        </svg>

        {!running && !done && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur rounded-2xl flex flex-col items-center justify-center text-white p-4">
            <div className="text-5xl mb-2">👾</div>
            <h3 className="text-xl font-bold mb-1">{t('games.pacman.title')}</h3>
            <p className="text-sm text-center mb-3 opacity-90">{t('games.pacman.instructions')}</p>
            <Button variant="primary" size="sm" icon={Play} onClick={handleStart}>{t('gameUI.start')}</Button>
          </div>
        )}
      </div>

      </GameArena>

      <GameResultModal
        open={done && !!resultData}
        isWin={resultData?.won}
        score={resultData?.score || 0}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={handleStart}
      />
    </div>
  );
}
