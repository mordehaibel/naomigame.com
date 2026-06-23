// פונקציות לפרסונליזציה - ברכות, עידוד והודעות בעברית עם התאמת מגדר

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ברכה לפי שעה ביום
export function getGreeting(name, gender) {
  const hour = new Date().getHours();
  let timeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = `בוקר טוב ☀️`;
  else if (hour >= 12 && hour < 17) timeOfDay = `צהריים טובים 🌤️`;
  else if (hour >= 17 && hour < 21) timeOfDay = `ערב טוב 🌙`;
  else timeOfDay = `לילה טוב 🌙`;
  return `${timeOfDay}, ${name}!`;
}

// הודעת ניצחון - מותאמת מגדר
export function getWinMessage(name, gender) {
  const isMale = gender === 'male';
  const messages = isMale
    ? [
        `כל הכבוד, ${name}! אתה אלוף! 🏆`,
        `וואו ${name}, אתה מטורף! 🌟`,
        `אתה הכי, ${name}! 💪`,
        `ניצחת ${name}! אתה גאון! 🎉`,
      ]
    : [
        `כל הכבוד, ${name}! את אלופה! 🏆`,
        `וואו ${name}, את מטורפת! 🌟`,
        `את הכי, ${name}! 💪`,
        `ניצחת ${name}! את גאונה! 🎉`,
      ];
  return randomPick(messages);
}

// הודעת הפסד - עידוד עדין, מותאם מגדר
export function getLossMessage(name, gender) {
  const isMale = gender === 'male';
  const messages = isMale
    ? [
        `כמעט, ${name}! נסה שוב, אתה תצליח! 💪`,
        `אתה קרוב, ${name}! עוד ניסיון! 🚀`,
        `${name}, אל תוותר! אתה יכול! ⭐`,
        `נסה שוב ${name}, אתה תהיה מצוין! 🎯`,
      ]
    : [
        `כמעט, ${name}! נסי שוב, את תצליחי! 💪`,
        `את קרובה, ${name}! עוד ניסיון! 🚀`,
        `${name}, אל תוותרי! את יכולה! ⭐`,
        `נסי שוב ${name}, את תהיי מצוינת! 🎯`,
      ];
  return randomPick(messages);
}

// עידוד תוך כדי משחק - קצר, מותאם מגדר
export function getEncouragement(name, gender) {
  const isMale = gender === 'male';
  const messages = isMale
    ? [`קדימה ${name}!`, `${name}, אתה יכול!`, `בוא ${name}!`, `אש ${name}! 🔥`]
    : [`קדימה ${name}!`, `${name}, את יכולה!`, `בואי ${name}!`, `אש ${name}! 🔥`];
  return randomPick(messages);
}

// הודעת שיא חדש - מגדר
export function getNewRecordMessage(name, gender) {
  const isMale = gender === 'male';
  return isMale
    ? `🎊 שיא חדש, ${name}! אתה אגדה!`
    : `🎊 שיא חדש, ${name}! את אגדה!`;
}

// הודעות סתם בזמן משחק
export function getRandomTip(name, gender) {
  const isMale = gender === 'male';
  const tips = isMale
    ? [
        `${name}, נסה את המשחק החדש! 🎮`,
        `איזה משחק תרצה לשחק היום, ${name}?`,
        `${name}, אתה כבר ${getRandomLevelTip(true)}!`,
      ]
    : [
        `${name}, נסי את המשחק החדש! 🎮`,
        `איזה משחק תרצי לשחק היום, ${name}?`,
        `${name}, את כבר ${getRandomLevelTip(false)}!`,
      ];
  return randomPick(tips);
}

function getRandomLevelTip(isMale) {
  return isMale
    ? randomPick(['מתקדם', 'אלוף', 'מקצוען'])
    : randomPick(['מתקדמת', 'אלופה', 'מקצוענית']);
}

// חישוב נקודות לפי סוג משחק וביצוע
export function calculatePoints(score, gameType) {
  const multipliers = {
    snake: 1,
    memory: 2,
    math: 1.5,
    reaction: 3,
    default: 1,
  };
  const m = multipliers[gameType] || multipliers.default;
  return Math.floor(score * m);
}

// רמה לפי נקודות
export function getLevelFromPoints(points) {
  if (points < 100) return 1;
  if (points < 300) return 2;
  if (points < 700) return 3;
  if (points < 1500) return 4;
  return 5;
}

// שם רמה (מותאם מגדר אם ניתן)
export function getLevelName(level, gender) {
  const isMale = gender === 'male';
  const names = {
    1: 'מתחיל/ה',
    2: isMale ? 'שחקן צעיר' : 'שחקנית צעירה',
    3: isMale ? 'שחקן מתקדם' : 'שחקנית מתקדמת',
    4: isMale ? 'אלוף' : 'אלופה',
    5: 'אגדה 🏆',
  };
  return names[level] || names[1];
}

// כמה נקודות צריך עוד לרמה הבאה
export function getPointsToNextLevel(points) {
  const thresholds = [0, 100, 300, 700, 1500];
  const currentLevel = getLevelFromPoints(points);
  if (currentLevel >= 5) return 0;
  return thresholds[currentLevel] - points;
}

// אחוז התקדמות בתוך הרמה הנוכחית
export function getLevelProgress(points) {
  const thresholds = [0, 100, 300, 700, 1500, 5000];
  const currentLevel = getLevelFromPoints(points);
  const start = thresholds[currentLevel - 1];
  const end = thresholds[currentLevel];
  return Math.min(100, Math.max(0, ((points - start) / (end - start)) * 100));
}
