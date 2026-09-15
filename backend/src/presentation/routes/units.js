import express from "express";
import InventoryService from "../../application/services/InventoryService.js";
import { authMiddleware } from "../../infrastructure/auth/middleware.js";
const router = express.Router();
router.use(authMiddleware);
router.get("/", (req, res) => res.json(InventoryService.list()));
router.post("/", (req, res) => {
  try {
    const payload = req.body;
    const units = Array.isArray(payload) ? payload : [payload];
    if (Array.isArray(payload)) {
      const added = InventoryService.bulkImport(units);
      res.json({ added, units: InventoryService.list().slice(-added) });
    } else {
      const unit = InventoryService.add(payload);
      res.json(unit);
    }
  } catch (e) { res.status(400).json({ error: e.message }); }
});
router.post("/import/bulk", (req, res) => {
  try {
    const { units = [], transactions = [] } = req.body || {};
    const addedUnits = InventoryService.bulkImport(units);
    // transactions handled by sales route, but accept here for atomicity
    res.json({ addedUnits, addedTransactions: 0 });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
router.put("/:id", (req, res) => {
  try { res.json(InventoryService.update(req.params.id, req.body)); } catch (e) { res.status(404).json({ error: e.message }); }
});
router.delete("/:id", (req, res) => {
  const deleted = InventoryService.remove(req.params.id);
  res.json({ deleted });
});
export default router;
