import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

function isRealToken(token) {
  return Boolean(token) && !token.startsWith('demo-');
}

function normalizeRole(role) {
  return String(role || '').toLowerCase();
}

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cc-token');
    localStorage.removeItem('cc-user');
  };

  const applyAuthSession = ({ token, fullName, email, role, id }) => {
    const userData = {
      id,
      name: fullName,
      email,
      role: normalizeRole(role),
    };
    if (token) {
      localStorage.setItem('cc-token', token);
    }
    localStorage.setItem('cc-user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  useEffect(() => {
    const token = localStorage.getItem('cc-token');
    if (!isRealToken(token)) {
      if (token) logout();
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        const fetchedUser = {
          id: res.data.id,
          name: res.data.fullName,
          email: res.data.email,
          role: normalizeRole(res.data.role),
        };
        setUser(fetchedUser);
        localStorage.setItem('cc-user', JSON.stringify(fetchedUser));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      applyAuthSession({
        token: data.token,
        fullName: data.fullName,
        email: data.email || email,
        role: data.role,
        id: data.id,
      });
      return { success: true, role: normalizeRole(data.role) };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials';
      const status = err.response?.status;
      return {
        success: false,
        error: typeof msg === 'string' ? msg : 'Invalid credentials',
        needsVerification: status === 403 && String(msg).toLowerCase().includes('verify'),
      };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const res = await api.post('/auth/register', { fullName, email, password });
      const data = res.data;

      if (data.requiresEmailVerification || !data.token) {
        return {
          success: true,
          requiresEmailVerification: true,
          email: data.email || email,
        };
      }

      applyAuthSession({
        token: data.token,
        fullName: data.fullName || fullName,
        email: data.email || email,
        role: data.role,
        id: data.id,
      });
      return { success: true, role: normalizeRole(data.role) };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      return { success: false, error: typeof msg === 'string' ? msg : 'Registration failed' };
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, applyAuthSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
