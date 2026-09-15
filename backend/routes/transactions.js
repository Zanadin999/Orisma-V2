import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware.js";

const router = express.Router();
router.use(authMiddleware);

// GET /api/transactions
router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.transactions);
});

// POST /api/transactions
router.post("/", async (req, res) => {
  await db.read();
  const tx = req.body;
  if (!tx.plate || !tx.soldDate) return res.status(400).json({ error: "Missing fields" });
  // dedup
  const key = t => `${String(t.plate||"").toUpperCase().replace(/\s+/g,"")}|${t.soldDate}|${t.sellingPrice}`;
  const k = key(tx);
  if (db.data.transactions.some(t => key(t) === k)) return res.status(400).json({ error: "Duplicate transaction" });
  const withId = { ...tx, id: Date.now() };
  db.data.transactions.unshift(withId);
  // also mark unit as sold if not already
  const unit = db.data.units.find(u => String(u.id) === String(tx.unitId) || String(u.plate).toUpperCase().replace(/\s+/g,"") === String(tx.plate).toUpperCase().replace(/\s+/g,""));
  if (unit) { unit.status = "sold"; if (tx.saleType === "tradein") unit.saleType = "tradein"; }
  await db.write();
  res.json(withId);
});

// PATCH /api/transactions/:id
router.patch("/:id", async (req, res) => {
  await db.read();
  const idx = db.data.transactions.findIndex(t => String(t.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.data.transactions[idx] = { ...db.data.transactions[idx], ...req.body };
  await db.write();
  res.json(db.data.transactions[idx]);
});

// POST /api/transactions/bulk - import
router.post("/bulk", async (req, res) => {
  const txs = Array.isArray(req.body) ? req.body : req.body.transactions || [];
  await db.read();
  const key = t => `${String(t.plate||"").toUpperCase().replace(/\s+/g,"")}|${t.soldDate}|${t.sellingPrice}`;
  const existing = new Set(db.data.transactions.map(key));
  const seen = new Set();
  let added = 0;
  for (const t of txs) {
    const k = key(t);
    if (existing.has(k) || seen.has(k)) continue;
    seen.add(k);
    db.data.transactions.push({ ...t, id: t.id || Date.now() + Math.floor(Math.random()*1000) });
    added++;
  }
  await db.write();
  res.json({ added });
});

export default router;
