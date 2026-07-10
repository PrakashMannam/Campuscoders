import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const DEFAULT_XP = 0;
const DAILY_STATE_RESET_VERSION = '2026-07-08-dashboard-reset-v1';

// Demo credentials — replace with real API calls when backend is ready
const DEMO_USERS = [
  { email: 'student@campus.com', password: 'student123', role: 'student', name: 'Alex Rivera' }, // Match default student name from user profile mocks
  { email: 'admin@campus.com',   password: 'admin123',   role: 'admin',   name: 'Shaik Khaleed' },
];

export function AuthProvider({ children }) {
  const getTodayKey = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  };

  const resetDailyStateIfNeeded = () => {
    if (localStorage.getItem('cc-daily-reset-version') === DAILY_STATE_RESET_VERSION) return;

    localStorage.setItem('cc-user-xp', String(DEFAULT_XP));
    localStorage.removeItem('cc-user-solved-today');
    localStorage.removeItem('cc-user-checkin-date');
    localStorage.setItem('cc-daily-reset-version', DAILY_STATE_RESET_VERSION);
  };

  const [user, setUser] = useState(() => {
    try {
      resetDailyStateIfNeeded();
      const stored = localStorage.getItem('cc-user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          parsed.xp = parseInt(localStorage.getItem('cc-user-xp') || String(DEFAULT_XP));
          parsed.solvedToday = localStorage.getItem('cc-user-solved-today') === 'true';
          if (parsed.codechefUser === undefined) parsed.codechefUser = localStorage.getItem('cc-user-codechef') || '';
          if (parsed.hackerrankUser === undefined) parsed.hackerrankUser = localStorage.getItem('cc-user-hackerrank') || '';
          parsed.checkinDate = localStorage.getItem('cc-user-checkin-date') || '';
          parsed.checkedInToday = parsed.checkinDate === getTodayKey();
          localStorage.setItem('cc-user', JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const login = (email, password, role) => {
    const match = DEMO_USERS.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (match) {
      // Default metadata for demo
      const userData = {
        name: match.name,
        email: match.email,
        role: match.role,
        avatar: localStorage.getItem('cc-user-avatar') || null,
        leetcodeUser: localStorage.getItem('cc-user-leetcode') || '',
        gfgUser: localStorage.getItem('cc-user-gfg') || '',
        codechefUser: localStorage.getItem('cc-user-codechef') || '',
        hackerrankUser: localStorage.getItem('cc-user-hackerrank') || '',
        githubUser: localStorage.getItem('cc-user-github') || '',
        linkedinUser: localStorage.getItem('cc-user-linkedin') || '',
        solvedCount: parseInt(localStorage.getItem('cc-user-solved') || '48'),
        solvedToday: localStorage.getItem('cc-user-solved-today') === 'true',
        xp: parseInt(localStorage.getItem('cc-user-xp') || String(DEFAULT_XP)),
        checkinDate: localStorage.getItem('cc-user-checkin-date') || '',
        checkedInToday: localStorage.getItem('cc-user-checkin-date') === getTodayKey()
      };
      setUser(userData);
      localStorage.setItem('cc-user', JSON.stringify(userData));
      return { success: true, role: match.role };
    }
    return { success: false, error: 'Invalid credentials. Please check your email, password, and selected role.' };
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...updates };
      localStorage.setItem('cc-user', JSON.stringify(newUser));
      if (updates.avatar !== undefined) localStorage.setItem('cc-user-avatar', updates.avatar || '');
      if (updates.leetcodeUser !== undefined) localStorage.setItem('cc-user-leetcode', updates.leetcodeUser || '');
      if (updates.gfgUser !== undefined) localStorage.setItem('cc-user-gfg', updates.gfgUser || '');
      if (updates.codechefUser !== undefined) localStorage.setItem('cc-user-codechef', updates.codechefUser || '');
      if (updates.hackerrankUser !== undefined) localStorage.setItem('cc-user-hackerrank', updates.hackerrankUser || '');
      if (updates.githubUser !== undefined) localStorage.setItem('cc-user-github', updates.githubUser || '');
      if (updates.linkedinUser !== undefined) localStorage.setItem('cc-user-linkedin', updates.linkedinUser || '');
      if (updates.solvedCount !== undefined) localStorage.setItem('cc-user-solved', String(updates.solvedCount));
      if (updates.solvedToday !== undefined) localStorage.setItem('cc-user-solved-today', String(updates.solvedToday));
      if (updates.xp !== undefined) localStorage.setItem('cc-user-xp', String(updates.xp));
      if (updates.checkinDate !== undefined) localStorage.setItem('cc-user-checkin-date', updates.checkinDate || '');
      return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cc-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
