import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Volume2, VolumeX, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import {
  getGreeting,
  getLevelName,
  getLevelProgress,
} from '../../utils/greetings';
import CharacterDisplay from '../characters/CharacterDisplay';

// Header עליון - מוצג בכל דפי המשחקים
export default function Header({ showBackButton = false }) {
  const { currentUser, logout } = useAuth();
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const levelProgress = getLevelProgress(currentUser.points);

  return (
    <header className="bg-white/90 backdrop-blur shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        {/* ימין - אווטר וברכה */}
        <div className="flex items-center gap-3">
          <Link to="/games" className="hover:scale-105 transition-transform">
            <CharacterDisplay gender={currentUser.gender} size="sm" pose="waving" />
          </Link>
          <div className="hidden sm:block">
            <div className="text-sm text-gray-500">
              {getGreeting(currentUser.name, currentUser.gender)}
            </div>
            <div className="text-xs text-accent-purple font-bold">
              {getLevelName(currentUser.level, currentUser.gender)} · רמה {currentUser.level}
            </div>
          </div>
        </div>

        {/* מרכז - מד נקודות ופס התקדמות */}
        <div className="flex-1 max-w-xs mx-2">
          <div className="flex items-center justify-between text-sm font-bold mb-1">
            <span className="text-accent-yellow">⭐ {currentUser.points} נקודות</span>
            <span className="text-xs text-gray-500">רמה {currentUser.level}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-primary to-accent-purple"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* שמאל - כפתורי פעולה */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
            aria-label={soundEnabled ? 'השתק' : 'הפעל סאונד'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <Link
            to="/games"
            className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
            aria-label="חזרה למשחקים"
          >
            <Home size={18} />
          </Link>
          <Link
            to="/profile"
            className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
            aria-label="פרופיל"
          >
            <User size={18} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-white shadow hover:scale-110 hover:bg-red-50 transition"
            aria-label="התנתק"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
