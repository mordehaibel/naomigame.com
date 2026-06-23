import { motion } from 'framer-motion';
import { Lock, Check, Star } from 'lucide-react';
import { useT } from '../../hooks/useT';
import { WORLDS, isWorldUnlocked, isWorldCompleted, coordsToIndex } from './worldData';

export default function WorldMap({ progress, onSelectWorld }) {
  const { t } = useT();
  // חישוב התקדמות אחוזים
  const totalLevels = WORLDS.reduce((sum, w) => sum + w.levels.length, 0);
  const progressPct = Math.min(100, (progress / totalLevels) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* פס התקדמות כללי */}
      <div className="mb-6 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg">{t('games.adventure.progress')}</span>
          <span className="text-sm font-bold text-accent-purple">
            {t('games.adventure.progressLabel', progress, totalLevels)}
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-l from-primary via-accent-purple to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* רשימת עולמות - שביל סלולר עם 5 תחנות */}
      <div className="relative">
        {/* קו מחבר ברקע */}
        <div className="absolute top-0 bottom-0 right-12 w-1 bg-gradient-to-b from-primary/30 via-accent-purple/30 to-secondary/30 hidden md:block" />

        <div className="space-y-4">
          {WORLDS.map((world, idx) => {
            const unlocked = isWorldUnlocked(idx, progress);
            const completed = isWorldCompleted(idx, progress);
            const totalInWorld = world.levels.length;
            const completedInWorld = world.levels.filter((_, i) =>
              coordsToIndex(idx, i) < progress
            ).length;

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <button
                  onClick={() => unlocked && onSelectWorld(idx)}
                  disabled={!unlocked}
                  className={`
                    w-full text-right rounded-3xl shadow-xl overflow-hidden relative
                    transition-all duration-300
                    ${unlocked ? 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'}
                  `}
                >
                  <div
                    className={`bg-gradient-to-l ${world.bgFrom} ${world.bgTo} p-5 flex items-center gap-4 relative`}
                  >
                    {/* מספר עולם */}
                    <div className="bg-white/90 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                      {idx + 1}
                    </div>

                    {/* אייקון העולם */}
                    <div className="text-6xl shrink-0 drop-shadow-lg">{world.emoji}</div>

                    {/* פרטים */}
                    <div className="flex-1 text-white">
                      <h3 className="text-2xl font-black drop-shadow-md">{t(`worlds.${idx}.name`)}</h3>
                      <p className="text-sm opacity-95 drop-shadow">{t(`worlds.${idx}.intro`)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-black/30 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold">
                          {completedInWorld}/{totalInWorld} {t('games.adventure.worldsOf')}
                        </span>
                        {completed && (
                          <span className="bg-accent-yellow text-text-primary px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <Check size={12} /> {t('games.adventure.done')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* מצב */}
                    <div className="shrink-0">
                      {!unlocked ? (
                        <div className="bg-white/20 backdrop-blur w-12 h-12 rounded-full flex items-center justify-center">
                          <Lock size={20} className="text-white" />
                        </div>
                      ) : completed ? (
                        <div className="bg-accent-yellow w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                          <Star size={24} className="text-text-primary" fill="currentColor" />
                        </div>
                      ) : (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="bg-white text-accent-purple px-4 py-2 rounded-full font-bold text-sm shadow-lg"
                        >
                          {t('games.adventure.play')}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
