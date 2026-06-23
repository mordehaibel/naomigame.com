// כל המטא-דאטה של 16 המשחקים, מסודרים לפי קטגוריות

export const CATEGORIES = [
  {
    id: 'retro',
    title: 'משחקי GameBoy',
    emoji: '🕹️',
    color: 'from-purple-500 to-pink-500',
    description: 'קלאסיקות שכולנו אוהבים',
  },
  {
    id: 'speed',
    title: 'משחקי לחץ זמן',
    emoji: '⏱️',
    color: 'from-orange-500 to-red-500',
    description: 'תגובות מהירות = ניצחון',
  },
  {
    id: 'thinking',
    title: 'חשיבה ומתמטיקה',
    emoji: '🧠',
    color: 'from-blue-500 to-indigo-600',
    description: 'אתגרים לראש',
  },
  {
    id: 'special',
    title: 'המשחק הייחודי שלנו',
    emoji: '🌟',
    color: 'from-pink-500 via-yellow-400 to-purple-500',
    description: 'הרפתקה עם שלומי ונעמי!',
    featured: true,
  },
  {
    id: 'puzzle',
    title: 'פאזלים וזיכרון',
    emoji: '🧩',
    color: 'from-teal-400 to-green-500',
    description: 'תרגיל לזיכרון',
  },
  {
    id: 'runner',
    title: 'משחקי ריצה ופעולה',
    emoji: '🏃',
    color: 'from-red-500 via-orange-500 to-yellow-400',
    description: 'אקשן! קושי הולך וגדל',
  },
];

export const GAMES = [
  // 🕹️ Retro
  { id: 'snake', name: 'Snake', hebName: 'הנחש', category: 'retro', emoji: '🐍', built: true, color: 'bg-green-500' },
  { id: 'tetris', name: 'Tetris', hebName: 'טטריס', category: 'retro', emoji: '🟦', built: true, color: 'bg-blue-500' },
  { id: 'pong', name: 'Pong', hebName: 'פונג', category: 'retro', emoji: '🏓', built: true, color: 'bg-purple-500' },
  { id: 'pacman', name: 'Pac-Man Style', hebName: 'פקפק', category: 'retro', emoji: '👾', built: true, color: 'bg-yellow-500' },
  { id: 'breakout', name: 'Breakout', hebName: 'שובר לבנים', category: 'retro', emoji: '🧱', built: true, color: 'bg-red-500' },

  // ⏱️ Speed
  { id: 'reaction-time', name: 'Reaction Time', hebName: 'זמן תגובה', category: 'speed', emoji: '⚡', built: true, color: 'bg-orange-500' },
  { id: 'number-hunt', name: 'Number Hunt', hebName: 'ציד מספרים', category: 'speed', emoji: '🔢', built: true, color: 'bg-pink-500' },
  { id: 'shape-match', name: 'Shape Match', hebName: 'התאמת צורות', category: 'speed', emoji: '🔷', built: true, color: 'bg-cyan-500' },
  { id: 'memory-flash', name: 'Memory Flash', hebName: 'מהר ואמיץ', category: 'speed', emoji: '💡', built: true, color: 'bg-amber-500' },

  // 🧠 Thinking
  { id: 'math', name: 'Quick Math', hebName: 'חשבון מהיר', category: 'thinking', emoji: '➗', built: true, color: 'bg-indigo-500' },
  { id: 'number-sequence', name: 'Number Sequence', hebName: 'רצף החכמים', category: 'thinking', emoji: '🔮', built: true, color: 'bg-blue-600' },
  { id: 'equation-builder', name: 'Equation Builder', hebName: 'בנה משוואה', category: 'thinking', emoji: '🧮', built: true, color: 'bg-violet-500' },

  // 🌟 Special
  { id: 'adventure', name: 'Adventure', hebName: 'המסע של שלומי ונעמי', category: 'special', emoji: '🗺️', built: true, color: 'bg-gradient-to-l from-pink-500 to-purple-500', special: true },

  // 🧩 Puzzle
  { id: 'memory', name: 'Memory Cards', hebName: 'זוגות זיכרון', category: 'puzzle', emoji: '🎴', built: true, color: 'bg-teal-500' },
  { id: 'sliding-puzzle', name: '15-Puzzle', hebName: 'פאזל ה-15', category: 'puzzle', emoji: '🧩', built: true, color: 'bg-emerald-500' },

  // Bonus
  { id: 'whack-a-mole', name: 'Whack-a-Mole', hebName: 'פגע בשפן', category: 'speed', emoji: '🐹', built: true, color: 'bg-rose-500' },

  // 🏃 Runner / Action - 10 משחקי ריצה עם קושי הולך וגדל
  { id: 'train-run', name: 'Train Run', hebName: 'רץ על פסי הרכבת', category: 'runner', emoji: '🚂', built: true, color: 'bg-slate-700' },
  { id: 'winding-path', name: 'Winding Path', hebName: 'דרך מתפתלת', category: 'runner', emoji: '🌿', built: true, color: 'bg-amber-700' },
  { id: 'roof-jumper', name: 'Roof Jumper', hebName: 'קופץ על גגות', category: 'runner', emoji: '🦘', built: true, color: 'bg-orange-500' },
  { id: 'dark-run', name: 'Dark Run', hebName: 'ריצה באפלה', category: 'runner', emoji: '🕯️', built: true, color: 'bg-gray-900' },
  { id: 'jungle-run', name: 'Jungle Run', hebName: 'ריצה בג׳ונגל', category: 'runner', emoji: '🌴', built: true, color: 'bg-green-700' },
  { id: 'snow-run', name: 'Snow Run', hebName: 'רץ בשלג', category: 'runner', emoji: '⛷️', built: true, color: 'bg-sky-300' },
  { id: 'city-run', name: 'City Run', hebName: 'ריצה בעיר', category: 'runner', emoji: '🚗', built: true, color: 'bg-zinc-600' },
  { id: 'brick-jumper', name: 'Brick Jumper', hebName: 'קופץ על לבנים', category: 'runner', emoji: '🧱', built: true, color: 'bg-stone-600' },
  { id: 'underwater', name: 'Underwater Swim', hebName: 'ריצה בים', category: 'runner', emoji: '🏊', built: true, color: 'bg-blue-700' },
  { id: 'space-run', name: 'Space Run', hebName: 'ריצה בחלל', category: 'runner', emoji: '🚀', built: true, color: 'bg-indigo-950' },
];

export function getGameById(id) {
  return GAMES.find((g) => g.id === id);
}

export function getGamesByCategory(catId) {
  return GAMES.filter((g) => g.category === catId);
}
