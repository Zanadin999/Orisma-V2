import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import db from "./db.js";
import authRoutes from "./routes/auth.js";
import unitsRoutes from "./routes/units.js";
import txRoutes from "./routes/transactions.js";
import accountsRoutes from "./routes/accounts.js";
import settingsRoutes from "./routes/settings.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map(s => s.trim());

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// health
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get("/api", (req, res) => res.json({ name: "Orisma Backend", version: "1.0.0", endpoints: ["/api/auth/login","/api/units","/api/transactions","/api/accounts","/api/settings"] }));

app.use("/api/auth", authRoutes);
app.use("/api/units", unitsRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/settings", settingsRoutes);

// serve frontend build if present (for single deploy)
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Orisma backend live on http://localhost:${PORT}`);
  console.log(`CORS: ${CORS_ORIGIN.join(", ")}`);
});
