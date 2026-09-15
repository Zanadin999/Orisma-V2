// Domain Entity: Transaction (Sales context)
import { costBasis } from "../inventory/Unit.js";

export function calcSaleMath(unit, sellingPrice, zakatRate = 0.025) {
  const cost = costBasis(unit);
  const grossProfit = (Number(sellingPrice) || 0) - cost;
  const zakat = grossProfit > 0 ? grossProfit * zakatRate : 0;
  const netIncome = grossProfit - zakat;
  return { cost, grossProfit, zakat, netIncome };
}

export function createTransaction(unit, saleDetails, zakatRate = 0.025) {
  const { sellingPrice, buyerName, buyerAddress, notes, soldDate, paymentMethod = "cash" } = saleDetails;
  const math = calcSaleMath(unit, sellingPrice, zakatRate);
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    unitId: unit.id,
    name: unit.name,
    category: unit.category,
    plate: unit.plate,
    year: unit.year,
    unitPrice: unit.unitPrice,
    costUnit: unit.costUnit,
    additionalCost: unit.additionalCost,
    sellingPrice: Number(sellingPrice) || 0,
    buyerName: String(buyerName || "").trim(),
    buyerAddress: String(buyerAddress || "").trim(),
    buyerContact: String(buyerAddress || "").trim(),
    notes: String(notes || "").trim(),
    soldDate: soldDate || new Date().toISOString().slice(0, 10),
    saleType: paymentMethod === "tradein" ? "tradein" : "regular",
    paymentMethod,
    zakatPaid: paymentMethod === "tradein" ? true : false,
    ...math,
  };
}

export function isZakatDue(tx) {
  return !tx.zakatPaid && (tx.zakat || 0) > 0;
}
