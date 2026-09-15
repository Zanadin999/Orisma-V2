import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware.js";

const router = express.Router();
router.use(authMiddleware);

// GET /api/units
router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.units);
});

// POST /api/units (single) or bulk import
router.post("/", async (req, res) => {
  const payload = req.body;
  await db.read();
  const units = Array.isArray(payload) ? payload : [payload];
  const normalize = p => String(p.plate||"").toUpperCase().replace(/\s+/g,"");
  const existing = new Set(db.data.units.map(u => normalize(u.plate)));
  const added = [];
  for (const u of units) {
    if (!u.plate || !u.name) continue;
    const norm = normalize(u.plate);
    if (existing.has(norm)) continue;
    const unit = { ...u, id: u.id ?? Date.now() + Math.floor(Math.random()*1000) };
    db.data.units.push(unit);
    added.push(unit);
    existing.add(norm);
  }
  await db.write();
  res.json({ added: added.length, units: added });
});

// PUT /api/units/:id
router.put("/:id", async (req, res) => {
  await db.read();
  const id = isNaN(req.params.id) ? req.params.id : Number(req.params.id);
  const idx = db.data.units.findIndex(u => String(u.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.data.units[idx] = { ...db.data.units[idx], ...req.body, id: db.data.units[idx].id };
  await db.write();
  res.json(db.data.units[idx]);
});

// DELETE /api/units/:id
router.delete("/:id", async (req, res) => {
  await db.read();
  const id = req.params.id;
  const before = db.data.units.length;
  db.data.units = db.data.units.filter(u => String(u.id) !== String(id));
  await db.write();
  res.json({ deleted: before - db.data.units.length });
});

// POST /api/units/import/bulk - expects { units: [], transactions: [] } for atomic import
router.post("/import/bulk", async (req, res) => {
  const { units = [], transactions = [] } = req.body || {};
  await db.read();
  const normalize = p => String(p.plate||"").toUpperCase().replace(/\s+/g,"");
  const existingPlates = new Set(db.data.units.map(u => normalize(u.plate)));
  const seen = new Set();
  let addedUnits = 0;
  for (const u of units) {
    const norm = normalize(u.plate);
    if (!norm || existingPlates.has(norm) || seen.has(norm)) continue;
    seen.add(norm);
    db.data.units.push(u);
    addedUnits++;
  }
  // transactions dedup by plate+soldDate+price
  const key = t => `${String(t.plate||"").toUpperCase().replace(/\s+/g,"")}|${t.soldDate}|${t.sellingPrice}`;
  const existingTxKeys = new Set(db.data.transactions.map(key));
  const seenTx = new Set();
  let addedTx = 0;
  for (const t of transactions) {
    const k = key(t);
    if (existingTxKeys.has(k) || seenTx.has(k)) continue;
    seenTx.add(k);
    db.data.transactions.push(t);
    addedTx++;
  }
  await db.write();
  res.json({ addedUnits, addedTransactions: addedTx });
});

export default router;
