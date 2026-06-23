import { useContext } from 'react';
import { I18nContext } from '../contexts/I18nContext';

// hook קטן - מחזיר את t (תרגום) ופונקציות שפה
export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}
