import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Gamepad2, Shield, Users, Star } from 'lucide-react';
import ShlomiCharacter from '../components/characters/ShlomiCharacter';
import NaomiCharacter from '../components/characters/NaomiCharacter';
import BackgroundParticles from '../components/common/BackgroundParticles';
import Banner from '../components/common/Banner';
import Button from '../components/common/Button';
import { useT } from '../hooks/useT';

export default function Landing() {
  const { t } = useT();

  const FEATURES = [
    {
      icon: Gamepad2,
      title: t('landing.feature1Title'),
      description: t('landing.feature1Desc'),
      color: 'from-primary to-accent-purple',
    },
    {
      icon: Star,
      title: t('landing.feature2Title'),
      description: t('landing.feature2Desc'),
      color: 'from-secondary to-accent-yellow',
    },
    {
      icon: Shield,
      title: t('landing.feature3Title'),
      description: t('landing.feature3Desc'),
      color: 'from-accent-purple to-success-green',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundParticles count={20} />
      <Banner />

      <section className="container mx-auto px-4 pt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-shadow-fun mb-4 text-white">
            <span className="bg-white/95 bg-clip-text text-transparent drop-shadow-lg">
              {t('landing.welcome')}
            </span>
            <br />
            <span className="text-3xl md:text-5xl">
              🎮 {t('common.appName')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow">
            {t('landing.tagline')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="flex justify-center items-end gap-4 md:gap-8 mb-10"
        >
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <ShlomiCharacter pose="waving" size="xl" />
          </motion.div>
          <motion.div
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <NaomiCharacter pose="waving" size="xl" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/register">
            <Button variant="primary" size="xl" icon={Sparkles}>
              {t('landing.register')}
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="xl" icon={Users}>
              {t('landing.login')}
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-10 text-white drop-shadow-lg"
        >
          {t('landing.whyChooseUs')}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="card-fun text-center"
            >
              <div
                className={`bg-gradient-to-l ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                <feature.icon size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="card-fun max-w-3xl mx-auto text-center"
        >
          <Trophy className="mx-auto mb-3 text-accent-yellow" size={40} />
          <h3 className="text-2xl font-bold mb-3">{t('landing.parentsTitle')}</h3>
          <p className="text-gray-700 leading-relaxed">{t('landing.parentsText')}</p>
        </motion.div>
      </section>

      <footer className="text-center py-6 text-white/90 text-sm drop-shadow">
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
  );
}
