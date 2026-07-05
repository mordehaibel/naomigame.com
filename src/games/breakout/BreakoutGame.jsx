import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const W = 600;
const H = 450;
const PADDLE_W = 100;
const PADDLE_H = 14;
const BALL_R = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 9;
const BRICK_W = (W - 40) / BRICK_COLS;
const BRICK_H = 22;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 20;
const BRICK_COLORS = ['#EF4444', '#F59E0B', '#FACC15', '#22C55E', '#3B82F6'];

const LEVELS = {
  easy: { ballSpeed: 4, lives: 5 },
  medium: { ballSpeed: 5, lives: 3 },
  hard: { ballSpeed: 6, lives: 2 },
};

function buildBricks() {
  const bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_OFFSET_LEFT + c * BRICK_W,
        y: BRICK_OFFSET_TOP + r * BRICK_H,
        alive: true,
        color: BRICK_COLORS[r % BRICK_COLORS.length],
      });
    }
  }
  return bricks;
}

export default function BreakoutGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('medium');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LEVELS.medium.lives);
  const [resultData, setResultData] = useState(null);
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const targetXRef = useRef(W / 2);
  const rafRef = useRef(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(LEVELS.medium.lives);

  const highScore = currentUser?.gameStats?.breakout?.highScore || 0;

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    cvs.width = W;
    cvs.height = H;
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const onMove = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const scale = W / rect.width;
      targetXRef.current = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x * scale));
    };
    cvs.addEventListener('mousemove', onMove);
    cvs.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      cvs.removeEventListener('mousemove', onMove);
      cvs.removeEventListener('touchmove', onMove);
    };
  }, []);

  useEffect(() => {
    if (!running || done) return;
    const cfg = LEVELS[level];
    const ctx = canvasRef.current.getContext('2d');

    const tick = () => {
      const s = stateRef.current;
      // smooth paddle
      s.paddleX += (targetXRef.current - s.paddleX) * 0.4;

      // ball move
      s.ballX += s.ballVX;
      s.ballY += s.ballVY;

      // wall bounce
      if (s.ballX < BALL_R || s.ballX > W - BALL_R) {
        s.ballVX *= -1;
        s.ballX = Math.max(BALL_R, Math.min(W - BALL_R, s.ballX));
      }
      if (s.ballY < BALL_R) {
        s.ballVY *= -1;
        s.ballY = BALL_R;
      }

      // paddle bounce
      const paddleY = H - 30;
      if (
        s.ballY > paddleY - BALL_R &&
        s.ballY < paddleY + PADDLE_H &&
        s.ballX > s.paddleX - PADDLE_W / 2 &&
        s.ballX < s.paddleX + PADDLE_W / 2 &&
        s.ballVY > 0
      ) {
        const offset = (s.ballX - s.paddleX) / (PADDLE_W / 2);
        s.ballVX = offset * 6;
        s.ballVY = -Math.abs(s.ballVY);
        play('point');
      }

      // brick collision
      for (const b of s.bricks) {
        if (!b.alive) continue;
        if (
          s.ballX > b.x &&
          s.ballX < b.x + BRICK_W &&
          s.ballY > b.y &&
          s.ballY < b.y + BRICK_H
        ) {
          b.alive = false;
          s.ballVY *= -1;
          scoreRef.current += 10;
          setScore(scoreRef.current);
          play('point');
          break;
        }
      }

      // ball below screen
      if (s.ballY > H + BALL_R) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        play('fail');
        if (livesRef.current <= 0) {
          finishGame(false);
          return;
        }
        // reset ball
        s.ballX = W / 2;
        s.ballY = H - 50;
        s.ballVX = (Math.random() - 0.5) * 4;
        s.ballVY = -cfg.ballSpeed;
      }

      // win
      if (s.bricks.every((b) => !b.alive)) {
        finishGame(true);
        return;
      }

      // draw
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, W, H);
      // bricks
      for (const b of s.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x + 2, b.y + 2, BRICK_W - 4, BRICK_H - 4);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.strokeRect(b.x + 2, b.y + 2, BRICK_W - 4, BRICK_H - 4);
      }
      // paddle
      ctx.fillStyle = '#FF6B9D';
      ctx.fillRect(s.paddleX - PADDLE_W / 2, paddleY, PADDLE_W, PADDLE_H);
      // ball
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(tick);
    };

    function finishGame(won) {
      cancelAnimationFrame(rafRef.current);
      setRunning(false);
      setDone(true);
      const finalScore = scoreRef.current + (won ? 100 : 0);
      const pts = calculatePoints(finalScore, 'reaction');
      const result = addGameScore('breakout', finalScore, pts);
      setResultData({ ...result, score: finalScore, won });
      if (result.newRecord) play('fanfare');
      else if (won) play('success');
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, done, level, addGameScore, play]);

  const handleStart = () => {
    play('click');
    const cfg = LEVELS[level];
    scoreRef.current = 0;
    livesRef.current = cfg.lives;
    setScore(0);
    setLives(cfg.lives);
    stateRef.current = {
      paddleX: W / 2,
      ballX: W / 2,
      ballY: H - 50,
      ballVX: (Math.random() - 0.5) * 4,
      ballVY: -cfg.ballSpeed,
      bricks: buildBricks(),
    };
    setDone(false);
    setResultData(null);
    setRunning(true);
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {t('gameUI.score')}: {score}</div>
          <div className="bg-error-red/20 px-3 py-2 rounded-2xl text-sm font-bold">{'❤️'.repeat(lives)}</div>
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
          )}
        </div>
        {!running && !done && (
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm">
            <option value="easy">{t('games.breakout.descEasy')}</option>
            <option value="medium">{t('games.breakout.descMedium')}</option>
            <option value="hard">{t('games.breakout.descHard')}</option>
          </select>
        )}
      </div>

      <div
        className="relative w-full mx-auto"
        style={{ maxWidth: `min(100%, calc((100dvh - var(--game-reserve-nc, 205px)) * ${W} / ${H}))` }}
      >
        <canvas
          ref={canvasRef}
          className="w-full game-board cursor-none"
          style={{ aspectRatio: `${W}/${H}` }}
        />
        {!running && !done && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur rounded-2xl flex flex-col items-center justify-center text-white p-6">
            <div className="text-6xl mb-3">🧱</div>
            <h3 className="text-2xl font-bold mb-2">{t('games.breakout.title')}</h3>
            <p className="text-center mb-4 opacity-90">{t('games.breakout.instructions')}</p>
            <Button variant="primary" size="md" icon={Play} onClick={handleStart}>{t('gameUI.start')}</Button>
          </div>
        )}
      </div>

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
