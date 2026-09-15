// Application Service: Inventory use-cases (SRP - only inventory logic)
import { createUnit } from "../../domain/inventory/Unit.js";
import { normalizePlate } from "../../domain/inventory/Plate.js";
import repo from "../../infrastructure/persistence/Repository.js";

export class InventoryService {
  list() {
    return repo.findAllUnits();
  }

  add(data) {
    const unit = createUnit(data);
    const units = repo.findAllUnits();
    const norm = normalizePlate(unit.plate);
    if (units.some(u => normalizePlate(u.plate) === norm)) throw new Error("NOPOL sudah ada");
    units.push(unit);
    repo.saveUnits(units);
    return unit;
  }

  update(id, patch) {
    const units = repo.findAllUnits();
    const idx = units.findIndex(u => String(u.id) === String(id));
    if (idx === -1) throw new Error("Unit tidak ditemukan");
    units[idx] = { ...units[idx], ...patch, id: units[idx].id };
    repo.saveUnits(units);
    return units[idx];
  }

  remove(id) {
    const units = repo.findAllUnits();
    const before = units.length;
    const filtered = units.filter(u => String(u.id) !== String(id));
    repo.saveUnits(filtered);
    return before - filtered.length;
  }

  bulkImport(incoming) {
    const units = repo.findAllUnits();
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
    repo.saveUnits(units);
    return added;
  }

  markSold(id, saleType = "sold", notes) {
    const units = repo.findAllUnits();
    const unit = units.find(u => String(u.id) === String(id));
    if (!unit) throw new Error("Unit tidak ditemukan");
    unit.status = "sold";
    if (saleType) unit.saleType = saleType;
    if (notes) unit.notes = notes;
    repo.saveUnits(units);
    return unit;
  }
}

export default new InventoryService();
