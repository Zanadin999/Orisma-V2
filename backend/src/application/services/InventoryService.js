// Application Service: Inventory use-cases (SRP - only inventory logic)
// Depends on IRepository port — injected via constructor (DIP)
import { createUnit } from '../../domain/inventory/Unit.js';
import { normalizePlate } from '../../domain/inventory/Plate.js';

export class InventoryService {
  /** @param {import('../../domain/ports/IRepository.js').IRepository} repo */
  constructor(repo) {
    this.repo = repo;
  }

  list() {
    return this.repo.findAllUnits();
  }

  add(data) {
    const unit = createUnit(data);
    const units = this.repo.findAllUnits();
    const norm = normalizePlate(unit.plate);
    if (units.some(u => normalizePlate(u.plate) === norm)) {
      throw new Error('NOPOL sudah ada');
    }
    units.push(unit);
    this.repo.saveUnits(units);
    return unit;
  }

  update(id, patch) {
    const units = this.repo.findAllUnits();
    const idx = units.findIndex(u => String(u.id) === String(id));
    if (idx === -1) throw new Error('Unit tidak ditemukan');
    units[idx] = { ...units[idx], ...patch, id: units[idx].id };
    this.repo.saveUnits(units);
    return units[idx];
  }

  remove(id) {
    const units = this.repo.findAllUnits();
    const before = units.length;
    const filtered = units.filter(u => String(u.id) !== String(id));
    this.repo.saveUnits(filtered);
    return before - filtered.length;
  }

  bulkImport(incoming) {
    const units = this.repo.findAllUnits();
    const existing = new Set(units.map(u => normalizePlate(u.plate)));
    const seen = new Set();
    let added = 0;
    for (const raw of incoming) {
      const norm = normalizePlate(raw.plate);
      if (!norm || existing.has(norm) || seen.has(norm)) continue;
      seen.add(norm);
      const unit = createUnit(raw);
      units.push(unit);
      added++;
    }
    this.repo.saveUnits(units);
    return added;
  }

  markSold(id, saleType = 'sold', notes) {
    const units = this.repo.findAllUnits();
    const unit = units.find(u => String(u.id) === String(id));
    if (!unit) throw new Error('Unit tidak ditemukan');
    unit.status = 'sold';
    if (saleType) unit.saleType = saleType;
    if (notes) unit.notes = notes;
    this.repo.saveUnits(units);
    return unit;
  }
}
