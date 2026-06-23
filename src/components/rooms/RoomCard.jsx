import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useT } from '../../hooks/useT';
import { ROOM_SHAPES } from '../../data/rooms';

// קלף חדר בארמון - צורת clip-path של פתח/חלון ארמון
export default function RoomCard({ room }) {
  const { t } = useT();
  const clipPath = ROOM_SHAPES[room.shape] || ROOM_SHAPES.arch;

  // גרדיאנט: בהיר למעלה, כהה למטה (אבן ארמון)
  const gradient = `linear-gradient(180deg, ${room.light} 0%, ${room.accent} 50%, ${room.dark} 100%)`;

  return (
    <Link to={`/discover/${room.id}`} className="block">
      <motion.div
        whileHover={{ y: -8, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`relative cursor-pointer ${room.special ? 'aspect-[2/1]' : 'aspect-[3/4]'}`}
      >
        {/* הצורה - clipPath חותך לסילואט חדר ארמון */}
        <div
          className="absolute inset-0"
          style={{
            background: gradient,
            clipPath,
            WebkitClipPath: clipPath,
            filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.4))',
          }}
        >
          {/* טקסטורת אבנים עדינה - פסים אופקיים */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 14px,
                ${room.dark}40 14px,
                ${room.dark}40 16px
              )`,
            }}
          />
          {/* טקסטורה אנכית עדינה - אבנים אנכיות */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 22px,
                ${room.dark}40 22px,
                ${room.dark}40 24px
              )`,
            }}
          />

          {/* תוכן: אמוג'י + שם החדר */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 md:pb-6 px-3">
            <div
              className={`${room.special ? 'text-7xl md:text-8xl' : 'text-5xl md:text-6xl lg:text-7xl'} drop-shadow-lg leading-none mb-3`}
            >
              {room.emoji}
            </div>
            <div
              className={`font-black text-center px-3 py-1.5 rounded-xl ${room.special ? 'text-xl md:text-2xl lg:text-3xl' : 'text-base md:text-lg lg:text-xl'}`}
              style={{
                backgroundColor: 'rgba(255, 248, 230, 0.95)',
                color: room.dark,
                fontFamily: '"Heebo", "Rubik", sans-serif',
                boxShadow: `0 2px 6px ${room.dark}66, inset 0 0 0 2px ${room.dark}33`,
              }}
            >
              {t(`discover.rooms.${room.id}`)}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
