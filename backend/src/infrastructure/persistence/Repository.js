// Infrastructure: JSON file repository (SRP - single persistence concern)
// Implements repository ports for Unit, Transaction, Account, Settings

import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = process.env.DB_FILE || join(__dirname, "../../../data.json");

function ensureFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ units: [], transactions: [], accounts: [], settings: {} }, null, 2));
  }
}

export class JsonRepository {
  constructor() {
    ensureFile();
  }

  read() {
    ensureFile();
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    data.units ||= [];
    data.transactions ||= [];
    data.accounts ||= [];
    data.settings ||= {};
    return data;
  }

  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  // Unit port
  findAllUnits() { return this.read().units; }
  saveUnits(units) { const data = this.read(); data.units = units; this.write(data); }

  // Transaction port
  findAllTransactions() { return this.read().transactions; }
  saveTransactions(txs) { const data = this.read(); data.transactions = txs; this.write(data); }

  // Account port
  findAllAccounts() { return this.read().accounts; }
  saveAccounts(accounts) { const data = this.read(); data.accounts = accounts; this.write(data); }

  // Settings port
  getSettings() { return this.read().settings; }
  saveSettings(settings) { const data = this.read(); data.settings = settings; this.write(data); }
}

export default new JsonRepository();
