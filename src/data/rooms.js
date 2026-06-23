// 7 חדרי הארמון - לדף Discover
// כל חדר מוגדר עם id, אמוג'י, שני צבעים בתוני חום (light + dark) ואופן sily של clip-path

export const ROOMS = [
  {
    id: 'naomi-room',
    emoji: '🛏️',
    light: '#F8C4D4', // ורוד-בז' (חדר ילדה)
    dark: '#A85C7A',
    accent: '#FF6B9D',
    shape: 'arch',
  },
  {
    id: 'living-room',
    emoji: '🛋️',
    light: '#D4B896', // בז' חם
    dark: '#7C5E3C',
    accent: '#A0826D',
    shape: 'wide',
  },
  {
    id: 'kitchen',
    emoji: '🍳',
    light: '#FFE0B2', // צהוב-בז' (מטבח)
    dark: '#E65100',
    accent: '#FF9800',
    shape: 'tower',
  },
  {
    id: 'play-room',
    emoji: '🎲',
    light: '#C5E1A5', // ירוק-בהיר (משחקים)
    dark: '#33691E',
    accent: '#7CB342',
    shape: 'tall-arch',
  },
  {
    id: 'parents-room',
    emoji: '👨‍👩',
    light: '#B3E5FC', // תכלת
    dark: '#01579B',
    accent: '#0288D1',
    shape: 'arch',
  },
  {
    id: 'grandparents-room',
    emoji: '👴',
    light: '#E1BEE7', // לילך
    dark: '#4A148C',
    accent: '#7B1FA2',
    shape: 'wide',
  },
  {
    id: 'gardens',
    emoji: '🌹',
    light: '#A5D6A7', // ירוק כהה (גנים)
    dark: '#1B5E20',
    accent: '#388E3C',
    shape: 'pointed',
    special: true, // קלף גדול במיוחד - גני הארמון
  },
];

// Clip-paths לארבעת הצורות של חדרי הארמון
export const ROOM_SHAPES = {
  // קשת קלאסית - חלון/דלת ארמון רגיל
  arch:
    'polygon(0% 100%, 0% 35%, 8% 18%, 25% 6%, 50% 0%, 75% 6%, 92% 18%, 100% 35%, 100% 100%)',
  // קשת גבוהה וצרה - מגדל
  'tall-arch':
    'polygon(0% 100%, 0% 30%, 12% 12%, 30% 3%, 50% 0%, 70% 3%, 88% 12%, 100% 30%, 100% 100%)',
  // קשת רחבה ושטוחה - חדר רחב
  wide:
    'polygon(0% 100%, 0% 28%, 5% 18%, 18% 10%, 35% 4%, 50% 2%, 65% 4%, 82% 10%, 95% 18%, 100% 28%, 100% 100%)',
  // צריח עם גג מחודד
  tower:
    'polygon(0% 100%, 0% 38%, 12% 38%, 12% 25%, 50% 0%, 88% 25%, 88% 38%, 100% 38%, 100% 100%)',
  // קשת חדה (דמוית גוטית)
  pointed:
    'polygon(0% 100%, 0% 35%, 15% 22%, 35% 10%, 50% 2%, 65% 10%, 85% 22%, 100% 35%, 100% 100%)',
};

export function getRoomById(id) {
  return ROOMS.find((r) => r.id === id);
}
