import express from "express";
import repo from "../../infrastructure/persistence/Repository.js";
import { authMiddleware } from "../../infrastructure/auth/middleware.js";
const router = express.Router();
router.get("/", (req, res) => res.json(repo.getSettings()));
router.put("/", authMiddleware, (req, res) => {
  const current = repo.getSettings();
  const next = { ...current, ...req.body };
  repo.saveSettings(next);
  res.json(next);
});
export default router;
