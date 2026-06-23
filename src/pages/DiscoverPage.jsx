import { motion } from 'framer-motion';
import { useT } from '../hooks/useT';
import Banner from '../components/common/Banner';
import BackgroundParticles from '../components/common/BackgroundParticles';
import RoomCard from '../components/rooms/RoomCard';
import { ROOMS } from '../data/rooms';

export default function DiscoverPage() {
  const { t } = useT();

  // 6 חדרים רגילים + הגנים (special, מוצג בנפרד למטה כי הוא רחב יותר)
  const regularRooms = ROOMS.filter((r) => !r.special);
  const specialRooms = ROOMS.filter((r) => r.special);

  return (
    <div className="min-h-screen relative">
      <BackgroundParticles count={10} />
      <Banner />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* כותרת */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight inline-block"
            style={{
              fontFamily: '"Copperplate Gothic Bold", "Heebo", "Rubik", serif',
              color: '#fff',
              letterSpacing: '0.05em',
              textShadow:
                '2px 2px 0 rgba(0,0,0,0.45), 0 0 14px rgba(255,215,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            👑 {t('discover.pageTitle')} 👑
          </h1>
          <p
            className="text-lg md:text-2xl font-black text-white mt-2 drop-shadow-lg"
            style={{ fontFamily: '"Heebo", "Rubik", sans-serif' }}
          >
            {t('discover.pageSubtitle')}
          </p>
        </motion.div>

        {/* רשת 6 חדרים רגילים */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {regularRooms.map((room, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <RoomCard room={room} />
            </motion.div>
          ))}
        </div>

        {/* גני הארמון - רחב במיוחד */}
        {specialRooms.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {specialRooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <RoomCard room={room} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
