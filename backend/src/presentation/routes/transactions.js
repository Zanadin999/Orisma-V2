import express from 'express';
import { authMiddleware } from '../../infrastructure/auth/middleware.js';

/** @param {import('../../application/services/SalesService.js').SalesService} salesService */
export default function makeTxRoutes(salesService) {
  const router = express.Router();
  router.use(authMiddleware);

  router.get('/', (req, res) => {
    res.json(salesService.list());
  });

  router.post('/', (req, res) => {
    try {
      const { unit, saleDetails, zakatRate } = req.body;
      if (!unit || !saleDetails) {
        return res.status(400).json({ error: 'Missing unit/saleDetails' });
      }
      const tx = salesService.record(unit, saleDetails, zakatRate);
      res.json(tx);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.patch('/:id', (req, res) => {
    try {
      res.json(salesService.toggleZakatPaid(req.params.id));
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });

  router.post('/bulk', (req, res) => {
    const txs = Array.isArray(req.body) ? req.body : req.body.transactions || [];
    const added = salesService.bulkImport(txs);
    res.json({ added });
  });

  router.post('/mark-paid', (req, res) => {
    const { ids } = req.body || {};
    const updated = salesService.markAllPaid(ids || []);
    res.json({ updated: updated.length });
  });

  return router;
}
