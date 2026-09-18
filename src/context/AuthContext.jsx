import React, { createContext, useContext, useEffect, useState } from 'react';
import { isOnlineMode, login as apiLogin, setToken } from '../utils/api.js';

const SESSION_KEY = 'orisma_session_v1';
const ACCOUNTS_KEY = 'orisma_accounts_v1';

export const DEFAULT_ACCOUNTS = [
  { id: 1, name: "Administrator", email: "admin@orisma.local", role: "admin", password: "admin", createdAt: "2026-01-01" },
  { id: 2, name: "Showroom Manager", email: "manager@orisma.local", role: "manager", password: "manager", createdAt: "2026-01-01" },
  { id: 3, name: "Staff Member", email: "staff@orisma.local", role: "staff", password: "staff", createdAt: "2026-01-01" },
  { id: 4, name: "Sales Exec", email: "sales@orisma.local", role: "sales", password: "sales", createdAt: "2026-01-01" },
];

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ACCOUNTS;
}

function loadSession(accounts) {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw && raw !== 'null') {
      const s = JSON.parse(raw);
      if (s && s.id) {
        const found = accounts.find(a => a.id === s.id || a.email === s.email);
        if (found) return found;
      }
    }
  } catch {}
  return accounts[0] || DEFAULT_ACCOUNTS[0];
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => loadAccounts());
  const [currentUser, setCurrentUser] = useState(() => loadSession(loadAccounts()));

  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  useEffect(() => {
    try {
      if (currentUser) {
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
    if (isOnlineMode()) {
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
    }

    // Local / Offline mode fallback
    const acc = accounts.find(
      a => a.email.toLowerCase() === (email || "").trim().toLowerCase() && a.password === password
    );
    if (acc) {
      setCurrentUser(acc);
      return { ok: true };
    }
    return { error: 'Email atau password salah.' };
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  const addAccount = (data) => {
    const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
    const newAcc = {
      id: newId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role || "staff",
      password: data.password || "123456",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAccounts(prev => [...prev, newAcc]);
    return newAcc;
  };

  const updateAccount = (id, patch) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...patch }));
    }
  };

  const deleteAccount = (id) => {
    if (accounts.length <= 1) {
      return { error: "Tidak dapat menghapus akun terakhir." };
    }
    if (currentUser && currentUser.id === id) {
      return { error: "Tidak dapat menghapus akun yang sedang aktif." };
    }
    setAccounts(prev => prev.filter(a => a.id !== id));
    return { ok: true };
  };

  const switchUser = (userId) => {
    const target = accounts.find(a => a.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts,
        login,
        logout,
        addAccount,
        updateAccount,
        deleteAccount,
        switchUser,
      }}
    >
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
