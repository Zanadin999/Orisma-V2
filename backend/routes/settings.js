import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware.js";

const router = express.Router();

// GET /api/settings
router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.settings || {});
});

// PUT /api/settings (any authenticated user for now, could restrict to admin)
router.put("/", authMiddleware, async (req, res) => {
  await db.read();
  db.data.settings = { ...db.data.settings, ...req.body };
  await db.write();
  res.json(db.data.settings);
});

export default router;
