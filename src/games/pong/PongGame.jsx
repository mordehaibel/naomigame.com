import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const W = 600;
const H = 400;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_R = 8;
const WIN_SCORE = 5;

const LEVELS = {
  easy: { aiSpeed: 3, ballSpeed: 4 },
  medium: { aiSpeed: 4.5, ballSpeed: 5 },
  hard: { aiSpeed: 6, ballSpeed: 6 },
};

export default function PongGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('medium');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    playerY: H / 2 - PADDLE_H / 2,
    aiY: H / 2 - PADDLE_H / 2,
    ballX: W / 2,
    ballY: H / 2,
    ballVX: LEVELS.medium.ballSpeed,
    ballVY: 2,
  });
  const rafRef = useRef(null);
  const playerScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const targetYRef = useRef(H / 2 - PADDLE_H / 2);

  const highScore = currentUser?.gameStats?.pong?.highScore || 0;

  // resize-aware canvas
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    cvs.width = W;
    cvs.height = H;
  }, []);

  // mouse/touch tracking
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const onMove = (e) => {
      const rect = cvs.getBoundingClientRect();
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      const scale = H / rect.height;
      targetYRef.current = Math.max(0, Math.min(H - PADDLE_H, y * scale - PADDLE_H / 2));
    };
    cvs.addEventListener('mousemove', onMove);
    cvs.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      cvs.removeEventListener('mousemove', onMove);
      cvs.removeEventListener('touchmove', onMove);
    };
  }, []);

  // game loop
  useEffect(() => {
    if (!running || done) return;
    const cfg = LEVELS[level];
    const ctx = canvasRef.current.getContext('2d');

    const tick = () => {
      const s = stateRef.current;
      // smooth player paddle
      s.playerY += (targetYRef.current - s.playerY) * 0.5;

      // AI movement
      const aiCenter = s.aiY + PADDLE_H / 2;
      if (s.ballX > W / 2 && s.ballVX > 0) {
        if (s.ballY < aiCenter - 5) s.aiY -= cfg.aiSpeed;
        else if (s.ballY > aiCenter + 5) s.aiY += cfg.aiSpeed;
      }
      s.aiY = Math.max(0, Math.min(H - PADDLE_H, s.aiY));

      // ball move
      s.ballX += s.ballVX;
      s.ballY += s.ballVY;

      // wall collision
      if (s.ballY < BALL_R || s.ballY > H - BALL_R) {
        s.ballVY *= -1;
        s.ballY = Math.max(BALL_R, Math.min(H - BALL_R, s.ballY));
      }

      // paddle collision (player on right side, AI on left)
      // player paddle
      if (
        s.ballX > W - PADDLE_W - BALL_R &&
        s.ballY > s.playerY &&
        s.ballY < s.playerY + PADDLE_H &&
        s.ballVX > 0
      ) {
        s.ballVX *= -1.05;
        const offset = (s.ballY - (s.playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
        s.ballVY = offset * 5;
        s.ballX = W - PADDLE_W - BALL_R;
        play('point');
      }
      // AI paddle
      if (
        s.ballX < PADDLE_W + BALL_R &&
        s.ballY > s.aiY &&
        s.ballY < s.aiY + PADDLE_H &&
        s.ballVX < 0
      ) {
        s.ballVX *= -1.05;
        const offset = (s.ballY - (s.aiY + PADDLE_H / 2)) / (PADDLE_H / 2);
        s.ballVY = offset * 5;
        s.ballX = PADDLE_W + BALL_R;
        play('click');
      }

      // scoring
      if (s.ballX < 0) {
        playerScoreRef.current += 1;
        setPlayerScore(playerScoreRef.current);
        resetBall(1);
        play('success');
      } else if (s.ballX > W) {
        aiScoreRef.current += 1;
        setAiScore(aiScoreRef.current);
        resetBall(-1);
        play('fail');
      }

      // check game end
      if (playerScoreRef.current >= WIN_SCORE || aiScoreRef.current >= WIN_SCORE) {
        finishGame();
        return;
      }

      // draw
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, W, H);
      // center line
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);
      // paddles
      ctx.fillStyle = '#FF6B9D';
      ctx.fillRect(W - PADDLE_W, s.playerY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(0, s.aiY, PADDLE_W, PADDLE_H);
      // ball
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      // labels
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(aiScoreRef.current), W / 4, 70);
      ctx.fillText(String(playerScoreRef.current), (3 * W) / 4, 70);

      rafRef.current = requestAnimationFrame(tick);
    };

    function resetBall(dir) {
      const s = stateRef.current;
      s.ballX = W / 2;
      s.ballY = H / 2;
      s.ballVX = cfg.ballSpeed * dir;
      s.ballVY = (Math.random() - 0.5) * 4;
    }

    function finishGame() {
      cancelAnimationFrame(rafRef.current);
      setRunning(false);
      setDone(true);
      const score = playerScoreRef.current * 30 + Math.max(0, WIN_SCORE - aiScoreRef.current) * 15;
      const pts = calculatePoints(score, 'reaction');
      const result = addGameScore('pong', score, pts);
      setResultData({ ...result, score, won: playerScoreRef.current >= WIN_SCORE });
      if (result.newRecord) play('fanfare');
      else if (playerScoreRef.current >= WIN_SCORE) play('success');
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, done, level, addGameScore, play]);

  const handleStart = () => {
    play('click');
    playerScoreRef.current = 0;
    aiScoreRef.current = 0;
    setPlayerScore(0);
    setAiScore(0);
    stateRef.current = {
      playerY: H / 2 - PADDLE_H / 2,
      aiY: H / 2 - PADDLE_H / 2,
      ballX: W / 2,
      ballY: H / 2,
      ballVX: LEVELS[level].ballSpeed,
      ballVY: (Math.random() - 0.5) * 4,
    };
    setDone(false);
    setResultData(null);
    setRunning(true);
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-secondary/20 px-3 py-2 rounded-2xl text-sm font-bold">🤖 {t('gameUI.ai')}: {aiScore}</div>
          <div className="bg-primary/20 px-3 py-2 rounded-2xl text-sm font-bold">👤 {t('gameUI.you')}: {playerScore}</div>
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
          )}
        </div>
        {!running && !done && (
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm">
            <option value="easy">{t('games.pong.descEasy')}</option>
            <option value="medium">{t('games.pong.descMedium')}</option>
            <option value="hard">{t('games.pong.descHard')}</option>
          </select>
        )}
      </div>

      <div className="relative w-full max-w-2xl">
        <canvas
          ref={canvasRef}
          className="w-full game-board cursor-none"
          style={{ aspectRatio: `${W}/${H}` }}
        />
        {!running && !done && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur rounded-2xl flex flex-col items-center justify-center text-white p-6">
            <div className="text-6xl mb-3">🏓</div>
            <h3 className="text-2xl font-bold mb-2">{t('games.pong.title')}</h3>
            <p className="text-center mb-4 opacity-90">{t('games.pong.instructions', WIN_SCORE)}</p>
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
