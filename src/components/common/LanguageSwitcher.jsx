import { motion } from 'framer-motion';
import { useT } from '../../hooks/useT';

// כפתורי בחירת שפה - קומפקטי, מציג רק דגלים (השם נסתר במובייל)
export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useT();

  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5 shadow-sm">
      {Object.entries(languages).map(([code, info]) => (
        <motion.button
          key={code}
          whileTap={{ scale: 0.92 }}
          onClick={() => setLang(code)}
          className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
            lang === code
              ? 'bg-gradient-to-l from-primary to-accent-purple text-white shadow'
              : 'text-text-primary hover:bg-white'
          }`}
          aria-label={info.name}
          title={info.name}
        >
          <span className="text-base leading-none">{info.flag}</span>
        </motion.button>
      ))}
    </div>
  );
}
