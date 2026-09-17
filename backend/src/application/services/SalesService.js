// Application Service: Sales use-cases
// Depends on IRepository port — injected via constructor (DIP)
// Bridges Inventory→Sales contexts: computes costBasis here, passes it into Transaction
import { createTransaction } from '../../domain/sales/Transaction.js';
import { costBasis } from '../../domain/inventory/Unit.js';

export class SalesService {
  /** @param {import('../../domain/ports/IRepository.js').IRepository} repo */
  constructor(repo) {
    this.repo = repo;
  }

  list() {
    return this.repo.findAllTransactions();
  }

  record(unit, saleDetails, zakatRate) {
    // Bridge context: compute cost here in application layer, not inside Transaction domain
    const cost = costBasis(unit);
    const tx = createTransaction(unit, saleDetails, zakatRate, cost);
    const txs = this.repo.findAllTransactions();
    // dedup by plate+soldDate+price
    const key = t => `${String(t.plate).toUpperCase().replace(/\s+/g, '')}|${t.soldDate}|${t.sellingPrice}`;
    const k = key(tx);
    if (txs.some(t => key(t) === k)) throw new Error('Transaksi duplikat');
    txs.unshift(tx);
    this.repo.saveTransactions(txs);
    // mark unit sold (side effect kept in application layer — could be a domain event later)
    const units = this.repo.findAllUnits();
    const u = units.find(x => String(x.id) === String(unit.id));
    if (u) {
      u.status = 'sold';
      if (tx.saleType === 'tradein') u.saleType = 'tradein';
      this.repo.saveUnits(units);
    }
    return tx;
  }

  bulkImport(txs) {
    const existing = this.repo.findAllTransactions();
    const key = t => `${String(t.plate).toUpperCase().replace(/\s+/g, '')}|${t.soldDate}|${t.sellingPrice}`;
    const existingKeys = new Set(existing.map(key));
    const seen = new Set();
    let added = 0;
    for (const t of txs) {
      const k = key(t);
      if (existingKeys.has(k) || seen.has(k)) continue;
      seen.add(k);
      existing.push({
        ...t,
        id: t.id || Date.now() + Math.floor(Math.random() * 1000),
        zakatPaid: t.zakatPaid ?? (t.saleType === 'tradein'),
      });
      added++;
    }
    this.repo.saveTransactions(existing);
    return added;
  }

  toggleZakatPaid(id) {
    const txs = this.repo.findAllTransactions();
    const tx = txs.find(t => String(t.id) === String(id));
    if (!tx) throw new Error('Transaksi tidak ditemukan');
    tx.zakatPaid = !tx.zakatPaid;
    this.repo.saveTransactions(txs);
    return tx;
  }

  markAllPaid(ids) {
    const txs = this.repo.findAllTransactions();
    const set = new Set(ids.map(String));
    txs.forEach(t => { if (set.has(String(t.id))) t.zakatPaid = true; });
    this.repo.saveTransactions(txs);
    return txs.filter(t => set.has(String(t.id)));
  }
}
