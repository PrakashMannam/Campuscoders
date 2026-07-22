import React, { createContext, useContext, useState, useEffect } from 'react';

const ProgressContext = createContext(null);

const getStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
};

const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export function ProgressProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => getStorage('cc-bookmarks'));
  const [completed, setCompleted] = useState(() => getStorage('cc-completed'));

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const next = { ...prev, [id]: !prev[id] };
      setStorage('cc-bookmarks', next);
      return next;
    });
  };

  const toggleCompleted = (id) => {
    setCompleted(prev => {
      const next = { ...prev, [id]: !prev[id] };
      setStorage('cc-completed', next);
      return next;
    });
  };

  const isBookmarked = (id, defaultVal = false) => bookmarks[id] !== undefined ? !!bookmarks[id] : !!defaultVal;
  const isCompleted = (id, defaultVal = false) => completed[id] !== undefined ? !!completed[id] : !!defaultVal;

  return (
    <ProgressContext.Provider value={{ bookmarks, completed, toggleBookmark, toggleCompleted, isBookmarked, isCompleted }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
