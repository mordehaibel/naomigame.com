import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Gamepad2, Star, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../hooks/useT';
import Banner from '../components/common/Banner';
import BackgroundParticles from '../components/common/BackgroundParticles';
import CharacterDisplay from '../components/characters/CharacterDisplay';
import Button from '../components/common/Button';
import { getGameById } from '../data/games';
import { ACHIEVEMENTS } from '../utils/achievements';
import { getLevelProgress, getPointsToNextLevel } from '../utils/greetings';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalPlays = Object.values(currentUser.gameStats || {}).reduce(
    (sum, s) => sum + (s.timesPlayed || 0),
    0
  );

  const playedGames = Object.entries(currentUser.gameStats || {})
    .map(([id, stats]) => ({ ...getGameById(id), ...stats, id }))
    .filter((g) => g.name)
    .sort((a, b) => (b.highScore || 0) - (a.highScore || 0));

  const earned = new Set(currentUser.achievements || []);
  const isMale = currentUser.gender === 'male';

  // קבל את שם הרמה מהתרגום (יכול להיות פונקציה)
  const levelEntry = t(`levels.${currentUser.level}`);
  const levelName = typeof levelEntry === 'function' ? levelEntry(isMale) : levelEntry;

  return (
    <div className="min-h-screen relative">
      <BackgroundParticles count={10} />
      <Banner />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-fun mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div>
              <CharacterDisplay
                gender={currentUser.gender}
                pose="celebrating"
                size="xl"
              />
            </div>
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-black mb-1">{currentUser.name}</h1>
              <p className="text-gray-600 mb-3">
                {t('profile.age')} {currentUser.age} · {isMale ? t('profile.boy') : t('profile.girl')} ·{' '}
                <span className="font-bold text-accent-purple">{levelName}</span>
              </p>

              <div className="bg-gradient-to-l from-pink-100 to-purple-100 rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-accent-yellow">
                    ⭐ {currentUser.points} {t('common.points')}
                  </span>
                  <span className="text-sm font-bold text-accent-purple">
                    {t('common.level')} {currentUser.level}
                  </span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-l from-primary to-accent-purple"
                    initial={{ width: 0 }}
                    animate={{ width: `${getLevelProgress(currentUser.points)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                {currentUser.level < 5 && (
                  <p className="text-xs text-gray-600 mt-1">
                    {t('header.pointsToNext', getPointsToNextLevel(currentUser.points))}
                  </p>
                )}
              </div>

              <Button variant="danger" size="sm" onClick={handleLogout} icon={LogOut}>
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Gamepad2} label={t('profile.statsPlayed')} value={totalPlays} color="from-primary to-pink-400" />
          <StatCard icon={Trophy} label={t('profile.statsAchievements')} value={`${earned.size}/${ACHIEVEMENTS.length}`} color="from-accent-yellow to-orange-400" />
          <StatCard icon={Calendar} label={t('profile.statsStreak')} value={currentUser.streak || 1} color="from-secondary to-teal-400" />
          <StatCard icon={Star} label={t('profile.statsLevel')} value={currentUser.level} color="from-accent-purple to-pink-500" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-fun mb-6"
        >
          <h2 className="text-2xl font-bold mb-4">{t('profile.achievements')}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const isEarned = earned.has(ach.id);
              const localized = t(`achievementsDef.${ach.id}`);
              const name = (typeof localized === 'object' && localized.name) || ach.name;
              const description = (typeof localized === 'object' && localized.description) || ach.description;
              return (
                <motion.div
                  key={ach.id}
                  whileHover={{ scale: 1.05 }}
                  className={`text-center p-3 rounded-2xl transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-accent-yellow/20 to-primary/20 border-2 border-accent-yellow shadow-lg'
                      : 'bg-gray-100 opacity-50 grayscale'
                  }`}
                  title={description}
                >
                  <div className="text-3xl mb-1">{ach.emoji}</div>
                  <div className="text-xs font-bold">{name}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {playedGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-fun"
          >
            <h2 className="text-2xl font-bold mb-4">{t('profile.myRecords')}</h2>
            <div className="space-y-2">
              {playedGames.slice(0, 8).map((g) => (
                <div key={g.id} className="flex items-center justify-between bg-pink-50 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <div className="font-bold">{t(`games.${g.id}.name`)}</div>
                      <div className="text-xs text-gray-500">{t('profile.playedTimes', g.timesPlayed)}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-accent-yellow">⭐ {g.highScore}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className={`bg-gradient-to-br ${color} text-white rounded-3xl p-4 shadow-lg`}
    >
      <Icon size={24} className="mb-2 opacity-80" />
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </motion.div>
  );
}
