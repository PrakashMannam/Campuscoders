import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cc-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync user state with backend /api/auth/me on app boot if token exists
  useEffect(() => {
    const token = localStorage.getItem('cc-token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          const fetchedUser = {
            id: res.data.id,
            name: res.data.fullName,
            email: res.data.email,
            role: res.data.role.toLowerCase(),
          };
          setUser((prev) => ({ ...prev, ...fetchedUser }));
          localStorage.setItem('cc-user', JSON.stringify(fetchedUser));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, fullName, role: backendRole } = res.data;
      const normalizedRole = backendRole.toLowerCase();

      const userData = {
        name: fullName,
        email,
        role: normalizedRole,
      };

      localStorage.setItem('cc-token', token);
      localStorage.setItem('cc-user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, role: normalizedRole };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials';
      return { success: false, error: msg };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const res = await api.post('/auth/register', { fullName, email, password });
      const { token, role: backendRole } = res.data;
      const normalizedRole = backendRole.toLowerCase();

      const userData = {
        name: fullName,
        email,
        role: normalizedRole,
      };

      localStorage.setItem('cc-token', token);
      localStorage.setItem('cc-user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, role: normalizedRole };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...updates };
      localStorage.setItem('cc-user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cc-token');
    localStorage.removeItem('cc-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
