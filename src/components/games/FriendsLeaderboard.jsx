import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { storage } from '../../utils/storage';
import { getGameById } from '../../data/games';
import { useT } from '../../hooks/useT';

// קורא מ-localStorage את כל המשתמשים, מחשב את השיא הגבוה ביותר של כל אחד
// בכל משחק, ומחזיר את 3 השיאים הגבוהים ביותר ברחבי הממלכה.
function computeTopScores(limit = 3) {
  const users = storage.getUsers();
  const allScores = [];

  for (const user of users) {
    const stats = user.gameStats || {};
    for (const [gameId, gs] of Object.entries(stats)) {
      if (gs.highScore && gs.highScore > 0) {
        allScores.push({
          name: user.name,
          gender: user.gender,
          score: gs.highScore,
          gameId,
        });
      }
    }
  }

  allScores.sort((a, b) => b.score - a.score);
  return allScores.slice(0, limit);
}

const MEDAL_PALETTES = [
  // 0: זהב
  {
    fillStops: [
      { off: 0, color: '#FFFAEF' },
      { off: 0.3, color: '#FFD700' },
      { off: 0.7, color: '#DAA520' },
      { off: 1, color: '#8B6914' },
    ],
    border: '#8B6914',
    ribbon: '#C0392B', // אדום
    ribbonDark: '#7B241C',
    rankEmoji: '🥇',
  },
  // 1: כסף
  {
    fillStops: [
      { off: 0, color: '#FFFFFF' },
      { off: 0.3, color: '#E8E8E8' },
      { off: 0.7, color: '#A8A8A8' },
      { off: 1, color: '#6F6F6F' },
    ],
    border: '#6F6F6F',
    ribbon: '#1F618D', // כחול
    ribbonDark: '#154360',
    rankEmoji: '🥈',
  },
  // 2: ארד
  {
    fillStops: [
      { off: 0, color: '#FFE0B2' },
      { off: 0.3, color: '#CD7F32' },
      { off: 0.7, color: '#8B5A2B' },
      { off: 1, color: '#5D4020' },
    ],
    border: '#5D4020',
    ribbon: '#117A65', // ירוק
    ribbonDark: '#0B5345',
    rankEmoji: '🥉',
  },
];

// מדליה בודדת - SVG עם סרט עליון וגוף עגול. תוכן הטקסט מוצב מעל ב-absolute.
function Medal({ entry, idx, gameName, gameEmoji, t }) {
  const palette = MEDAL_PALETTES[idx];
  const gradId = `medal-grad-${idx}-${entry.name.replace(/\s/g, '')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2 + idx * 0.15, type: 'spring', stiffness: 200 }}
      className="relative flex flex-col items-center w-28 sm:w-[140px]"
    >
      <svg
        viewBox="0 0 140 180"
        width="100%"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' }}
      >
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%">
            {palette.fillStops.map((s) => (
              <stop key={s.off} offset={s.off} stopColor={s.color} />
            ))}
          </radialGradient>
          <linearGradient id={`${gradId}-rib`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.ribbon} />
            <stop offset="100%" stopColor={palette.ribbonDark} />
          </linearGradient>
        </defs>

        {/* סרט - שני קצוות שמתחברים מעל המדליה */}
        <polygon
          points="25,0 60,0 70,55 50,55"
          fill={`url(#${gradId}-rib)`}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="1"
        />
        <polygon
          points="80,0 115,0 90,55 70,55"
          fill={`url(#${gradId}-rib)`}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="1"
        />
        {/* קפל מרכזי - חיבור בין שתי הרצועות */}
        <polygon
          points="55,40 85,40 80,60 60,60"
          fill={palette.ribbonDark}
          opacity="0.7"
        />
        {/* היילייט עדין על הסרט */}
        <polygon
          points="30,0 38,0 50,40 45,40"
          fill="white"
          opacity="0.25"
        />

        {/* גוף המדליה - עיגול */}
        <circle cx="70" cy="118" r="55" fill={`url(#${gradId})`} stroke={palette.border} strokeWidth="3" />
        {/* טבעת פנימית מובלטת */}
        <circle cx="70" cy="118" r="48" fill="none" stroke={palette.border} strokeWidth="1" opacity="0.5" />
        {/* היילייט מבריק בפינה */}
        <ellipse cx="50" cy="100" rx="14" ry="9" fill="white" opacity="0.4" />
      </svg>

      {/* תוכן הטקסט - ממוקם בתוך עיגול המדליה */}
      <div
        className="absolute pointer-events-none flex flex-col items-center justify-center text-center"
        style={{
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90px',
        }}
      >
        <div className="text-2xl leading-none mb-0.5">{palette.rankEmoji}</div>
        <div
          className="font-black text-xs leading-tight truncate w-full"
          style={{
            color: idx === 0 ? '#5D4037' : idx === 1 ? '#2C3E50' : '#3E2723',
            textShadow: '0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          {entry.name}
        </div>
        <div
          className="font-black text-base leading-tight"
          style={{
            color: idx === 0 ? '#7B4F00' : idx === 1 ? '#1B2631' : '#4A2C13',
            textShadow: '0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          ⭐{entry.score}
        </div>
        <div
          className="text-[9px] font-bold leading-tight truncate w-full"
          style={{
            color: idx === 0 ? '#8B6914' : idx === 1 ? '#34495E' : '#5D4020',
          }}
        >
          {gameEmoji} {gameName}
        </div>
      </div>
    </motion.div>
  );
}

export default function FriendsLeaderboard() {
  const { t } = useT();
  const topScores = useMemo(() => computeTopScores(3), []);

  return (
    <section className="max-w-4xl mx-auto mb-8 px-4">
      {/* כותרת ללא קופסה - מוצמדת לדף ישירות */}
      <h2
        className="text-xl md:text-2xl font-black text-center mb-4 text-white"
        style={{
          fontFamily: '"Heebo", "Rubik", sans-serif',
          textShadow:
            '2px 2px 0 rgba(0,0,0,0.35), 0 0 12px rgba(255,215,0,0.6)',
        }}
      >
        {t('gamesHub.topFriendsTitle')}
      </h2>

      {topScores.length === 0 ? (
        <p
          className="text-center text-white/95 text-sm py-2 font-semibold"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
        >
          {t('gamesHub.noScoresYet')}
        </p>
      ) : (
        <div className="flex justify-center items-start gap-3 md:gap-8 flex-wrap">
          {topScores.map((entry, idx) => {
            const game = getGameById(entry.gameId);
            const gameName = game ? t(`games.${entry.gameId}.name`) : entry.gameId;
            const gameEmoji = game?.emoji || '🎮';
            return (
              <Medal
                key={`${entry.name}-${entry.gameId}-${idx}`}
                entry={entry}
                idx={idx}
                gameName={gameName}
                gameEmoji={gameEmoji}
                t={t}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
