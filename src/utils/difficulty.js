// כלי עזר - בחירת רמת קושי ברירת מחדל לפי גיל המשתמש

export function getDefaultDifficulty(age) {
  if (!age || age <= 10) return 'easy';
  if (age <= 15) return 'medium';
  return 'hard';
}

// טייר גיל למשחק החשבון - מגדיר את סוג התרגילים
export function getMathTier(age) {
  if (!age || age <= 8) return 'tier1'; // 5-8
  if (age <= 12) return 'tier2';        // 9-12
  if (age <= 16) return 'tier3';        // 13-16
  return 'tier4';                        // 17-20
}

export const DIFFICULTY_LABELS = {
  easy: { emoji: '🟢', name: 'קל', color: 'from-green-400 to-success-green' },
  medium: { emoji: '🟡', name: 'בינוני', color: 'from-accent-yellow to-accent-orange' },
  hard: { emoji: '🔴', name: 'קשה', color: 'from-error-red to-pink-600' },
};
