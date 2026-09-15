import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./presentation/routes/auth.js";
import unitsRoutes from "./presentation/routes/units.js";
import txRoutes from "./presentation/routes/transactions.js";
import accountsRoutes from "./presentation/routes/accounts.js";
import settingsRoutes from "./presentation/routes/settings.js";
import repo from "./infrastructure/persistence/Repository.js";
import bcrypt from "bcryptjs";

// seed defaults on boot
(function seed() {
  const data = repo.read();
  let changed = false;
  if (!data.units || data.units.length === 0) {
    data.units = [
      { id: 1, name: "Honda Vario 125", category: "honda", year: 2021, plate: "B 3311 FQ", unitPrice: 14500000, costUnit: 900000, additionalCost1: 130000, additionalCost2: 0, additionalCost3: 10000, ownerName: "Budi Santoso", ownerAddress: "Jl. Kenanga No. 12, Depok", notes: "Pajak hidup s.d. Mar 2027", dateAcquired: "2026-07-02", status: "available", acquisitionSource: "purchase" },
    ];
    changed = true;
  }
  if (!data.accounts || data.accounts.length === 0) {
    data.accounts = [
      { id: 1, name: "Admin", email: "admin@orisma.local", role: "admin", passwordHash: bcrypt.hashSync("admin", 10), createdAt: new Date().toISOString().slice(0,10) },
      { id: 2, name: "Staff Gudang", email: "staff@orisma.local", role: "staff", passwordHash: bcrypt.hashSync("staff", 10), createdAt: new Date().toISOString().slice(0,10) },
    ];
    changed = true;
  }
  if (!data.settings || Object.keys(data.settings).length === 0) {
    data.settings = { shopName: "Showroom Orisma", shopShortName: "Orisma", zakatRate: 2.5, tenagaDefault: 130000, komisiDefault: 0, lainDefault: 10000, language: "id", agingWarn: 30, agingCritical: 60 };
    changed = true;
  }
  // ensure hashes
  for (const acc of data.accounts) if (!acc.passwordHash) { acc.passwordHash = bcrypt.hashSync(acc.email.startsWith("admin") ? "admin" : "staff", 10); changed = true; }
  if (changed) repo.write(data);
})();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map(s => s.trim());

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get("/api", (req, res) => res.json({ name: "Orisma Backend (DDD+SOLID)", version: "2.0.0", endpoints: ["/api/auth/login","/api/units","/api/transactions","/api/accounts","/api/settings"] }));

app.use("/api/auth", authRoutes);
app.use("/api/units", unitsRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/settings", settingsRoutes);

// serve frontend dist if present (single deploy)
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Orisma backend (Clean/DDD/SOLID) live on http://localhost:${PORT}`);
  console.log(`CORS: ${CORS_ORIGIN.join(", ")}`);
});
