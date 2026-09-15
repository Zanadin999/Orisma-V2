import express from "express";
import AuthService from "../../application/services/AuthService.js";
const router = express.Router();
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (e) { res.status(401).json({ error: e.message }); }
});
router.post("/register", async (req, res) => {
  try {
    const acc = await AuthService.register(req.body || {});
    res.json(acc);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
export default router;
