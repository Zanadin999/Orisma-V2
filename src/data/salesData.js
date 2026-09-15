import { INITIAL_UNITS } from "./unitsData";
import { minPrice, saleMath } from "../utils/pricing";

function buildSeedSale(id, unit, sellingPrice, buyerName, buyerAddress, notes, soldDate) {
  const math = saleMath(unit, sellingPrice);
  return {
    id,
    unitId: unit.id,
    name: unit.name,
    category: unit.category,
    plate: unit.plate,
    year: unit.year,
    unitPrice: unit.unitPrice,
    costUnit: unit.costUnit,
    additionalCost: unit.additionalCost,
    minPrice: minPrice(unit),
    sellingPrice,
    buyerName,
    buyerAddress,
    notes,
    soldDate,
    ...math,
  };
}

const unitByPlate = plate => INITIAL_UNITS.find(u => u.plate === plate);

// Fictional seed data, one sale per already-"sold" unit in unitsData.js.
export const INITIAL_SALES = [
  buildSeedSale(1, unitByPlate("B 7765 QW"), 13800000, "Hendra Gunawan", "Jl. Flamboyan No. 4, Depok", "Lunas tunai", "2026-05-02"),
  buildSeedSale(2, unitByPlate("B 5521 XD"), 33000000, "Andi Prasetyo", "Jl. Teratai No. 15, Sawangan", "DP + cicilan showroom", "2026-03-20"),
  buildSeedSale(3, unitByPlate("B 2200 LM"), 15600000, "Wawan Setiadi", "Jl. Kamboja No. 2, Depok", "Tukar tambah", "2026-03-01"),
];
