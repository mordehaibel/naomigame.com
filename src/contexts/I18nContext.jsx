import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import he from '../locales/he.js';
import fr from '../locales/fr.js';

const LANGUAGES = {
  he: { name: 'עברית', flag: '🇮🇱', dir: 'rtl', dict: he },
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr', dict: fr },
};

const STORAGE_KEY = 'snk_lang';

export const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LANGUAGES[stored]) return stored;
    } catch {
      // ignore
    }
    return 'he';
  });

  // Sync HTML dir + lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;
  }, [lang]);

  const setLang = useCallback((newLang) => {
    if (!LANGUAGES[newLang]) return;
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
    setLangState(newLang);
  }, []);

  // פונקציית תרגום עם dot-path: t('common.play') או t('register.successBoy', 'דניאל')
  // אם הערך הוא פונקציה - תופעל עם הפרמטרים הנוספים.
  const t = useCallback(
    (path, ...args) => {
      const dict = LANGUAGES[lang].dict;
      const parts = path.split('.');
      let value = dict;
      for (const p of parts) {
        if (value && typeof value === 'object' && p in value) {
          value = value[p];
        } else {
          return path; // fallback - מחזיר את המפתח אם לא נמצא
        }
      }
      if (typeof value === 'function') return value(...args);
      return value;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      dir: LANGUAGES[lang].dir,
      languages: LANGUAGES,
    }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
