import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useT } from '../../hooks/useT';
import Confetti from '../../components/common/Confetti';
import CharacterDisplay from '../../components/characters/CharacterDisplay';
import Button from '../../components/common/Button';
import WorldMap from './WorldMap';
import WorldDetail from './WorldDetail';
import LevelPlayer from './LevelPlayer';
import {
  WORLDS,
  TOTAL_LEVELS,
  coordsToIndex,
  isWorldCompleted,
} from './worldData';
import { calculatePoints } from '../../utils/greetings';

// view: 'map' | 'world' | 'level' | 'allDone'
export default function AdventureGame() {
  const { currentUser, updateUser, addGameScore } = useAuth();
  const { t } = useT();

  const [view, setView] = useState('map');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [worldCompleteModal, setWorldCompleteModal] = useState(null); // worldIdx
  const [allDoneModal, setAllDoneModal] = useState(false);

  const progress = currentUser?.adventureProgress || 0;

  const handleSelectWorld = (worldIdx) => {
    setSelectedWorld(worldIdx);
    setView('world');
  };

  const handleSelectLevel = (levelIdx) => {
    setSelectedLevel(levelIdx);
    setView('level');
  };

  const handleLevelComplete = (success, score) => {
    if (success) {
      const globalIdx = coordsToIndex(selectedWorld, selectedLevel);
      const newProgress = Math.max(progress, globalIdx + 1);
      updateUser({ adventureProgress: newProgress });

      // נקודות באתר
      const pts = calculatePoints(score, 'memory');
      addGameScore('adventure', score, pts);

      // בדיקה אם השלמנו עולם
      const wasWorldComplete = isWorldCompleted(selectedWorld, progress);
      const isNowWorldComplete = isWorldCompleted(selectedWorld, newProgress);
      if (!wasWorldComplete && isNowWorldComplete) {
        // הצג חגיגה של עולם
        if (newProgress >= TOTAL_LEVELS) {
          setAllDoneModal(true);
          setView('map');
        } else {
          setWorldCompleteModal(selectedWorld);
          setView('world');
        }
        return;
      }

      // אחרת חזרה לתצוגת רמות
      setView('world');
    } else {
      // הפסד - חזרה לתצוגת רמות
      setView('world');
    }
  };

  const handleBackToMap = () => {
    setView('map');
    setSelectedWorld(null);
    setSelectedLevel(null);
  };

  const handleBackToWorld = () => {
    setView('world');
    setSelectedLevel(null);
  };

  return (
    <div className="relative">
      {/* כותרת */}
      {view === 'map' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-shadow-fun bg-gradient-to-l from-primary via-accent-purple to-secondary bg-clip-text text-transparent">
            {t('games.adventure.title')}
          </h1>
          <p className="text-gray-700">{t('games.adventure.tagline')}</p>
        </motion.div>
      )}

      {/* תצוגה מתחלפת */}
      <AnimatePresence mode="wait">
        {view === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <WorldMap progress={progress} onSelectWorld={handleSelectWorld} />
          </motion.div>
        )}

        {view === 'world' && selectedWorld !== null && (
          <motion.div
            key={`world-${selectedWorld}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <WorldDetail
              world={WORLDS[selectedWorld]}
              worldIdx={selectedWorld}
              progress={progress}
              onSelectLevel={handleSelectLevel}
              onBack={handleBackToMap}
            />
          </motion.div>
        )}

        {view === 'level' && selectedWorld !== null && selectedLevel !== null && (
          <motion.div
            key={`level-${selectedWorld}-${selectedLevel}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <LevelPlayer
              world={WORLDS[selectedWorld]}
              worldIdx={selectedWorld}
              levelIdx={selectedLevel}
              onComplete={handleLevelComplete}
              onBack={handleBackToWorld}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* מודל סיום עולם */}
      <AnimatePresence>
        {worldCompleteModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4"
            onClick={() => setWorldCompleteModal(null)}
          >
            <Confetti active count={120} />
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className={`bg-gradient-to-br ${WORLDS[worldCompleteModal].bgFrom} ${WORLDS[worldCompleteModal].bgTo} rounded-3xl p-8 max-w-md text-white text-center shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-7xl mb-3 drop-shadow-lg">
                {WORLDS[worldCompleteModal].emoji}
              </div>
              <h2 className="text-3xl font-black drop-shadow-lg mb-2">
                {t('games.adventure.worldComplete', t(`worlds.${worldCompleteModal}.name`))}
              </h2>
              <p className="text-lg mb-4 drop-shadow opacity-95">
                {t(`worlds.${worldCompleteModal}.completion`)}
              </p>
              <div className="flex justify-center gap-2 mb-4">
                <CharacterDisplay
                  gender={currentUser?.gender || 'male'}
                  pose="celebrating"
                  size="md"
                />
              </div>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setWorldCompleteModal(null)}
                className="!bg-white"
              >
                {t('games.adventure.continueJourney')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* מודל סיום הכל */}
      <AnimatePresence>
        {allDoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4"
          >
            <Confetti active count={200} />
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-accent-yellow via-primary to-accent-purple rounded-3xl p-8 max-w-lg text-white text-center shadow-2xl"
            >
              <Trophy size={80} className="mx-auto mb-3 text-yellow-200 drop-shadow-lg" />
              <h2 className="text-4xl font-black drop-shadow-lg mb-3">
                {t('games.adventure.youAreLegend')}
              </h2>
              <p className="text-xl mb-4 drop-shadow opacity-95">
                {t('games.adventure.finishedAll')}
              </p>
              <div className="flex justify-center gap-3 mb-5">
                <CharacterDisplay
                  gender="male"
                  pose="celebrating"
                  size="md"
                  forceCharacter="shlomi"
                />
                <CharacterDisplay
                  gender="female"
                  pose="celebrating"
                  size="md"
                  forceCharacter="naomi"
                />
              </div>
              <Button variant="secondary" size="lg" onClick={() => setAllDoneModal(false)}>
                {t('games.adventure.backToMapBtn')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
