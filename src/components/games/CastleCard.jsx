import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Play } from 'lucide-react';
import { useT } from '../../hooks/useT';
import MoleIcon from './MoleIcon';

// פלטה אחידה של גוונים בחומיים - דומה לארמון אמיתי מאבן.
// כל קלף בוחר tier 0-3 לסיבוב הגוונים, אבל כולם בעולם החום.
const BROWN_PALETTE = {
  // tier 0 - חול בהיר
  0: {
    sky: '#D4B896',
    walls: '#A0826D',
    shadow: '#7C5E3C',
    deep: '#5D4037',
    roof: '#6B4423',
  },
  // tier 1 - חום בינוני חם
  1: {
    sky: '#B8956A',
    walls: '#8B6F47',
    shadow: '#5D4037',
    deep: '#4A3424',
    roof: '#7A2D1D',
  },
  // tier 2 - אבן אפורה-חומה
  2: {
    sky: '#C0A684',
    walls: '#7C5E3C',
    shadow: '#4A3424',
    deep: '#3E2723',
    roof: '#6B4423',
  },
  // tier 3 - חום כהה דרמטי
  3: {
    sky: '#A0826D',
    walls: '#5D4037',
    shadow: '#3E2723',
    deep: '#2D1B12',
    roof: '#8B2500',
  },
};

// 6 צורות סילואט קלעה כ-clip-path polygons.
const CASTLE_SHAPES = {
  classic:
    'polygon(0% 100%, 0% 20%, 8% 20%, 8% 30%, 16% 30%, 16% 20%, 25% 20%, 25% 45%, 35% 45%, 35% 55%, 45% 55%, 45% 45%, 55% 45%, 55% 55%, 65% 55%, 65% 45%, 75% 45%, 75% 20%, 83% 20%, 83% 30%, 92% 30%, 92% 20%, 100% 20%, 100% 100%)',
  tower:
    'polygon(0% 100%, 0% 70%, 35% 70%, 35% 15%, 41% 15%, 41% 22%, 47% 22%, 47% 15%, 53% 15%, 53% 22%, 59% 22%, 59% 15%, 65% 15%, 65% 70%, 100% 70%, 100% 100%)',
  round:
    'polygon(0% 100%, 0% 60%, 5% 30%, 20% 12%, 40% 5%, 60% 5%, 80% 12%, 95% 30%, 100% 60%, 100% 100%)',
  wide:
    'polygon(0% 100%, 0% 55%, 2% 55%, 2% 25%, 18% 25%, 18% 55%, 22% 55%, 22% 25%, 38% 25%, 38% 55%, 42% 55%, 42% 25%, 58% 25%, 58% 55%, 62% 55%, 62% 25%, 78% 25%, 78% 55%, 82% 55%, 82% 25%, 98% 25%, 98% 55%, 100% 55%, 100% 100%)',
  stepped:
    'polygon(0% 100%, 0% 50%, 10% 50%, 10% 60%, 20% 60%, 20% 50%, 30% 50%, 30% 60%, 40% 60%, 40% 50%, 50% 50%, 50% 8%, 60% 8%, 60% 20%, 70% 20%, 70% 8%, 80% 8%, 80% 20%, 90% 20%, 90% 8%, 100% 8%, 100% 100%)',
  pointed:
    'polygon(0% 100%, 0% 70%, 5% 70%, 15% 30%, 25% 70%, 35% 70%, 50% 10%, 65% 70%, 75% 70%, 85% 30%, 95% 70%, 100% 70%, 100% 100%)',
};

