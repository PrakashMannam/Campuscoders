import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

function isPublicLightPath(pathname) {
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return false;
  }
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname.startsWith('/u/') ||
    pathname.startsWith('/profile/public')
  );
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cc-theme') || 'light';
    } catch {
      return 'light';
    }
  });

  const applyTheme = useCallback((next) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', next);
    root.style.colorScheme = next;
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('cc-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme, applyTheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** Landing + auth stay light; dashboard/admin keep the user's saved theme. */
export function ThemeRouteSync() {
  const location = useLocation();
  const { theme, applyTheme } = useTheme();

  useEffect(() => {
    if (isPublicLightPath(location.pathname)) {
      applyTheme('light');
    } else {
      applyTheme(theme);
    }
  }, [location.pathname, theme, applyTheme]);

  return null;
}
