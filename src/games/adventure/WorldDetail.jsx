import { motion } from 'framer-motion';
import { ArrowRight, Lock, Check, Play } from 'lucide-react';
import Button from '../../components/common/Button';
import { useT } from '../../hooks/useT';
import { isLevelUnlocked, isLevelCompleted, coordsToIndex } from './worldData';

const TYPE_EMOJI = { catch: '⭐', memory: '🃏', simon: '🎵' };

// תצוגת רמות בתוך עולם
export default function WorldDetail({ world, worldIdx, progress, onSelectLevel, onBack }) {
  const { t } = useT();
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* כותרת העולם */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-l ${world.bgFrom} ${world.bgTo} rounded-3xl p-6 mb-6 shadow-2xl text-white text-center relative`}
      >
        <button
          onClick={onBack}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/40 transition"
        >
          <ArrowRight size={20} className="text-white" />
        </button>
        <div className="text-7xl mb-2 drop-shadow-lg">{world.emoji}</div>
        <h2 className="text-3xl md:text-4xl font-black drop-shadow-md mb-1">{t(`worlds.${worldIdx}.name`)}</h2>
        <p className="text-lg opacity-95 drop-shadow">{t(`worlds.${worldIdx}.intro`)}</p>
      </motion.div>

      {/* רשימת רמות */}
      <div className="space-y-3">
        {world.levels.map((level, levelIdx) => {
          const unlocked = isLevelUnlocked(worldIdx, levelIdx, progress);
          const completed = isLevelCompleted(worldIdx, levelIdx, progress);
          const typeEmoji = TYPE_EMOJI[level.type];
          const typeName = t(`miniTypes.${level.type}`);
          const introText = t(`levelIntros.${level.type}.${level.introKey}`);

          return (
            <motion.div
              key={levelIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: levelIdx * 0.1 }}
            >
              <button
                onClick={() => unlocked && onSelectLevel(levelIdx)}
                disabled={!unlocked}
                className={`
                  w-full text-right bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg
                  flex items-center gap-4 transition-all
                  ${unlocked ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  ${completed ? 'border-r-4 border-accent-yellow' : ''}
                `}
              >
                {/* מספר רמה */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-md"
                  style={{
                    backgroundColor: completed ? '#FACC15' : unlocked ? world.accent : '#9CA3AF',
                    color: completed ? '#1F2937' : '#FFFFFF',
                  }}
                >
                  {completed ? <Check size={28} /> : levelIdx + 1}
                </div>

                {/* פרטים */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{typeEmoji}</span>
                    <h3 className="font-bold text-lg">
                      {t('games.adventure.levelLabel', levelIdx + 1)} · {typeName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{introText}</p>
                </div>

                {/* כפתור */}
                <div className="shrink-0">
                  {!unlocked ? (
                    <div className="bg-gray-300 p-3 rounded-full">
                      <Lock size={20} className="text-gray-500" />
                    </div>
                  ) : (
                    <motion.div
                      animate={completed ? {} : { scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="bg-gradient-to-l from-primary to-accent-purple text-white p-3 rounded-full shadow-lg"
                    >
                      <Play size={20} />
                    </motion.div>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* כפתור חזרה למפה */}
      <div className="mt-6 text-center">
        <Button variant="ghost" size="md" icon={ArrowRight} onClick={onBack}>
          {t('games.adventure.backToMap')}
        </Button>
      </div>
    </div>
  );
}
