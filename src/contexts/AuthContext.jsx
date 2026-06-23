import { createContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { getLevelFromPoints } from '../utils/greetings';
import { checkNewAchievements } from '../utils/achievements';

export const AuthContext = createContext(null);

// פונקציה פנימית - מייצרת ID ייחודי
const genId = () => `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// יום ABS לשם השוואת רצפים
const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // טעינה ראשונית של המשתמש המחובר
  useEffect(() => {
    const userId = storage.getCurrentUserId();
    if (userId) {
      const users = storage.getUsers();
      const user = users.find((u) => u.id === userId);
      if (user) setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  // עזר - שמירת המשתמש הנוכחי במערך
  const persistUser = useCallback((updatedUser) => {
    const users = storage.getUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    storage.saveUsers(users);
    setCurrentUser(updatedUser);
  }, []);

  // הרשמה
  const register = useCallback(
    async ({ name, age, gender, email, password }) => {
      const users = storage.getUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('האימייל הזה כבר רשום במערכת');
      }
      const newUser = {
        id: genId(),
        name: name.trim(),
        age: Number(age),
        gender, // 'male' | 'female'
        email: email.trim().toLowerCase(),
        password, // ⚠️ דמו בלבד - localStorage
        createdAt: new Date().toISOString(),
        points: 0,
        level: 1,
        streak: 1,
        lastLoginDay: dayKey(),
        achievements: [],
        gameStats: {},
      };
      const newUsers = [...users, newUser];
      storage.saveUsers(newUsers);
      storage.setCurrentUserId(newUser.id);
      setCurrentUser(newUser);
      return newUser;
    },
    []
  );

  // כניסה
  const login = useCallback(async ({ email, password }) => {
    const users = storage.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user) throw new Error('המשתמש לא נמצא. נסו להירשם תחילה');
    if (user.password !== password) throw new Error('הסיסמה לא נכונה');

    // עדכון רצף ימים
    const today = dayKey();
    const yesterday = dayKey(new Date(Date.now() - 86400000));
    let newStreak = user.streak || 1;
    if (user.lastLoginDay === today) {
      // כבר היום - לא משנים
    } else if (user.lastLoginDay === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    const updated = { ...user, streak: newStreak, lastLoginDay: today };
    persistUser(updated);
    storage.setCurrentUserId(updated.id);
    return updated;
  }, [persistUser]);

  // התנתקות
  const logout = useCallback(() => {
    storage.setCurrentUserId(null);
    setCurrentUser(null);
  }, []);

  // עדכון פרטי משתמש שרירותי
  const updateUser = useCallback(
    (updates) => {
      if (!currentUser) return;
      const updated = { ...currentUser, ...updates };
      persistUser(updated);
    },
    [currentUser, persistUser]
  );

  // הוספת ניקוד למשחק - מטפל בנקודות, רמה, סטטיסטיקות, הישגים, שיא חדש
  const addGameScore = useCallback(
    (gameId, score, pointsEarned) => {
      if (!currentUser) return { newRecord: false, newAchievements: [] };
      const stats = currentUser.gameStats[gameId] || {
        highScore: 0,
        timesPlayed: 0,
        totalScore: 0,
      };
      const newRecord = score > stats.highScore;
      const updatedStats = {
        ...stats,
        highScore: Math.max(stats.highScore, score),
        timesPlayed: stats.timesPlayed + 1,
        totalScore: stats.totalScore + score,
        lastPlayed: new Date().toISOString(),
      };
      const newPoints = (currentUser.points || 0) + pointsEarned + (newRecord ? 50 : 0);
      const newLevel = getLevelFromPoints(newPoints);

      const tentative = {
        ...currentUser,
        points: newPoints,
        level: newLevel,
        gameStats: { ...currentUser.gameStats, [gameId]: updatedStats },
      };

      const { allAchievements, newOnes } = checkNewAchievements(tentative, { newRecord });
      const finalUser = { ...tentative, achievements: allAchievements };
      persistUser(finalUser);
      return { newRecord, newAchievements: newOnes, levelUp: newLevel > currentUser.level };
    },
    [currentUser, persistUser]
  );

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateUser,
    addGameScore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
