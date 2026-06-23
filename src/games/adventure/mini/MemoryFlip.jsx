import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../../../hooks/useSound';
import { useT } from '../../../hooks/useT';

const EMOJI_POOLS = [
  ['🤠', '🐎', '🌵', '🏜️', '🎸', '⭐'], // USA - Far West
  ['🌸', '⛩️', '🍣', '🗾', '🍙', '🎋'], // יפן
  ['🗼', '🥖', '🧀', '🥐', '🎨', '🍷'], // צרפת
  ['🐪', '🏺', '⚱️', '☥', '🌞', '🐫'], // מצרים
  ['🌴', '🦜', '🥥', '🦋', '🌺', '🐆'], // ברזיל
];

function buildDeck(numPairs, worldId) {
  const pool = EMOJI_POOLS[worldId % EMOJI_POOLS.length];
  const chosen = pool.slice(0, numPairs);
  return [...chosen, ...chosen]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

// מיני-משחק: מצא {pairs} זוגות בתוך {maxMoves} מהלכים
export default function MemoryFlip({ config, onComplete, accent, worldId = 0 }) {
  const { play } = useSound();
  const { t } = useT();
  const { pairs, maxMoves } = config;

  const [deck, setDeck] = useState(() => buildDeck(pairs, worldId));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // אתחול אם הקונפיג השתנה
  useEffect(() => {
    setDeck(buildDeck(pairs, worldId));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setBusy(false);
    setDone(false);
  }, [pairs, worldId]);

  // לוגיקת התאמה
  useEffect(() => {
    if (flipped.length !== 2) return;
    setBusy(true);
    setMoves((m) => m + 1);
    const [a, b] = flipped;
    const cardA = deck.find((c) => c.id === a);
    const cardB = deck.find((c) => c.id === b);
    if (cardA.emoji === cardB.emoji) {
      setTimeout(() => {
        setDeck((d) => d.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)));
        setMatched((m) => m + 1);
        setFlipped([]);
        setBusy(false);
        play('point');
      }, 400);
    } else {
      setTimeout(() => {
        setDeck((d) => d.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c)));
        setFlipped([]);
        setBusy(false);
      }, 800);
    }
  }, [flipped, deck, play]);

  // בדיקת ניצחון/הפסד
  useEffect(() => {
    if (done) return;
    if (matched === pairs) {
      setDone(true);
      const score = pairs * 15 + Math.max(0, (maxMoves - moves) * 5);
      play('success');
      setTimeout(() => onComplete(true, score), 600);
    } else if (moves >= maxMoves && flipped.length === 0) {
      setDone(true);
      play('fail');
      setTimeout(() => onComplete(false, matched * 10), 600);
    }
  }, [matched, moves, pairs, maxMoves, done, flipped.length, onComplete, play]);

  const handleClick = (id) => {
    if (busy || done) return;
    const card = deck.find((c) => c.id === id);
    if (card.flipped || card.matched) return;
    if (flipped.length === 2) return;
    play('click');
    setDeck((d) => d.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setFlipped((f) => [...f, id]);
  };

  const cols = pairs <= 3 ? 3 : pairs <= 4 ? 4 : pairs <= 6 ? 4 : 6;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* סטטיסטיקה */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white/90 px-3 py-2 rounded-2xl text-sm font-bold">
          {t('games.adventure.memoryMatches')}: {matched}/{pairs}
        </div>
        <div className="bg-white/90 px-3 py-2 rounded-2xl text-sm font-bold">
          🔄 {t('gameUI.moves')}: {moves}/{maxMoves}
        </div>
      </div>

      <div
        className="grid gap-2 w-full max-w-md"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {deck.map((card) => {
          const isFlipped = card.flipped || card.matched;
          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: card.matched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(card.id)}
              className="aspect-square cursor-pointer"
            >
              <div className={`flip-card w-full h-full ${isFlipped ? 'flipped' : ''}`}>
                <div className="flip-card-inner">
                  <div
                    className="flip-card-front shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                    }}
                  >
                    <span className="text-white text-3xl font-black">?</span>
                  </div>
                  <div className={`flip-card-back text-4xl ${card.matched ? 'bg-success-green/30' : 'bg-white shadow-lg'}`}>
                    {card.emoji}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
