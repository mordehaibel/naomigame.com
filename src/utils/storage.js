// כלי עזר לאחסון ב-localStorage עם הגנה על JSON parsing

const USERS_KEY = 'snk_users';
const CURRENT_USER_KEY = 'snk_currentUser';
const SOUND_KEY = 'snk_soundEnabled';

export const storage = {
  getUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getCurrentUserId() {
    return localStorage.getItem(CURRENT_USER_KEY);
  },

  setCurrentUserId(id) {
    if (id) localStorage.setItem(CURRENT_USER_KEY, id);
    else localStorage.removeItem(CURRENT_USER_KEY);
  },

  getSoundEnabled() {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw === null ? true : raw === 'true';
  },

  setSoundEnabled(enabled) {
    localStorage.setItem(SOUND_KEY, String(enabled));
  },
};
