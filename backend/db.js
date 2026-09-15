import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.DB_FILE || join(__dirname, "data.json");

// ensure data file exists
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ units: [], transactions: [], accounts: [], settings: {} }, null, 2));
}

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { units: [], transactions: [], accounts: [], settings: {} });

await db.read();
db.data ||= { units: [], transactions: [], accounts: [], settings: {} };

// seed defaults if empty (migrated from frontend seed)
if (db.data.units.length === 0) {
  const seedUnits = [
    { id: 1, name: "Honda Vario 125", category: "honda", year: 2021, plate: "B 3311 FQ", unitPrice: 14500000, costUnit: 900000, additionalCost1: 130000, additionalCost2: 0, additionalCost3: 10000, ownerName: "Budi Santoso", ownerAddress: "Jl. Kenanga No. 12, Depok", notes: "Pajak hidup s.d. Mar 2027", dateAcquired: "2026-07-02", status: "available", acquisitionSource: "purchase" },
    { id: 2, name: "Yamaha NMAX 155", category: "yamaha", year: 2020, plate: "B 4482 KL", unitPrice: 21000000, costUnit: 1500000, additionalCost1: 130000, additionalCost2: 0, additionalCost3: 10000, ownerName: "Siti Herawati", ownerAddress: "Jl. Anggrek Raya No. 8, Depok", notes: "Ban baru", dateAcquired: "2026-06-18", status: "available", acquisitionSource: "purchase" },
    { id: 3, name: "Honda Beat Street", category: "honda", year: 2019, plate: "B 1290 ZR", unitPrice: 9800000, costUnit: 600000, additionalCost1: 130000, additionalCost2: 0, additionalCost3: 10000, ownerName: "Agus Wijaya", ownerAddress: "Jl. Mawar No. 3, Sawangan", notes: "", dateAcquired: "2026-05-25", status: "available", acquisitionSource: "purchase" },
  ];
  db.data.units = seedUnits;
}
if (db.data.accounts.length === 0) {
  // password = bcrypt hash of "admin" / "staff" will be set on first auth init
  db.data.accounts = [
    { id: 1, name: "Admin", email: "admin@orisma.local", role: "admin", passwordHash: "", createdAt: new Date().toISOString().slice(0,10) },
    { id: 2, name: "Staff Gudang", email: "staff@orisma.local", role: "staff", passwordHash: "", createdAt: new Date().toISOString().slice(0,10) },
  ];
}
if (!db.data.settings || Object.keys(db.data.settings).length === 0) {
  db.data.settings = {
    shopName: "Showroom Orisma",
    shopShortName: "Orisma",
    zakatRate: 2.5,
    tenagaDefault: 130000,
    komisiDefault: 0,
    lainDefault: 10000,
    language: "id",
    agingWarn: 30,
    agingCritical: 60,
  };
}
await db.write();

export default db;
