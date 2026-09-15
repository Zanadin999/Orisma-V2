import express from "express";
import db from "../db.js";
import { authMiddleware, requireRole } from "../middleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();
router.use(authMiddleware);

// GET /api/accounts
router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.accounts.map(({ passwordHash, ...rest }) => rest));
});

// POST /api/accounts
router.post("/", requireRole("admin"), async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Required fields" });
  await db.read();
  if (db.data.accounts.some(a => a.email.toLowerCase() === String(email).toLowerCase())) return res.status(400).json({ error: "Email exists" });
  const acc = { id: Date.now(), name: String(name).trim(), email: String(email).toLowerCase(), role: role || "staff", passwordHash: await bcrypt.hash(String(password), 10), createdAt: new Date().toISOString().slice(0,10) };
  db.data.accounts.push(acc);
  await db.write();
  const { passwordHash, ...safe } = acc;
  res.json(safe);
});

// PUT /api/accounts/:id
router.put("/:id", requireRole("admin"), async (req, res) => {
  await db.read();
  const idx = db.data.accounts.findIndex(a => String(a.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { name, email, role, password } = req.body || {};
  if (name) db.data.accounts[idx].name = String(name).trim();
  if (email) db.data.accounts[idx].email = String(email).toLowerCase();
  if (role) db.data.accounts[idx].role = role;
  if (password) db.data.accounts[idx].passwordHash = await bcrypt.hash(String(password), 10);
  await db.write();
  const { passwordHash, ...safe } = db.data.accounts[idx];
  res.json(safe);
});

// DELETE /api/accounts/:id
router.delete("/:id", requireRole("admin"), async (req, res) => {
  await db.read();
  if (db.data.accounts.length <= 1) return res.status(400).json({ error: "Keep at least one account" });
  const before = db.data.accounts.length;
  db.data.accounts = db.data.accounts.filter(a => String(a.id) !== String(req.params.id));
  await db.write();
  res.json({ deleted: before - db.data.accounts.length });
});

export default router;
