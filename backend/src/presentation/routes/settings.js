import express from 'express';
import { authMiddleware } from '../../infrastructure/auth/middleware.js';

/** @param {import('../../infrastructure/persistence/Repository.js').JsonRepository} repo */
export default function makeSettingsRoutes(repo) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(repo.getSettings());
  });

  router.put('/', authMiddleware, (req, res) => {
    const current = repo.getSettings();
    const next = { ...current, ...req.body };
    repo.saveSettings(next);
    res.json(next);
  });

  return router;
}
