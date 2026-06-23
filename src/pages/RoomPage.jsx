import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Hammer } from 'lucide-react';
import { useT } from '../hooks/useT';
import Banner from '../components/common/Banner';
import BackgroundParticles from '../components/common/BackgroundParticles';
import Button from '../components/common/Button';
import { getRoomById } from '../data/rooms';

// דף placeholder לחדר ספציפי - מציג הודעה "ביוגרפיה בקרוב" + visit 3D coming soon
export default function RoomPage() {
  const { roomId } = useParams();
  const { t } = useT();
  const navigate = useNavigate();
  const room = getRoomById(roomId);

  if (!room) {
    return (
      <div className="min-h-screen">
        <Banner />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
            🤔 ?
          </h1>
          <Button variant="primary" onClick={() => navigate('/discover')} icon={ArrowRight}>
            {t('discover.backToDiscover')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundParticles count={8} />
      <Banner />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl shadow-2xl p-6 md:p-10"
          style={{
            background: `linear-gradient(180deg, ${room.light} 0%, ${room.accent} 100%)`,
            border: `4px solid ${room.dark}`,
          }}
        >
          {/* כותרת החדר */}
          <div className="text-center mb-6">
            <div className="text-7xl md:text-8xl mb-3 drop-shadow-lg">{room.emoji}</div>
            <h1
              className="text-3xl md:text-5xl font-black"
              style={{
                color: room.dark,
                fontFamily: '"Copperplate Gothic Bold", "Heebo", "Rubik", serif',
                letterSpacing: '0.04em',
                textShadow: '0 1px 2px rgba(255,255,255,0.6)',
              }}
            >
              {t(`discover.rooms.${room.id}`)}
            </h1>
          </div>

          {/* כרטיס "בקרוב" - 3D */}
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-center my-8"
          >
            <div className="text-5xl md:text-6xl mb-3">🚧</div>
            <div
              className="inline-block px-6 py-4 rounded-2xl bg-white/95 shadow-xl text-base md:text-xl font-black"
              style={{
                color: room.dark,
                fontFamily: '"Heebo", "Rubik", sans-serif',
              }}
            >
              {t('discover.comingSoon')}
            </div>
          </motion.div>

          {/* טקסט "ביוגרפיה בקרוב" */}
          <div
            className="bg-white/85 rounded-2xl p-5 mb-6 text-center"
            style={{ color: room.dark }}
          >
            <p
              className="text-base md:text-lg font-bold"
              style={{ fontFamily: '"Heebo", "Rubik", sans-serif' }}
            >
              📖 {t('discover.bioComing')}
            </p>
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/discover">
              <Button variant="primary" size="md" icon={ArrowRight}>
                {t('discover.backToDiscover')}
              </Button>
            </Link>
            <Link to="/games">
              <Button variant="ghost" size="md">
                {t('common.backToGames')}
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-white flex items-center justify-center gap-2">
            <Hammer size={14} />
            <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {t('placeholder.building')}
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
