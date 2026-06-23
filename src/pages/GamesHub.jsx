import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../hooks/useT';
import Banner from '../components/common/Banner';
import BackgroundParticles from '../components/common/BackgroundParticles';
import CharacterDisplay from '../components/characters/CharacterDisplay';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import CastleCard from '../components/games/CastleCard';
import FriendsLeaderboard from '../components/games/FriendsLeaderboard';
import { CATEGORIES, getGamesByCategory } from '../data/games';

export default function GamesHub() {
  const { currentUser } = useAuth();
  const { t } = useT();
  const [tip, setTip] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const isMale = currentUser.gender === 'male';
    const update = () =>
      setTip(
        isMale
          ? t('gamesHub.randomTipBoy', currentUser.name)
          : t('gamesHub.randomTipGirl', currentUser.name)
      );
    update();
    const interval = setInterval(update, 12000);
    return () => clearInterval(interval);
  }, [currentUser, t]);

  if (!currentUser) return null;

  const isMale = currentUser.gender === 'male';
  const hour = new Date().getHours();
  const greetingKey =
    hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 21 ? 'evening' : 'night';

  return (
    <div className="min-h-screen relative">
      <BackgroundParticles count={12} />
      <Banner />

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 relative"
        >
          {/* כוכבים מסביב לברכה */}
          <span className="absolute -top-2 left-[15%] text-2xl md:text-3xl animate-pulse" aria-hidden="true">⭐</span>
          <span className="absolute -top-1 right-[18%] text-xl md:text-2xl animate-pulse" style={{ animationDelay: '0.5s' }} aria-hidden="true">✨</span>
          <span className="absolute top-1/2 left-[5%] text-xl md:text-2xl animate-pulse" style={{ animationDelay: '0.8s' }} aria-hidden="true">🌟</span>
          <span className="absolute top-1/2 right-[7%] text-2xl md:text-3xl animate-pulse" style={{ animationDelay: '0.3s' }} aria-hidden="true">⭐</span>
          <span className="absolute -bottom-1 left-[30%] text-lg md:text-xl animate-pulse" style={{ animationDelay: '1s' }} aria-hidden="true">✨</span>
          <span className="absolute -bottom-1 right-[35%] text-lg md:text-xl animate-pulse" style={{ animationDelay: '0.7s' }} aria-hidden="true">🌙</span>

          <h1
            className="text-3xl md:text-5xl font-black mb-3 leading-tight inline-block"
            style={{
              fontFamily: '"Heebo", "Rubik", sans-serif',
              color: '#1A237E',
              textShadow:
                '0 1px 0 rgba(255,255,255,0.7), 0 0 14px rgba(100,149,237,0.65), 2px 2px 6px rgba(11,30,90,0.45)',
            }}
          >
            {t(`greetings.${greetingKey}`, currentUser.name)}
          </h1>
          <p className="text-2xl md:text-4xl font-black text-white drop-shadow-lg leading-tight">
            {t('gamesHub.selectGame')}
          </p>
        </motion.div>

        {/* טבלת מובילים מתחת לברכה */}
        <FriendsLeaderboard />

        {/* כל הקטגוריות תמיד פתוחות - ללא animations שעלולים להשאיר אותן בopacity:0 */}
        <div className="space-y-10">
          {CATEGORIES.map((category) => {
            const games = getGamesByCategory(category.id);
            if (games.length === 0) return null;

            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`bg-gradient-to-l ${category.color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {category.emoji}
                  </div>
                  <div>
                    <h2
                      id={`cat-${category.id}`}
                      className="text-2xl font-bold text-white drop-shadow"
                    >
                      {t(`categories.${category.id}.title`)}
                    </h2>
                    <p className="text-sm text-white/90">
                      {t(`categories.${category.id}.desc`)}
                    </p>
                  </div>
                </div>

                <div
                  className={`grid gap-5 md:gap-6 ${
                    category.featured
                      ? 'grid-cols-1'
                      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {games.map((game) => (
                    <div key={game.id}>
                      <CastleCard
                        game={game}
                        highScore={currentUser.gameStats[game.id]?.highScore || 0}
                        special={category.featured}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA לדף Discover - מסביר איך מגיעים לחדרי הארמון */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 mb-8 flex justify-center"
        >
          <Link to="/discover" className="block w-full max-w-2xl">
            <div
              className="rounded-3xl shadow-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4 hover:scale-[1.02] transition-transform"
              style={{
                background:
                  'linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #FF6B9D 100%)',
                border: '3px solid #FFD700',
              }}
            >
              <div className="text-5xl md:text-6xl shrink-0">👑</div>
              <div className="flex-1 text-center sm:text-start">
                <h3
                  className="text-lg md:text-2xl font-black text-white mb-1"
                  style={{
                    fontFamily: '"Heebo", "Rubik", sans-serif',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {t('discover.pageTitle')}
                </h3>
                <p
                  className="text-sm md:text-base text-white/95 font-bold"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {t('discover.pageSubtitle')}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/95 px-4 py-2 rounded-2xl font-black text-purple-900 shadow-lg shrink-0">
                <Crown size={20} />
                <span>→</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* תמונה שמאלית - FilleChateau בעיגול (מקבילה לתמונת ימין) + כיתוב */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="fixed left-3 lg:left-5 top-[260px] z-30 pointer-events-none hidden md:flex flex-col items-center"
        >
          <div
            className="rounded-full overflow-hidden border-4 border-white w-36 lg:w-44 xl:w-52 aspect-square"
            style={{
              backgroundColor: '#FFB6D9',
              boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src="/FilleChateau.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {/* כיתוב מתחת לתמונת שמאל */}
          <div
            className="mt-2 px-4 py-2 rounded-2xl text-center font-black text-base md:text-lg lg:text-xl shadow-lg"
            style={{
              background:
                'linear-gradient(135deg, #FFB6D9 0%, #FF69B4 100%)',
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontFamily: '"Fredoka", "Heebo", "Rubik", sans-serif',
            }}
          >
            🏰 {t('gamesHub.castleQuestion')}
          </div>
        </motion.div>

        {/* תמונה ימנית - FilleAuRevoir בעיגול */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="fixed right-3 lg:right-5 top-[260px] z-30 pointer-events-none hidden md:flex flex-col items-center"
        >
          <div
            className="rounded-full overflow-hidden border-4 border-white w-36 lg:w-44 xl:w-52 aspect-square"
            style={{
              backgroundColor: '#FFB6D9',
              boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src="/FilleAuRevoir.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {/* כיתוב מתחת לתמונת ימין */}
          <div
            className="mt-2 px-4 py-2 rounded-2xl text-center font-black text-base md:text-lg lg:text-xl shadow-lg"
            style={{
              background:
                'linear-gradient(135deg, #FFB6D9 0%, #FF69B4 100%)',
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontFamily: '"Fredoka", "Heebo", "Rubik", sans-serif',
            }}
          >
            ✨ {t('gamesHub.noemieWithYou')} ✨
          </div>
        </motion.div>

        {/* טיפ + דמות פעילה בפינה הימנית - דמות מעל הטיפ */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-4 right-4 hidden md:flex flex-col items-center gap-2 z-30 pointer-events-none"
        >
          <CharacterDisplay gender={currentUser.gender} pose="thumbs-up" size="md" />
          {tip && (
            <motion.div
              key={tip}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white shadow-lg rounded-2xl px-4 py-2 max-w-xs text-sm font-semibold text-center relative"
              style={{ fontFamily: '"Fredoka", "Heebo", "Rubik", sans-serif' }}
            >
              {/* חץ למעלה - מצביע אל הדמות שמעל */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow" />
              <span className="relative z-10">{tip}</span>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
