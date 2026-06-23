import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import GameResultModal from '../../components/games/GameResultModal';
import DifficultySelector from '../../components/games/DifficultySelector';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';
import { calculatePoints } from '../../utils/greetings';
import { getDefaultDifficulty } from '../../utils/difficulty';

const EMOJI_POOL = [
  '🎮','🎯','🎨','🎭','🎲','🎸','🎺','🎻','🎹','🥁',
  '🚀','🌟','🌈','🦄','🐶','🐱','🐰','🐯','🦊','🐼',
  '🌸','🌺','🌻','🍀','⚽','🏀','🎾','🏆','💎','🔥',
];

const LEVELS = {
  easy: { pairs: 4, cols: 4, timeBonus: 50 },
  medium: { pairs: 8, cols: 4, timeBonus: 70 },
  hard: { pairs: 12, cols: 6, timeBonus: 90 },
};

function buildDeck(numPairs) {
  const chosen = [...EMOJI_POOL].sort(() => Math.random() - 0.5).slice(0, numPairs);
  return [...chosen, ...chosen]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

export default function MemoryGame() {
  const { addGameScore, currentUser } = useAuth();
  const { play } = useSound();
  const { t } = useT();

  const [level, setLevel] = useState(() => getDefaultDifficulty(currentUser?.age));
  const [phase, setPhase] = useState('select'); // 'select' | 'playing' | 'done'
  const [deck, setDeck] = useState(() => buildDeck(LEVELS[getDefaultDifficulty(currentUser?.age)].pairs));
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [busy, setBusy] = useState(false);

  const totalPairs = LEVELS[level].pairs;
  const highScore = currentUser?.gameStats?.memory?.highScore || 0;

  const reset = useCallback((newLevel = level) => {
    setDeck(buildDeck(LEVELS[newLevel].pairs));
    setFlippedIds([]);
    setMoves(0);
    setMatched(0);
    setStartTime(null);
    setElapsed(0);
    setScore(0);
    setResultData(null);
    setBusy(false);
  }, [level]);

  useEffect(() => {
    if (!startTime || phase !== 'playing') return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(t);
  }, [startTime, phase]);

  useEffect(() => {
    if (flippedIds.length !== 2) return;
    setBusy(true);
    setMoves((m) => m + 1);
    const [a, b] = flippedIds;
    const cardA = deck.find((c) => c.id === a);
    const cardB = deck.find((c) => c.id === b);
    if (cardA.emoji === cardB.emoji) {
      setTimeout(() => {
        setDeck((d) => d.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)));
        setMatched((m) => m + 1);
        setFlippedIds([]);
        setBusy(false);
        play('point');
      }, 500);
    } else {
      setTimeout(() => {
        setDeck((d) => d.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c)));
        setFlippedIds([]);
        setBusy(false);
      }, 900);
    }
  }, [flippedIds, deck, play]);

  useEffect(() => {
    if (matched > 0 && matched === totalPairs && phase === 'playing') {
      setPhase('done');
      const baseScore = totalPairs * 10;
      const movesPenalty = Math.max(0, (moves - totalPairs) * 2);
      const timeBonus = Math.max(0, LEVELS[level].timeBonus - elapsed);
      const finalScore = Math.max(10, baseScore - movesPenalty + timeBonus);
      setScore(finalScore);
      const points = calculatePoints(finalScore, 'memory');
      const result = addGameScore('memory', finalScore, points);
      setResultData(result);
      play(result.newRecord ? 'fanfare' : 'success');
    }
  }, [matched, totalPairs, moves, elapsed, level, addGameScore, play, phase]);

  const handleClick = (cardId) => {
    if (busy) return;
    if (!startTime) setStartTime(Date.now());
    const card = deck.find((c) => c.id === cardId);
    if (card.flipped || card.matched) return;
    if (flippedIds.length === 2) return;
    play('click');
    setDeck((d) => d.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)));
    setFlippedIds((f) => [...f, cardId]);
  };

  const handleStart = () => {
    play('click');
    reset();
    setPhase('playing');
  };

  const handleSelectLevel = (newLevel) => {
    setLevel(newLevel);
    setDeck(buildDeck(LEVELS[newLevel].pairs));
  };

  const cols = LEVELS[level].cols;

  if (phase === 'select') {
    return (
      <div className="flex flex-col items-center">
        <DifficultySelector
          current={level}
          onSelect={handleSelectLevel}
          onStart={handleStart}
          emoji="🎴"
          title={t('games.memory.title')}
          recommendedAge={currentUser?.age}
          descriptions={{
            easy: t('games.memory.descEasy'),
            medium: t('games.memory.descMedium'),
            hard: t('games.memory.descHard'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-pink-100 px-3 py-2 rounded-2xl text-sm font-bold">🃏 {t('gameUI.matches')}: {matched}/{totalPairs}</div>
          <div className="bg-blue-100 px-3 py-2 rounded-2xl text-sm font-bold">🔄 {t('gameUI.moves')}: {moves}</div>
          <div className="bg-accent-yellow/30 px-3 py-2 rounded-2xl text-sm font-bold">⏱️ {elapsed}{t('gameUI.secAbbr')}</div>
          {highScore > 0 && (
            <div className="bg-purple-100 px-3 py-2 rounded-2xl text-sm font-bold">⭐ {t('gameUI.record')}: {highScore}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => reset()}>{t('gameUI.reset')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { reset(); setPhase('select'); }}>{t('difficulty.changeLevel')}</Button>
        </div>
      </div>

      <div className="grid gap-2 md:gap-3 w-full" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {deck.map((card) => (
          <Card key={card.id} card={card} onClick={() => handleClick(card.id)} />
        ))}
      </div>

      <GameResultModal
        open={phase === 'done' && !!resultData}
        isWin={true}
        score={score}
        newRecord={resultData?.newRecord}
        newAchievements={resultData?.newAchievements || []}
        onPlayAgain={() => { reset(); setPhase('playing'); }}
      />
    </div>
  );
}

function Card({ card, onClick }) {
  const isFlipped = card.flipped || card.matched;
  return (
    <motion.div
      whileHover={{ scale: card.matched ? 1 : 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="aspect-square cursor-pointer"
    >
      <div className={`flip-card w-full h-full ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-card-inner">
          <div
            className="flip-card-front shadow-2xl"
            style={{
              background:
                'linear-gradient(135deg, #FF6B9D 0%, #C471ED 50%, #6366F1 100%)',
              boxShadow:
                '0 12px 30px rgba(196, 113, 237, 0.45), inset 0 2px 8px rgba(255,255,255,0.4), inset 0 -8px 20px rgba(76,29,149,0.3)',
            }}
          >
            <span
              className="text-white text-4xl font-black"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4), 0 0 16px rgba(255,255,255,0.5)' }}
            >
              ?
            </span>
          </div>
          <div
            className={`flip-card-back text-4xl md:text-5xl shadow-2xl ${card.matched ? 'animate-pulse-glow' : ''}`}
            style={{
              background: card.matched
                ? 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #fef3f9 100%)',
              boxShadow: card.matched
                ? '0 8px 30px rgba(16,185,129,0.4), inset 0 0 20px rgba(110,231,183,0.3)'
                : '0 8px 25px rgba(196,113,237,0.25), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {card.emoji}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
