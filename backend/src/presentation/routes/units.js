import express from 'express';
import { authMiddleware } from '../../infrastructure/auth/middleware.js';

/** @param {import('../../application/services/InventoryService.js').InventoryService} inventoryService */
export default function makeUnitsRoutes(inventoryService) {
  const router = express.Router();
  router.use(authMiddleware);

  router.get('/', (req, res) => {
    res.json(inventoryService.list());
  });

  router.post('/', (req, res) => {
    try {
      const payload = req.body;
      if (Array.isArray(payload)) {
        const added = inventoryService.bulkImport(payload);
        res.json({ added, units: inventoryService.list().slice(-added) });
      } else {
        const unit = inventoryService.add(payload);
        res.json(unit);
      }
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/import/bulk', (req, res) => {
    try {
      const { units = [], transactions = [] } = req.body || {};
      const addedUnits = inventoryService.bulkImport(units);
      // Note: transactions are handled via /api/transactions/bulk
      // They are accepted here for client convenience but should be sent separately
      res.json({ addedUnits, addedTransactions: transactions.length > 0 ? 'send to /api/transactions/bulk' : 0 });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.put('/:id', (req, res) => {
    try {
      res.json(inventoryService.update(req.params.id, req.body));
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });

  router.delete('/:id', (req, res) => {
    const deleted = inventoryService.remove(req.params.id);
    res.json({ deleted });
  });

  return router;
}
