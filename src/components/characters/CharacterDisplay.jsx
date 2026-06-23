import ShlomiCharacter from './ShlomiCharacter';
import NaomiCharacter from './NaomiCharacter';

// בוחרת את הדמות המתאימה לפי מגדר המשתמש
// ב-70% מהמקרים מציגה את הדמות התואמת, ב-30% הדמות השנייה (לגיוון)
export default function CharacterDisplay({
  gender,
  pose = 'neutral',
  size = 'md',
  animate = true,
  showOpposite = false,
  forceCharacter, // 'shlomi' | 'naomi' | undefined
}) {
  let chosen;
  if (forceCharacter === 'shlomi') chosen = 'shlomi';
  else if (forceCharacter === 'naomi') chosen = 'naomi';
  else if (showOpposite) {
    chosen = gender === 'male' ? 'naomi' : 'shlomi';
  } else {
    chosen = gender === 'male' ? 'shlomi' : 'naomi';
  }

  return chosen === 'shlomi' ? (
    <ShlomiCharacter pose={pose} size={size} animate={animate} />
  ) : (
    <NaomiCharacter pose={pose} size={size} animate={animate} />
  );
}

// קומפוננטה: שני הדמויות יחד (לדף הבית, להרשמה מוצלחת וכד')
export function DuoDisplay({ pose = 'neutral', size = 'lg', animate = true }) {
  return (
    <div className="flex items-end gap-4 justify-center">
      <ShlomiCharacter pose={pose} size={size} animate={animate} />
      <NaomiCharacter pose={pose} size={size} animate={animate} />
    </div>
  );
}
