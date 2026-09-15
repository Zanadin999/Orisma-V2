import express from "express";
import AuthService from "../../application/services/AuthService.js";
import { authMiddleware, requireRole } from "../../infrastructure/auth/middleware.js";
const router = express.Router();
router.use(authMiddleware);
router.get("/", (req, res) => res.json(AuthService.list()));
router.post("/", requireRole("admin"), async (req, res) => {
  try { res.json(await AuthService.register(req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
router.put("/:id", requireRole("admin"), (req, res) => {
  try { res.json(AuthService.update(req.params.id, req.body)); } catch (e) { res.status(404).json({ error: e.message }); }
});
router.delete("/:id", requireRole("admin"), (req, res) => {
  try { res.json({ deleted: AuthService.remove(req.params.id) }); } catch (e) { res.status(400).json({ error: e.message }); }
});
export default router;
