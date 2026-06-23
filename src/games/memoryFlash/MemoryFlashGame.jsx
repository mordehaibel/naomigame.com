import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';

const GRID = 16; // 4x4
const COLS = 4;
const COLORS = {
  off: '#1e293b',
  on: '#FFD93D',
  correct: '#48BB78',
  wrong: '#F56565',
};

const LEVELS = {
  easy: { start: 3, flashTime: 600 },
  medium: { start: 4, flashTime: 500 },
  hard: { start: 5, flashTime: 400 },
};

function genSequence(len) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * GRID));
}

export default function MemoryFlashGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState('easy');
  const [seqLength, setSeqLength] = useState(LEVELS.easy.start);
  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'showing' | 'input' | 'success' | 'fail'
  const [activeCells, setActiveCells] = useState(new Set());
  const [playerInput, setPlayerInput] = useState([]);
  const [score, setScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const showTimerRef = useRef(null);

  const highScore = currentUser?.gameStats?.['memory-flash']?.highScore || 0;

  useEffect(() => () => clearTimeout(showTimerRef.current), []);

  const showSequence = useCallback((seq) => {
    setPhase('showing');
    setActiveCells(new Set());
    let i = 0;
    const showNext = () => {
      if (i >= seq.length) {
        setActiveCells(new Set());
        setPlayerInput([]);
        setPhase('input');
        return;
      }
      setActiveCells(new Set([seq[i]]));
      play('click');
      showTimerRef.current = setTimeout(() => {
        setActiveCells(new Set());
        showTimerRef.current = setTimeout(() => {
          i += 1;
          showNext();
        }, 200);
      }, LEVELS[level].flashTime);
    };
    showTimerRef.current = setTimeout(showNext, 500);
  }, [level, play]);

  const startNewRound = useCallback((newLength) => {
    const seq = genSequence(newLength);
    setSequence(seq);
    setSeqLength(newLength);
    showSequence(seq);
  }, [showSequence]);

  const handleStart = () => {
    play('click');
    const start = LEVELS[level].start;
    setSeqLength(start);
    setScore(0);
    setResultData(null);
    startNewRound(start);
  };

  const handleCellClick = (idx) => {
    if (phase !== 'input') return;
    const newInput = [...playerInput, idx];
    setActiveCells(new Set([idx]));
    setTimeout(() => setActiveCells(new Set()), 200);

    if (idx === sequence[playerInput.length]) {
      // נכון עד עכשיו
      if (newInput.length === sequence.length) {
        // הצליח את כל הסדר
        const newScore = score + sequence.length * 5;
        setScore(newScore);
        play('success');
        setPhase('success');
        setTimeout(() => startNewRound(sequence.length + 1), 800);
      } else {
        play('point');
        setPlayerInput(newInput);
      }
    } else {
      // טעות - סוף משחק
      play('fail');
      setPhase('fail');
      const pts = calculatePoints(score, 'reaction');
      const result = addGameScore('memory-flash', score, pts);
      setResultData(result);
      if (result.newRecord) play('fanfare');
    }
  };

  const message = phase === 'showing'
    ? t('games.memory-flash.listen')
    : phase === 'input'
    ? t('games.memory-flash.repeat', playerInput.length, sequence.length)
    : phase === 'success'
    ? t('games.memory-flash.success')
    : '';

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {t('gameUI.score')}: {score}</div>
          <div className="bg-blue-100 px-3 py-2 rounded-2xl text-sm font-bold">📊 {t('gameUI.level')}: {seqLength}</div>
          {highScore > 0 && (
            <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">{t('gameUI.record')}: {highScore}</div>
          )}
        </div>
        {phase === 'idle' && (
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 rounded-2xl border-2 border-gray-200 font-semibold text-sm">
            <option value="easy">{t('games.memory-flash.descEasy')}</option>
            <option value="medium">{t('games.memory-flash.descMedium')}</option>
            <option value="hard">{t('games.memory-flash.descHard')}</option>
          </select>
        )}
      </div>

      {phase !== 'idle' && (
        <div className="bg-white px-4 py-2 rounded-2xl font-bold mb-4 shadow">{message}</div>
      )}

      {phase === 'idle' ? (
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 w-full">
          <div className="text-5xl mb-3">💡</div>
          <h3 className="text-2xl font-bold mb-2">{t('games.memory-flash.title')}</h3>
          <p className="text-gray-600 mb-6">{t('games.memory-flash.instructions')}</p>
          <Button variant="primary" size="lg" icon={Play} onClick={handleStart}>{t('common.start')}</Button>
        </div>
      ) : (
        <div className="grid gap-2 p-4 bg-slate-800 rounded-3xl shadow-2xl" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, width: 'min(100%, 400px)' }}>
          {Array.from({ length: GRID }).map((_, i) => {
            const isActive = activeCells.has(i);
            return (
              <motion.button
                key={i}
                whileTap={phase === 'input' ? { scale: 0.92 } : {}}
                onClick={() => handleCellClick(i)}
                disabled={phase !== 'input'}
                className="aspect-square rounded-xl shadow transition-all duration-150"
                style={{
                  backgroundColor: isActive ? (phase === 'fail' ? COLORS.wrong : phase === 'success' ? COLORS.correct : COLORS.on) : COLORS.off,
                  boxShadow: isActive ? `0 0 30px ${COLORS.on}` : 'inset 0 0 10px rgba(0,0,0,0.5)',
                }}
              />
            );
          })}
        </div>
      )}

      <GameResultModal
        open={phase === 'fail' && !!resultData}
        isWin={score >= 30}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={() => { setPhase('idle'); setResultData(null); handleStart(); }}
      />
    </div>
  );
}
