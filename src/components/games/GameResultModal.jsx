import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import CharacterDisplay from '../characters/CharacterDisplay';
import Button from '../common/Button';
import Confetti from '../common/Confetti';
import { useAuth } from '../../hooks/useAuth';
import { useT } from '../../hooks/useT';
import { getAchievementById } from '../../utils/achievements';

// מסך תוצאה אוניברסלי לכל המשחקים
export default function GameResultModal({
  open,
  isWin,
  score,
  newRecord,
  newAchievements = [],
  onPlayAgain,
}) {
  const { currentUser } = useAuth();
  const { t } = useT();
  // Fermeture : état interne → l'utilisateur peut masquer la modale (X / סגור)
  // pour revoir le plateau, sans que chaque jeu ait à gérer un onClose.
  // Réinitialisé à chaque nouvelle fin de partie (open repasse à true).
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (open) setDismissed(false);
  }, [open]);

  if (!open || dismissed || !currentUser) return null;

  const isMale = currentUser.gender === 'male';
  const message = newRecord
    ? t('results.newRecord', currentUser.name, isMale)
    : isWin
    ? t('results.win', currentUser.name, isMale)
    : t('results.loss', currentUser.name, isMale);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
      >
        {(isWin || newRecord) && <Confetti active count={80} />}

        <motion.div
          initial={{ scale: 0.5, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative max-h-[90dvh] flex flex-col"
        >
          {/* ילדה מוחאת כפיים בפינה */}
          <ClappingGirl />

          {/* Bouton de fermeture - toujours visible, cliquable */}
          <button
            onClick={() => setDismissed(true)}
            aria-label={t('common.close')}
            title={t('common.close')}
            className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:scale-110 transition active:scale-95"
          >
            <X size={20} />
          </button>

          {/* Contenu scrollable interne → la modale tient toujours dans le viewport */}
          <div className="overflow-y-auto p-6 pt-8">
          {/* דמות עם הפוזה המתאימה */}
          <div className="flex justify-center mb-4">
            <CharacterDisplay
              gender={currentUser.gender}
              pose={isWin ? 'celebrating' : 'sad'}
              size="lg"
            />
          </div>

          {/* כותרת */}
          <h2 className="text-2xl md:text-3xl font-black text-center mb-3">
            {message}
          </h2>

          {/* ניקוד */}
          <div className="bg-gradient-to-l from-pink-100 to-purple-100 rounded-2xl p-4 text-center mb-4">
            <div className="text-sm text-gray-600">{t('results.yourScore')}</div>
            <div className="text-4xl font-black text-accent-purple">⭐ {score}</div>
            {newRecord && (
              <div className="text-sm font-bold text-primary mt-1 animate-pulse">
                {t('results.newRecordBonus')}
              </div>
            )}
          </div>

          {/* הישגים חדשים */}
          {newAchievements.length > 0 && (
            <div className="bg-accent-yellow/20 border-2 border-accent-yellow rounded-2xl p-3 mb-4">
              <div className="text-sm font-bold mb-2">{t('results.newAchievements')}</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {newAchievements.map((id) => {
                  const ach = getAchievementById(id);
                  return ach ? (
                    <motion.div
                      key={id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="bg-white rounded-xl px-3 py-1 text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <span className="text-lg">{ach.emoji}</span>
                      {ach.name}
                    </motion.div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* כפתורי פעולה */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={RotateCcw}
              onClick={onPlayAgain}
            >
              {t('common.playAgain')}
            </Button>
            <Link to="/games" className="flex-1">
              <Button variant="ghost" size="md" fullWidth icon={Home}>
                {t('results.forAllGames')}
              </Button>
            </Link>
          </div>

          {/* Fermer la modale pour revoir le plateau */}
          <button
            onClick={() => setDismissed(true)}
            className="mt-3 w-full text-center text-sm font-bold text-gray-500 hover:text-gray-700 underline underline-offset-2 transition"
          >
            {t('common.close')}
          </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ילדה (ImageFille) על רקע ורוד, מוחאת כפיים - מוצבת בפינה הימנית-עליונה של המודל
function ClappingGirl() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', delay: 0.3 }}
      className="absolute -top-8 -right-6 z-10 pointer-events-none"
    >
      {/* אמוג'י כפיים שעפים סביב */}
      {[
        { emoji: '👏', x: -32, y: 14, delay: 0 },
        { emoji: '👏', x: 32, y: 14, delay: 0.15 },
        { emoji: '✨', x: -28, y: -14, delay: 0.3 },
        { emoji: '🎉', x: 28, y: -10, delay: 0.45 },
      ].map((c, i) => (
        <motion.span
          key={i}
          className="absolute text-xl pointer-events-none"
          style={{ left: '50%', top: '50%' }}
          animate={{
            x: [0, c.x, 0],
            y: [0, c.y, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 1.2,
            delay: c.delay,
            repeat: Infinity,
            repeatDelay: 0.4,
          }}
        >
          {c.emoji}
        </motion.span>
      ))}

      {/* גוף הילדה - אנימציית "תנועת מחיאת כפיים" */}
      <motion.div
        animate={{
          scale: [1, 1.08, 0.96, 1.08, 1],
          rotate: [0, -4, 4, -4, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="rounded-full p-1.5 shadow-xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, #FFD1DC 0%, #FFB6D9 60%, #FF95C4 100%)',
          border: '3px solid #fff',
        }}
      >
        <img
          src="/ImageFille.jpg"
          alt=""
          className="h-20 w-auto rounded-full"
          style={{ mixBlendMode: 'multiply' }}
        />
      </motion.div>
    </motion.div>
  );
}
