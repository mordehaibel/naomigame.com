// הגדרות הישגים (Badges) באתר

export const ACHIEVEMENTS = [
  { id: 'first-game', emoji: '🎮', name: 'משחק ראשון', description: 'שיחקת את המשחק הראשון שלך!' },
  { id: 'fast-runner', emoji: '🏃', name: 'רץ מהיר', description: 'שיחקת 5 פעמים במשחקי לחץ זמן' },
  { id: 'math-genius', emoji: '🧠', name: 'גאון במתמטיקה', description: 'הצלחת בכל משחקי המתמטיקה' },
  { id: 'retro-gamer', emoji: '🕹️', name: 'גיימר רטרו', description: 'שיחקת בכל משחקי הרטרו' },
  { id: 'memory-master', emoji: '🎴', name: 'מאסטר זיכרון', description: 'סיימת משחק זיכרון מלא' },
  { id: 'rising-star', emoji: '🌟', name: 'כוכב עולה', description: 'הגעת לרמה 3' },
  { id: 'legend', emoji: '🏆', name: 'אגדה', description: 'הגעת לרמה 5!' },
  { id: 'streak-7', emoji: '💎', name: 'רצף 7 ימים', description: 'שיחקת 7 ימים ברצף' },
  { id: 'high-scorer', emoji: '⭐', name: 'גבוה למעלה', description: 'שברת שיא אישי' },
];

export function getAchievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// מחזיר רשימת הישגים חדשים שצריך לתת למשתמש על סמך מצבו
export function checkNewAchievements(user, context = {}) {
  const earned = new Set(user.achievements || []);
  const newOnes = [];

  const add = (id) => {
    if (!earned.has(id)) {
      earned.add(id);
      newOnes.push(id);
    }
  };

  // משחק ראשון
  const totalPlays = Object.values(user.gameStats || {}).reduce(
    (sum, s) => sum + (s.timesPlayed || 0),
    0
  );
  if (totalPlays >= 1) add('first-game');

  // רץ מהיר - 5 משחקי לחץ זמן
  const reactionGames = ['reaction-time', 'number-hunt', 'shape-match', 'memory-flash'];
  const reactionPlays = reactionGames.reduce(
    (sum, g) => sum + (user.gameStats?.[g]?.timesPlayed || 0),
    0
  );
  if (reactionPlays >= 5) add('fast-runner');

  // מאסטר זיכרון
  if ((user.gameStats?.memory?.timesPlayed || 0) >= 1) add('memory-master');

  // רמות
  if (user.level >= 3) add('rising-star');
  if (user.level >= 5) add('legend');

  // שיא חדש
  if (context.newRecord) add('high-scorer');

  // רצף
  if ((user.streak || 0) >= 7) add('streak-7');

  return { allAchievements: Array.from(earned), newOnes };
}
