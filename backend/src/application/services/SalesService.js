// Application Service: Sales use-cases
import repo from "../../infrastructure/persistence/Repository.js";
import { createTransaction } from "../../domain/sales/Transaction.js";

export class SalesService {
  list() { return repo.findAllTransactions(); }

  record(unit, saleDetails, zakatRate) {
    const tx = createTransaction(unit, saleDetails, zakatRate);
    const txs = repo.findAllTransactions();
    // dedup by plate+soldDate+price
    const key = t => `${String(t.plate).toUpperCase().replace(/\s+/g,"")}|${t.soldDate}|${t.sellingPrice}`;
    const k = key(tx);
    if (txs.some(t => key(t) === k)) throw new Error("Transaksi duplikat");
    txs.unshift(tx);
    repo.saveTransactions(txs);
    // mark unit sold via inventory (side effect kept here for cohesion, could be event)
    const units = repo.findAllUnits();
    const u = units.find(x => String(x.id) === String(unit.id));
    if (u) { u.status = "sold"; if (tx.saleType === "tradein") u.saleType = "tradein"; repo.saveUnits(units); }
    return tx;
  }

  bulkImport(txs) {
    const existing = repo.findAllTransactions();
    const key = t => `${String(t.plate).toUpperCase().replace(/\s+/g,"")}|${t.soldDate}|${t.sellingPrice}`;
    const existingKeys = new Set(existing.map(key));
    const seen = new Set();
    let added = 0;
    for (const t of txs) {
      const k = key(t);
      if (existingKeys.has(k) || seen.has(k)) continue;
      seen.add(k);
      existing.push({ ...t, id: t.id || Date.now() + Math.floor(Math.random()*1000), zakatPaid: t.zakatPaid ?? (t.saleType === "tradein") });
      added++;
    }
    repo.saveTransactions(existing);
    return added;
  }

  toggleZakatPaid(id) {
    const txs = repo.findAllTransactions();
    const tx = txs.find(t => String(t.id) === String(id));
    if (!tx) throw new Error("Transaksi tidak ditemukan");
    tx.zakatPaid = !tx.zakatPaid;
    repo.saveTransactions(txs);
    return tx;
  }

  markAllPaid(ids) {
    const txs = repo.findAllTransactions();
    const set = new Set(ids.map(String));
    txs.forEach(t => { if (set.has(String(t.id))) t.zakatPaid = true; });
    repo.saveTransactions(txs);
    return txs.filter(t => set.has(String(t.id)));
  }
}

export default new SalesService();
