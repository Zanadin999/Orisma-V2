import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { signToken } from "../middleware.js";

const router = express.Router();

// init password hashes for seed accounts if empty
await db.read();
for (const acc of db.data.accounts) {
  if (!acc.passwordHash) {
    const plain = acc.email.startsWith("admin") ? "admin" : "staff";
    acc.passwordHash = await bcrypt.hash(plain, 10);
  }
}
await db.write();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  await db.read();
  const acc = db.data.accounts.find(a => a.email.toLowerCase() === String(email).toLowerCase());
  if (!acc) return res.status(401).json({ error: "Email atau password salah" });
  const ok = await bcrypt.compare(String(password), acc.passwordHash);
  if (!ok) return res.status(401).json({ error: "Email atau password salah" });
  const token = signToken({ id: acc.id, email: acc.email, role: acc.role, name: acc.name });
  res.json({ token, user: { id: acc.id, name: acc.name, email: acc.email, role: acc.role } });
});

// POST /api/auth/register (admin only - but open for initial setup, protected by existing token later)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Nama, email, password wajib" });
  await db.read();
  if (db.data.accounts.some(a => a.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(400).json({ error: "Email sudah terdaftar" });
  }
  const hash = await bcrypt.hash(String(password), 10);
  const acc = { id: Date.now(), name: String(name).trim(), email: String(email).trim().toLowerCase(), role: role || "staff", passwordHash: hash, createdAt: new Date().toISOString().slice(0,10) };
  db.data.accounts.push(acc);
  await db.write();
  res.json({ id: acc.id, name: acc.name, email: acc.email, role: acc.role });
});

export default router;
