import express from 'express';

/** @param {import('../../application/services/AuthService.js').AuthService} authService */
export default function makeAuthRoutes(authService) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const result = await authService.login(email, password);
      res.json(result);
    } catch (e) {
      res.status(401).json({ error: e.message });
    }
  });

  router.post('/register', async (req, res) => {
    try {
      const acc = await authService.register(req.body || {});
      res.json(acc);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
}