// מיפוי משחק → צורה + tier (סיבוב של 4 וריאציות חום)
const GAME_CASTLE_MAP = {
  snake: { shape: 'pointed', tier: 0 },
  tetris: { shape: 'wide', tier: 1 },
  pong: { shape: 'tower', tier: 2 },
  pacman: { shape: 'round', tier: 3 },
  breakout: { shape: 'wide', tier: 0 },
  'reaction-time': { shape: 'pointed', tier: 1 },
  'number-hunt': { shape: 'classic', tier: 2 },
  'shape-match': { shape: 'round', tier: 3 },
  'memory-flash': { shape: 'tower', tier: 0 },
  'whack-a-mole': { shape: 'stepped', tier: 1 },
  math: { shape: 'classic', tier: 2 },
  'number-sequence': { shape: 'tower', tier: 3 },
  'equation-builder': { shape: 'pointed', tier: 1 },
  adventure: { shape: 'pointed', tier: 2 },
  memory: { shape: 'round', tier: 0 },
  'sliding-puzzle': { shape: 'stepped', tier: 1 },
};

// תבנית אבנים - SVG חוזרת על עצמה ומוסיפה טקסטורה
function StonePattern({ shadow, deep }) {
  const patternId = `stones-${shadow.replace('#', '')}`;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.35 }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width="40" height="30" patternUnits="userSpaceOnUse">
          {/* שורה ראשונה - אבנים */}
          <rect x="2" y="2" width="14" height="11" rx="1.5" fill={shadow} opacity="0.45" />
          <rect x="18" y="2" width="11" height="11" rx="1.5" fill={deep} opacity="0.35" />
          <rect x="31" y="2" width="7" height="11" rx="1.5" fill={shadow} opacity="0.5" />
          {/* שורה שנייה - מוזזת */}
          <rect x="0" y="15" width="9" height="13" rx="1.5" fill={deep} opacity="0.4" />
          <rect x="11" y="15" width="13" height="13" rx="1.5" fill={shadow} opacity="0.4" />
          <rect x="26" y="15" width="13" height="13" rx="1.5" fill={deep} opacity="0.45" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export default function CastleCard({ game, highScore, special = false }) {
  const { t } = useT();

  const meta = GAME_CASTLE_MAP[game.id] || { shape: 'classic', tier: 0 };
  const colors = BROWN_PALETTE[meta.tier % 4];
  const clipPath = CASTLE_SHAPES[meta.shape];

  // גרדיאנט אבן: עליון בהיר, יורד לחום כהה כשמתקדמים למטה
  const gradient = `linear-gradient(180deg, ${colors.sky} 0%, ${colors.walls} 30%, ${colors.shadow} 70%, ${colors.deep} 100%)`;

  // אקסנט גגות - לטיפים המחודדים של variant 'pointed'
  const isRoofedCastle = meta.shape === 'pointed';

  return (
    <Link to={`/games/${game.id}`} className="block">
      <motion.div
        whileHover={{ y: -10, scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={`
          relative cursor-pointer
          ${special ? 'aspect-[2/1] md:aspect-[5/2]' : 'aspect-[4/5]'}
        `}
      >
        {/* הקלעה החתוכה */}
        <div
          className="absolute inset-0"
          style={{
            background: gradient,
            clipPath,
            WebkitClipPath: clipPath,
            filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.45))',
          }}
        >
          {/* טקסטורה של אבנים */}
          <StonePattern shadow={colors.shadow} deep={colors.deep} />

          {/* אקסנט גג רעפים אדמדם בחלק העליון - רק לקלעות מחודדות */}
          {isRoofedCastle && (
            <div
              className="absolute inset-x-0 top-0"
              style={{
                height: '35%',
                background: `linear-gradient(180deg, ${colors.roof} 0%, ${colors.roof}aa 60%, transparent 100%)`,
                opacity: 0.55,
              }}
            />
          )}

          {/* חלונות */}
          <Windows shape={meta.shape} dark={colors.deep} accent={colors.sky} special={special} />

          {/* תוכן: אמוג'י + שם משחק */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-3 md:pb-4 px-2">
            <div
              className={`${special ? 'text-7xl md:text-8xl' : 'text-5xl md:text-6xl lg:text-7xl'} drop-shadow-lg leading-none mb-2 ${game.id === 'whack-a-mole' ? (special ? 'w-24 md:w-32' : 'w-16 md:w-20 lg:w-24') : ''}`}
            >
              {game.id === 'whack-a-mole' ? <MoleIcon className="w-full h-auto" /> : game.emoji}
            </div>
            <div
              className={`font-black text-center px-3 py-1.5 rounded-xl ${special ? 'text-xl md:text-2xl lg:text-3xl' : 'text-base md:text-lg lg:text-xl'}`}
              style={{
                backgroundColor: 'rgba(255, 248, 230, 0.95)',
                color: colors.deep,
                fontFamily: '"Heebo", "Rubik", sans-serif',
                textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                boxShadow: `0 2px 6px ${colors.deep}66, inset 0 0 0 2px ${colors.shadow}44`,
              }}
            >
              {t(`games.${game.id}.name`)}
            </div>
          </div>
        </div>

        {/* תוויות מעל הקלעה (לא נחתכים) */}
        {!game.built && (
          <div
            className="absolute top-1 left-1 bg-white/95 backdrop-blur px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 z-20 shadow"
            style={{ color: colors.deep }}
          >
            <Lock size={10} /> {t('common.soon')}
          </div>
        )}
        {game.built && (
          <div className="absolute top-1 left-1 bg-success-green/95 backdrop-blur px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 text-white z-20 shadow">
            <Play size={10} /> {t('common.play')}
          </div>
        )}

        {highScore > 0 && (
          <div className="absolute top-1 right-1 bg-accent-yellow text-text-primary px-2 py-0.5 rounded-full text-[10px] md:text-xs font-black shadow z-20">
            ⭐ {highScore}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

// חלונות לכל סילואט - SVG עם זוהר עדין כמו אש מבפנים
function Windows({ shape, dark, accent, special }) {
  const positions = {
    classic: [
      { left: '47%', top: '32%', size: 9 },
      { left: '8%', top: '32%', size: 7 },
      { left: '85%', top: '32%', size: 7 },
      { left: '37%', top: '63%', size: 6 },
      { left: '57%', top: '63%', size: 6 },
    ],
    tower: [
      { left: '48%', top: '28%', size: 7 },
      { left: '48%', top: '40%', size: 7 },
      { left: '48%', top: '52%', size: 7 },
      { left: '15%', top: '80%', size: 6 },
      { left: '80%', top: '80%', size: 6 },
    ],
    round: [
      { left: '45%', top: '20%', size: 8 },
      { left: '20%', top: '40%', size: 7 },
      { left: '72%', top: '40%', size: 7 },
      { left: '45%', top: '70%', size: 8 },
    ],
    wide: [
      { left: '8%', top: '70%', size: 7 },
      { left: '28%', top: '70%', size: 7 },
      { left: '47%', top: '70%', size: 7 },
      { left: '67%', top: '70%', size: 7 },
      { left: '87%', top: '70%', size: 7 },
    ],
    stepped: [
      { left: '12%', top: '70%', size: 6 },
      { left: '32%', top: '70%', size: 6 },
      { left: '60%', top: '32%', size: 7 },
      { left: '80%', top: '32%', size: 7 },
      { left: '60%', top: '55%', size: 7 },
      { left: '80%', top: '55%', size: 7 },
    ],
    pointed: [
      { left: '48%', top: '50%', size: 7 },
      { left: '48%', top: '70%', size: 6 },
      { left: '13%', top: '78%', size: 6 },
      { left: '83%', top: '78%', size: 6 },
    ],
  };

  const wins = positions[shape] || positions.classic;
  const sizeMul = special ? 1.4 : 1;

  return (
    <>
      {wins.map((w, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: w.left,
            top: w.top,
            width: `${w.size * sizeMul}%`,
            height: `${w.size * sizeMul * 1.3}%`,
            background: `radial-gradient(ellipse at center, ${accent}aa 0%, ${dark} 70%, ${dark} 100%)`,
            transform: 'translate(-50%, -50%)',
            boxShadow: `inset 0 0 4px ${dark}`,
          }}
        />
      ))}
    </>
  );
}
