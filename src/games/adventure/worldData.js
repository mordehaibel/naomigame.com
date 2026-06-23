// תצורת המסע: 5 מדינות, 3 רמות בכל מדינה, 15 רמות סה"כ.
// כל מדינה = ציד אוצר. הילדים נוסעים מארץ לארץ למצוא אוצרות.
// סוגי מיני-משחקים: 'catch' (לכוד פריטים), 'memory' (זוגות), 'simon' (חזרה על סדר).

export const WORLDS = [
  {
    id: 0,
    nameKey: 'usa',
    emoji: '🇺🇸',
    bgFrom: 'from-blue-700',
    bgTo: 'to-red-700',
    accent: '#1565C0',
    levels: [
      { type: 'catch', introKey: 'usa', target: 4, time: 25, badGuyChance: 0.2 },
      { type: 'memory', introKey: 'usa', pairs: 3, maxMoves: 10 },
      { type: 'simon', introKey: 'usa', length: 4 },
    ],
  },
  {
    id: 1,
    nameKey: 'japan',
    emoji: '🇯🇵',
    bgFrom: 'from-pink-300',
    bgTo: 'to-red-600',
    accent: '#E91E63',
    levels: [
      { type: 'memory', introKey: 'japan', pairs: 4, maxMoves: 14 },
      { type: 'catch', introKey: 'japan', target: 6, time: 30, badGuyChance: 0.25 },
      { type: 'simon', introKey: 'japan', length: 5 },
    ],
  },
  {
    id: 2,
    nameKey: 'france',
    emoji: '🇫🇷',
    bgFrom: 'from-blue-500',
    bgTo: 'to-rose-500',
    accent: '#1976D2',
    levels: [
      { type: 'simon', introKey: 'france', length: 5 },
      { type: 'catch', introKey: 'france', target: 7, time: 30, badGuyChance: 0.3 },
      { type: 'memory', introKey: 'france', pairs: 5, maxMoves: 18 },
    ],
  },
  {
    id: 3,
    nameKey: 'egypt',
    emoji: '🇪🇬',
    bgFrom: 'from-amber-300',
    bgTo: 'to-orange-700',
    accent: '#FF8F00',
    levels: [
      { type: 'catch', introKey: 'egypt', target: 8, time: 30, badGuyChance: 0.35 },
      { type: 'simon', introKey: 'egypt', length: 6 },
      { type: 'memory', introKey: 'egypt', pairs: 6, maxMoves: 20 },
    ],
  },
  {
    id: 4,
    nameKey: 'brazil',
    emoji: '🇧🇷',
    bgFrom: 'from-green-500',
    bgTo: 'to-yellow-600',
    accent: '#388E3C',
    levels: [
      { type: 'memory', introKey: 'brazil', pairs: 6, maxMoves: 18 },
      { type: 'simon', introKey: 'brazil', length: 7 },
      { type: 'catch', introKey: 'brazil', target: 10, time: 30, badGuyChance: 0.4 },
    ],
  },
];

export const TOTAL_LEVELS = WORLDS.reduce((sum, w) => sum + w.levels.length, 0);

// המרת אינדקס גלובלי → world index + level index
export function indexToCoords(globalIndex) {
  let remaining = globalIndex;
  for (let w = 0; w < WORLDS.length; w++) {
    if (remaining < WORLDS[w].levels.length) return { world: w, level: remaining };
    remaining -= WORLDS[w].levels.length;
  }
  return null;
}

// המרת world+level → אינדקס גלובלי
export function coordsToIndex(worldIdx, levelIdx) {
  let total = 0;
  for (let w = 0; w < worldIdx; w++) total += WORLDS[w].levels.length;
  return total + levelIdx;
}

// בדיקה אם רמה ספציפית פתוחה
export function isLevelUnlocked(worldIdx, levelIdx, progress) {
  return coordsToIndex(worldIdx, levelIdx) <= progress;
}

// בדיקה אם רמה ספציפית הושלמה
export function isLevelCompleted(worldIdx, levelIdx, progress) {
  return coordsToIndex(worldIdx, levelIdx) < progress;
}

// בדיקה אם עולם פתוח (אם הרמה הראשונה שלו פתוחה)
export function isWorldUnlocked(worldIdx, progress) {
  return isLevelUnlocked(worldIdx, 0, progress);
}

// בדיקה אם כל העולם הושלם
export function isWorldCompleted(worldIdx, progress) {
  const lastLevelIdx = WORLDS[worldIdx].levels.length - 1;
  return isLevelCompleted(worldIdx, lastLevelIdx, progress);
}
