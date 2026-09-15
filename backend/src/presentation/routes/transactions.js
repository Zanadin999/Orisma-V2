import express from "express";
import SalesService from "../../application/services/SalesService.js";
import { authMiddleware } from "../../infrastructure/auth/middleware.js";
const router = express.Router();
router.use(authMiddleware);
router.get("/", (req, res) => res.json(SalesService.list()));
router.post("/", (req, res) => {
  try {
    // expects { unit, saleDetails, zakatRate }
    const { unit, saleDetails, zakatRate } = req.body;
    if (!unit || !saleDetails) return res.status(400).json({ error: "Missing unit/saleDetails" });
    const tx = SalesService.record(unit, saleDetails, zakatRate);
    res.json(tx);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
router.patch("/:id", (req, res) => {
  try { res.json(SalesService.toggleZakatPaid(req.params.id)); } catch (e) { res.status(404).json({ error: e.message }); }
});
router.post("/bulk", (req, res) => {
  const txs = Array.isArray(req.body) ? req.body : req.body.transactions || [];
  const added = SalesService.bulkImport(txs);
  res.json({ added });
});
router.post("/mark-paid", (req, res) => {
  const { ids } = req.body || {};
  const updated = SalesService.markAllPaid(ids || []);
  res.json({ updated: updated.length });
});
export default router;
