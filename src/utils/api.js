const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export function isOnlineMode() {
  return !!API_URL;
}

export function getApiUrl() {
  return API_URL;
}

function getToken() {
  try { return localStorage.getItem("orisma_token"); } catch { return null; }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem("orisma_token", token);
    else localStorage.removeItem("orisma_token");
  } catch {}
}

export async function apiFetch(path, opts = {}) {
  if (!API_URL) throw new Error("API not configured (VITE_API_URL missing)");
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(data.error || `API ${res.status}`);
  return data;
}

// Auth
export function login(email, password) {
  return apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}
export function register(data) {
  return apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
}

// Units
export function fetchUnits() { return apiFetch("/api/units"); }
export function createUnit(unit) { return apiFetch("/api/units", { method: "POST", body: JSON.stringify(unit) }); }
export function importUnitsBulk(units, transactions) {
  return apiFetch("/api/units/import/bulk", { method: "POST", body: JSON.stringify({ units, transactions }) });
}

// Transactions
export function fetchTransactions() { return apiFetch("/api/transactions"); }
export function createTransaction(payload) { return apiFetch("/api/transactions", { method: "POST", body: JSON.stringify(payload) }); }

// Accounts
export function fetchAccounts() { return apiFetch("/api/accounts"); }

// Settings
export function fetchSettings() { return apiFetch("/api/settings"); }
export function saveSettings(settings) { return apiFetch("/api/settings", { method: "PUT", body: JSON.stringify(settings) }); }
