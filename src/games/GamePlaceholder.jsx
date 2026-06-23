import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Hammer } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../hooks/useT';
import CharacterDisplay from '../components/characters/CharacterDisplay';
import Button from '../components/common/Button';

export default function GamePlaceholder({ game }) {
  const { currentUser } = useAuth();
  const { t } = useT();
  const isMale = currentUser?.gender === 'male';

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <motion.div
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <CharacterDisplay
          gender={currentUser?.gender || 'male'}
          pose="thinking"
          size="xl"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-6xl mb-3">{game.emoji}</div>
        <h2 className="text-3xl md:text-4xl font-black mb-2">{game.hebName}</h2>
        <div className="bg-accent-yellow text-text-primary inline-block px-4 py-1 rounded-full font-bold text-sm mb-4">
          🚧 {t('placeholder.soonHere')} 🚧
        </div>
        <p className="text-gray-600 max-w-md mx-auto mb-6 text-lg">
          {isMale
            ? t('placeholder.descBoy', currentUser?.name || '')
            : t('placeholder.descGirl', currentUser?.name || '')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/games">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              {t('common.backToGames')}
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
          <Hammer size={16} />
          <span>{t('placeholder.building')}</span>
        </div>
      </motion.div>
    </div>
  );
}
