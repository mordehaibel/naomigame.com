import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import GameArena from '../../components/games/GameArena';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

// 3 nתיבים, התווים בעמדות 16.6%, 50%, 83.3%
const LANE_COUNT = 3;
const LANE_POSITIONS = [16.66, 50, 83.33];
const CHARACTER_BOTTOM = 12; // % מלמטה
const BASE_SPEED = 1.0; // % לפריים (50ms)
const TICK_MS = 50;
const HIT_BOX = 9; // טווח התנגשות (Y%)

// קושי לפי דקות
function getDifficulty(seconds) {
  if (seconds < 60) return 0;
  if (seconds < 120) return 1;
  if (seconds < 180) return 2;
  return 3;
}
function getSpeed(seconds) {
  return BASE_SPEED * [1, 1.1, 1.25, 1.6][getDifficulty(seconds)];
}
function getSpawnInterval(seconds) {
  return [1500, 1100, 850, 650][getDifficulty(seconds)];
}
function getScoreMultiplier(seconds) {
  return [1, 2, 4, 6][getDifficulty(seconds)];
}

export default function RunnerEngine({ config }) {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [phase, setPhase] = useState('idle');
  const [lane, setLane] = useState(1);
  const [jumping, setJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [resultData, setResultData] = useState(null);

  // refs לשימוש בתוך setInterval (state עומד מעודכן)
  const phaseRef = useRef('idle');
  const laneRef = useRef(1);
  const jumpingRef = useRef(false);
  const timeRef = useRef(0);
  const scoreRef = useRef(0);
  const obstaclesRef = useRef([]);
  const idCounter = useRef(0);
  const spawnAccumRef = useRef(0);

  const moveTickRef = useRef(null);
  const timeTickRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { laneRef.current = lane; }, [lane]);
  useEffect(() => { jumpingRef.current = jumping; }, [jumping]);

  const cleanup = useCallback(() => {
    clearInterval(moveTickRef.current);
    clearInterval(timeTickRef.current);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const highScore = currentUser?.gameStats?.[config.id]?.highScore || 0;

  const handleGameOver = useCallback(() => {
    if (phaseRef.current === 'gameOver') return;
    cleanup();
    setPhase('gameOver');
    play('fail');
    const finalScore = scoreRef.current;
    const points = calculatePoints(finalScore, 'reaction');
    const result = addGameScore(config.id, finalScore, points);
    setResultData({ ...result, score: finalScore, time: timeRef.current });
    if (result.newRecord) play('fanfare');
  }, [cleanup, addGameScore, config.id, play]);

  const startGame = () => {
    setLane(1);
    laneRef.current = 1;
    setObstacles([]);
    obstaclesRef.current = [];
    setScore(0);
    scoreRef.current = 0;
    setTime(0);
    timeRef.current = 0;
    setJumping(false);
    jumpingRef.current = false;
    spawnAccumRef.current = 0;
    setResultData(null);
    setPhase('playing');
    play('click');
  };

  // לולאת תזוזה + spawn (50ms)
  useEffect(() => {
    if (phase !== 'playing') return;

    moveTickRef.current = setInterval(() => {
      const sec = timeRef.current;
      const speed = getSpeed(sec);
      const charY = 100 - CHARACTER_BOTTOM;
      const isJumping = jumpingRef.current;
      const charLane = laneRef.current;
      const mul = getScoreMultiplier(sec);

      let collided = false;
      let pointsGained = 0;

      // הזזה + בדיקה
      const updated = [];
      for (const o of obstaclesRef.current) {
        const newY = o.y + speed;
        if (newY > 110) continue; // יצא מהמסך

        const inDanger = Math.abs(newY - charY) < HIT_BOX;
        if (inDanger && o.lane === charLane && !isJumping && !o.passed) {
          collided = true;
        }
        // עבר את הדמות?
        if (!o.passed && newY > charY + HIT_BOX) {
          o.passed = true;
          pointsGained += 10 * mul;
        }
        updated.push({ ...o, y: newY });
      }
      obstaclesRef.current = updated;

      if (pointsGained > 0) {
        scoreRef.current += pointsGained;
        setScore(scoreRef.current);
      }

      // spawn אוטומטי - מצטבר זמן לפי המהירות הרצויה
      spawnAccumRef.current += TICK_MS;
      if (spawnAccumRef.current >= getSpawnInterval(sec)) {
        spawnAccumRef.current = 0;
        idCounter.current += 1;
        const obs = config.obstacles[Math.floor(Math.random() * config.obstacles.length)];
        const obstacleLane = Math.floor(Math.random() * LANE_COUNT);
        // לפעמים שורה של 2 חסומים (קושי גבוה)
        const dual = sec >= 90 && Math.random() < 0.3;
        obstaclesRef.current.push({
          id: idCounter.current,
          lane: obstacleLane,
          y: -8,
          type: obs,
          passed: false,
        });
        if (dual) {
          let secondLane = (obstacleLane + 1 + Math.floor(Math.random() * (LANE_COUNT - 1))) % LANE_COUNT;
          obstaclesRef.current.push({
            id: idCounter.current * 1000,
            lane: secondLane,
            y: -8,
            type: config.obstacles[Math.floor(Math.random() * config.obstacles.length)],
            passed: false,
          });
        }
      }

      setObstacles([...obstaclesRef.current]);

      if (collided) handleGameOver();
    }, TICK_MS);

    // טיימר + נקודה לשנייה
    timeTickRef.current = setInterval(() => {
      timeRef.current += 1;
      const mul = getScoreMultiplier(timeRef.current);
      scoreRef.current += 1 * mul;
      setTime(timeRef.current);
      setScore(scoreRef.current);
    }, 1000);

    return cleanup;
  }, [phase, config.obstacles, cleanup, handleGameOver]);

  // מקלדת
  useEffect(() => {
    const handler = (e) => {
      if (phaseRef.current !== 'playing') return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') {
        e.preventDefault();
        setLane((l) => Math.max(0, l - 1));
        play('click');
      } else if (k === 'arrowright' || k === 'd') {
        e.preventDefault();
        setLane((l) => Math.min(LANE_COUNT - 1, l + 1));
        play('click');
      } else if (config.canJump && (k === 'arrowup' || k === 'w' || k === ' ')) {
        e.preventDefault();
        if (!jumpingRef.current) {
          jumpingRef.current = true;
          setJumping(true);
          play('point');
          setTimeout(() => {
            jumpingRef.current = false;
            setJumping(false);
          }, 700);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [config.canJump, play]);

  const moveLane = (delta) => {
    if (phase !== 'playing') return;
    setLane((l) => Math.max(0, Math.min(LANE_COUNT - 1, l + delta)));
    play('click');
  };
  const doJump = () => {
    if (phase !== 'playing' || !config.canJump) return;
    if (!jumpingRef.current) {
      jumpingRef.current = true;
      setJumping(true);
      play('point');
      setTimeout(() => {
        jumpingRef.current = false;
        setJumping(false);
      }, 700);
    }
  };

  const difficulty = getDifficulty(time);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <GameArena
        stats={
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs md:text-sm font-bold flex-wrap">
            <div className="bg-pink-100 px-2 py-0.5 rounded-full">⭐ {score}</div>
            <div className="bg-blue-100 px-2 py-0.5 rounded-full">⏱️ {time}{t('gameUI.secAbbr')}</div>
            <div className="bg-accent-yellow/40 px-2 py-0.5 rounded-full">🔥 ×{getScoreMultiplier(time)}</div>
            <div className="bg-orange-200 px-2 py-0.5 rounded-full">💨 {difficulty + 1}/4</div>
            {highScore > 0 && (
              <div className="bg-purple-100 px-2 py-0.5 rounded-full">🏆 {highScore}</div>
            )}
          </div>
        }
        controls={
          <div className="grid grid-cols-3 gap-2 md:hidden w-full max-w-xs">
            <button onClick={() => moveLane(-1)} className="bg-primary text-white p-3 rounded-xl text-2xl active:scale-95">←</button>
            {config.canJump ? (
              <button onClick={doJump} className="bg-accent-yellow text-text-primary p-3 rounded-xl text-2xl active:scale-95 font-black">↑</button>
            ) : (
              <div />
            )}
            <button onClick={() => moveLane(1)} className="bg-primary text-white p-3 rounded-xl text-2xl active:scale-95">→</button>
          </div>
        }
      >
      {/* אזור משחק - מודרני עם זוהר. רוחב מוגבל לפי גובה המסך → תמיד נכנס בלי גלילה */}
      <div
        className="relative rounded-3xl overflow-hidden touch-none select-none mx-auto"
        style={{
          aspectRatio: '3 / 5',
          width: 'min(100%, calc((100dvh - var(--game-reserve, 335px)) * 3 / 5))',
          background: config.background,
          boxShadow:
            '0 25px 60px rgba(0,0,0,0.45), 0 0 0 3px rgba(255,255,255,0.85), inset 0 0 60px rgba(255,255,255,0.05), inset 0 4px 14px rgba(255,255,255,0.12)',
        }}
      >
        {/* חלקיקים זוהרים מרחפים ברקע */}
        <RunnerParticles />

        {/* קווי נתיבים */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(i * 100) / LANE_COUNT}%`,
              width: 0,
              borderLeft: `3px ${config.laneStyle || 'dashed'} ${config.laneColor || 'rgba(255,255,255,0.3)'}`,
            }}
          />
        ))}

        {/* תפאורת רקע נוספת ספציפית למשחק */}
        {config.backgroundDecor && config.backgroundDecor()}

        {/* חסומים נופלים */}
        {obstacles.map((o) => (
          <div
            key={o.id}
            className="absolute text-3xl md:text-4xl"
            style={{
              left: `${LANE_POSITIONS[o.lane]}%`,
              top: `${o.y}%`,
              transform: 'translate(-50%, -50%)',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
            }}
          >
            {o.type}
          </div>
        ))}

        {/* דמות - עם הילה זוהרת */}
        <motion.div
          className="absolute text-4xl md:text-5xl"
          style={{
            left: `${LANE_POSITIONS[lane]}%`,
            bottom: `${jumping ? CHARACTER_BOTTOM + 14 : CHARACTER_BOTTOM}%`,
            transform: 'translateX(-50%)',
            transition: 'left 0.12s ease-out, bottom 0.18s ease-out',
            filter: jumping
              ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.55)) drop-shadow(0 0 20px rgba(255,215,0,0.7))'
              : 'drop-shadow(0 2px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 14px rgba(255,255,255,0.4))',
            zIndex: 10,
          }}
        >
          {config.character}
        </motion.div>

        {/* idle מסך */}
        {phase === 'idle' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="text-6xl mb-3">{config.character}</div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              {t(`games.${config.id}.title`) || t(`games.${config.id}.name`)}
            </h3>
            <p className="text-sm opacity-95 mb-4">
              ← → {config.canJump ? '↑/Space' : ''} · {t(`games.${config.id}.instructions`) || ''}
            </p>
            <Button variant="primary" size="md" icon={Play} onClick={startGame}>
              {t('common.start')}
            </Button>
          </div>
        )}
      </div>

      </GameArena>

      <GameResultModal
        open={phase === 'gameOver' && !!resultData}
        isWin={resultData?.score >= 200}
        score={resultData?.score || 0}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={startGame}
      />
    </div>
  );
}

// חלקיקים זוהרים מרחפים ברקע אזור המשחק
function RunnerParticles() {
  // 10 חלקיקים בעמדות אקראיות עם delays שונים
  const particles = [
    { left: '10%', size: 3, dur: 6, delay: 0, drift: 12 },
    { left: '22%', size: 2, dur: 8, delay: 1.2, drift: -8 },
    { left: '35%', size: 4, dur: 7, delay: 0.5, drift: 15 },
    { left: '48%', size: 2, dur: 9, delay: 2.0, drift: -10 },
    { left: '60%', size: 3, dur: 6.5, delay: 1.6, drift: 18 },
    { left: '73%', size: 2, dur: 7.5, delay: 0.3, drift: -14 },
    { left: '85%', size: 4, dur: 8, delay: 2.4, drift: 10 },
    { left: '15%', size: 2, dur: 9, delay: 3.0, drift: -6 },
    { left: '50%', size: 3, dur: 7, delay: 4.0, drift: 8 },
    { left: '92%', size: 2, dur: 6.5, delay: 0.9, drift: -12 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(255,215,0,0.5)',
            animation: `float-up-particle ${p.dur}s linear ${p.delay}s infinite`,
            ['--drift']: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
