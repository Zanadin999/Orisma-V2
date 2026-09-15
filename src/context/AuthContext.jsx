import React, { createContext, useContext, useEffect, useState } from "react";
import { isOnlineMode, login as apiLogin, setToken } from "../utils/api.js";

const ACCOUNTS_KEY = "orisma_accounts_v1";
const SESSION_KEY = "orisma_session_v1";

const DEFAULT_ACCOUNTS = [
  { id: 1, name: "Admin", email: "admin@orisma.local", role: "admin", password: "admin", createdAt: new Date().toISOString().slice(0,10) },
  { id: 2, name: "Staff Gudang", email: "staff@orisma.local", role: "staff", password: "staff", createdAt: new Date().toISOString().slice(0,10) },
];

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length) return p; }
  } catch {}
  return [...DEFAULT_ACCOUNTS];
}
function loadSession(accounts) {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.id) {
        const found = accounts.find(a => String(a.id) === String(s.id));
        if (found) return found;
      }
      // if session explicitly null, stay logged out
      if (raw === "null" || raw === "\"null\"") return null;
    }
  } catch {}
  return null;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => loadAccounts());
  const [currentUser, setCurrentUser] = useState(() => loadSession(loadAccounts()));

  useEffect(() => { try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch {} }, [accounts]);
  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify({ id: currentUser.id }));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, [currentUser]);

  const addAccount = ({ name, email, role, password }) => {
    const acc = { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), role, password, createdAt: new Date().toISOString().slice(0,10) };
    setAccounts(prev => [...prev, acc]);
    return acc;
  };
  const updateAccount = (id, patch) => {
    setAccounts(prev => prev.map(a => String(a.id) === String(id) ? { ...a, ...patch } : a));
    if (currentUser && String(currentUser.id) === String(id)) setCurrentUser(c => ({ ...c, ...patch }));
  };
  const deleteAccount = (id) => {
    if (accounts.length <= 1) return { error: "Keep at least one account." };
    setAccounts(prev => prev.filter(a => String(a.id) !== String(id)));
    if (currentUser && String(currentUser.id) === String(id)) {
      const remaining = accounts.filter(a => String(a.id) !== String(id));
      setCurrentUser(remaining[0] || null);
    }
    return { ok: true };
  };
  const login = async (email, password) => {
    // Online: try backend first
    if (isOnlineMode()) {
      try {
        const res = await apiLogin(email, password);
        if (res.token) setToken(res.token);
        if (res.user) { setCurrentUser(res.user); return { ok: true }; }
      } catch (e) {
        // fallback to local
      }
    }
    const found = accounts.find(a => a.email.toLowerCase() === String(email).toLowerCase() && a.password === String(password));
    if (found) { setCurrentUser(found); return { ok: true }; }
    return { error: "Email atau password salah." };
  };
  const logout = () => { setToken(null); setCurrentUser(null); };
  const switchUser = (id) => {
    const found = accounts.find(a => String(a.id) === String(id));
    if (found) setCurrentUser(found);
  };

  return (
    <AuthContext.Provider value={{ accounts, currentUser, addAccount, updateAccount, deleteAccount, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export const ROLES = [
  { value: "admin", label: "Admin", desc: "Full access — settings, data, reports" },
  { value: "manager", label: "Manager", desc: "Inventory, sales, reports" },
  { value: "staff", label: "Staff", desc: "Inventory & acquisition" },
  { value: "sales", label: "Sales", desc: "Sales/POS only" },
];
