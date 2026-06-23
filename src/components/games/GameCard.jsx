import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Play } from 'lucide-react';
import { useT } from '../../hooks/useT';

// קלף משחק - מוצג ב-GamesHub
export default function GameCard({ game, highScore, special = false }) {
  const { t } = useT();
  return (
    <Link to={`/games/${game.id}`} className="block">
      <motion.div
        whileHover={{ y: -8, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`
          relative overflow-hidden rounded-3xl shadow-lg cursor-pointer
          ${special ? 'aspect-[2/1] md:aspect-[3/1]' : 'aspect-square'}
          transition-shadow hover:shadow-2xl
        `}
      >
        {/* רקע צבעוני */}
        <div className={`absolute inset-0 ${game.color}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* תוכן */}
        <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
          <div className={`${special ? 'text-7xl md:text-8xl' : 'text-5xl md:text-6xl'} mb-2`}>
            {game.emoji}
          </div>
          <h3 className={`${special ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} font-black text-center`}>
            {t(`games.${game.id}.name`)}
          </h3>
          {special && (
            <p className="text-sm mt-2 opacity-90 text-center">
              {t('categories.special.desc')}
            </p>
          )}

          {/* סטטוס */}
          {!game.built && (
            <div className="absolute top-3 left-3 bg-white/20 backdrop-blur px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Lock size={12} /> {t('common.soon')}
            </div>
          )}
          {game.built && (
            <div className="absolute top-3 left-3 bg-success-green/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Play size={12} /> {t('common.play')}
            </div>
          )}

          {/* שיא */}
          {highScore > 0 && (
            <div className="absolute bottom-3 right-3 bg-accent-yellow text-text-primary px-2 py-1 rounded-full text-xs font-black shadow">
              ⭐ {highScore}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
