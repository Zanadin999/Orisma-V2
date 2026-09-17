import React, { createContext, useContext, useEffect, useState } from 'react';
import { isOnlineMode, login as apiLogin, setToken } from '../utils/api.js';

const SESSION_KEY = 'orisma_session_v1';

const AuthContext = createContext(null);

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw && raw !== 'null') {
      const s = JSON.parse(raw);
      if (s && s.id && s.name && s.role) return s;
    }
  } catch {}
  return null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => loadSession());

  useEffect(() => {
    try {
      if (currentUser) {
        // Only store safe, non-sensitive session info
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role })
        );
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {}
  }, [currentUser]);

  const login = async (email, password) => {
    if (!isOnlineMode()) {
      return { error: 'Tidak dapat terhubung ke server. Pastikan backend berjalan dan coba lagi.' };
    }
    try {
      const res = await apiLogin(email, password);
      if (res.token) setToken(res.token);
      if (res.user) {
        setCurrentUser(res.user);
        return { ok: true };
      }
      return { error: 'Login gagal. Coba lagi.' };
    } catch (e) {
      return { error: e.message || 'Email atau password salah.' };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Full access — settings, data, reports' },
  { value: 'manager', label: 'Manager', desc: 'Inventory, sales, reports' },
  { value: 'staff', label: 'Staff', desc: 'Inventory & acquisition' },
  { value: 'sales', label: 'Sales', desc: 'Sales/POS only' },
];
