import express from 'express';
import { authMiddleware, requireRole } from '../../infrastructure/auth/middleware.js';

/** @param {import('../../application/services/AuthService.js').AuthService} authService */
export default function makeAccountsRoutes(authService) {
  const router = express.Router();
  router.use(authMiddleware);

  router.get('/', (req, res) => {
    res.json(authService.list());
  });

  router.post('/', requireRole('admin'), async (req, res) => {
    try {
      res.json(await authService.register(req.body));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.put('/:id', requireRole('admin'), (req, res) => {
    try {
      res.json(authService.update(req.params.id, req.body));
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });

  router.delete('/:id', requireRole('admin'), (req, res) => {
    try {
      res.json({ deleted: authService.remove(req.params.id) });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
}
