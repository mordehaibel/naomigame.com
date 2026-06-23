import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '../common/Button';
import { DIFFICULTY_LABELS } from '../../utils/difficulty';
import { useT } from '../../hooks/useT';

const ACTIVE_BG = {
  easy: 'bg-gradient-to-br from-green-400 to-emerald-600 text-white border-green-700',
  medium: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-orange-600',
  hard: 'bg-gradient-to-br from-rose-500 to-red-700 text-white border-red-800',
};

export default function DifficultySelector({
  current,
  onSelect,
  onStart,
  descriptions = {},
  title,
  emoji = '🎮',
  recommendedAge,
}) {
  const { t } = useT();
  const displayTitle = title || t('difficulty.title');
  const currentName = t(`difficulty.${current}`);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
      <div className="text-5xl mb-2">{emoji}</div>
      <h3 className="text-2xl font-black mb-1">{displayTitle}</h3>
      {recommendedAge && (
        <p className="text-xs text-gray-500 mb-3">
          {t('difficulty.forAge', recommendedAge)} <strong className="text-primary">{currentName}</strong>
        </p>
      )}
      <div className="text-sm text-gray-600 mb-4">{t('difficulty.pick')}</div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {Object.keys(DIFFICULTY_LABELS).map((key) => {
          const info = DIFFICULTY_LABELS[key];
          const isActive = current === key;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(key)}
              className={`
                p-3 rounded-2xl border-4 transition-all
                ${isActive ? `${ACTIVE_BG[key]} shadow-lg` : 'bg-white border-gray-200 hover:border-gray-300 opacity-80'}
              `}
            >
              <div className="text-3xl mb-1">{info.emoji}</div>
              <div className="font-black">{t(`difficulty.${key}`)}</div>
              {descriptions[key] && (
                <div className={`text-[10px] mt-1 leading-tight ${isActive ? 'opacity-90' : 'text-gray-500'}`}>
                  {descriptions[key]}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <Button variant="primary" size="lg" icon={Play} onClick={onStart} fullWidth>
        {t('difficulty.startWithLevel', currentName)}
      </Button>
    </div>
  );
}
