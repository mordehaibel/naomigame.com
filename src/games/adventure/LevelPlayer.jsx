import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Button from '../../components/common/Button';
import CharacterDisplay from '../../components/characters/CharacterDisplay';
import Confetti from '../../components/common/Confetti';
import { useAuth } from '../../hooks/useAuth';
import { useT } from '../../hooks/useT';
import CatchStars from './mini/CatchStars';
import MemoryFlip from './mini/MemoryFlip';
import SimonSays from './mini/SimonSays';

const MINI_GAMES = {
  catch: CatchStars,
  memory: MemoryFlip,
  simon: SimonSays,
};

// מנגן רמה: אינטרו → מיני-משחק → תוצאה
export default function LevelPlayer({ world, worldIdx, levelIdx, onComplete, onBack }) {
  const { currentUser } = useAuth();
  const { t } = useT();
  const level = world.levels[levelIdx];
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'result'
  const [result, setResult] = useState(null); // {success, score}

  const MiniGameComponent = MINI_GAMES[level.type];
  const isMale = currentUser?.gender === 'male';

  const handleMiniComplete = (success, score) => {
    setResult({ success, score });
    setPhase('result');
  };

  const handleNext = () => {
    onComplete(result.success, result.score);
  };

  const handleRetry = () => {
    setResult(null);
    setPhase('playing');
  };

  return (
    <div
      className={`min-h-[60vh] bg-gradient-to-b ${world.bgFrom} ${world.bgTo} rounded-3xl p-6 relative overflow-hidden`}
    >
      {/* כפתור יציאה */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition z-10"
      >
        <ArrowRight size={20} className="text-text-primary" />
      </button>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center text-center text-white py-8"
          >
            <div className="text-7xl mb-3 drop-shadow-lg">{world.emoji}</div>
            <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-bold mb-3">
              {t('games.adventure.worldLevel', worldIdx + 1, levelIdx + 1)}
            </div>
            <h2 className="text-3xl md:text-4xl font-black drop-shadow-lg mb-4">
              {t(`worlds.${worldIdx}.name`)}
            </h2>
            <div className="bg-white/95 backdrop-blur rounded-3xl p-5 max-w-md shadow-xl text-text-primary mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <CharacterDisplay
                  gender={currentUser?.gender || 'male'}
                  size="md"
                  pose="pointing"
                />
              </div>
              <p className="text-lg font-bold">{t(`levelIntros.${level.type}.${level.introKey}`)}</p>
            </div>
            <Button variant="primary" size="lg" icon={Play} onClick={() => setPhase('playing')}>
              {t('games.adventure.go')}
            </Button>
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="bg-black/20 backdrop-blur rounded-full px-4 py-1 mb-4 text-white text-sm font-bold">
              {t('games.adventure.worldLevel', worldIdx + 1, levelIdx + 1)}
            </div>
            <MiniGameComponent
              config={level}
              accent={world.accent}
              worldId={worldIdx}
              onComplete={handleMiniComplete}
            />
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8"
          >
            {result.success && <Confetti active count={60} />}
            <div className="bg-white/95 backdrop-blur rounded-3xl p-6 max-w-md shadow-2xl">
              <div className="flex justify-center mb-3">
                <CharacterDisplay
                  gender={currentUser?.gender || 'male'}
                  size="lg"
                  pose={result.success ? 'celebrating' : 'sad'}
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                {result.success
                  ? t('results.win', currentUser?.name || '', isMale)
                  : t('results.loss', currentUser?.name || '', isMale)}
              </h2>
              <div className="bg-pink-100 rounded-2xl p-3 my-3">
                <div className="text-sm text-gray-600">{t('results.yourScore')}</div>
                <div className="text-3xl font-black text-accent-purple">⭐ {result.score}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {!result.success && (
                  <Button variant="secondary" size="md" fullWidth onClick={handleRetry}>
                    {t('games.adventure.retry')}
                  </Button>
                )}
                <Button variant="primary" size="md" fullWidth onClick={handleNext}>
                  {result.success ? t('games.adventure.continueJourney') : t('games.adventure.backToLevels')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
