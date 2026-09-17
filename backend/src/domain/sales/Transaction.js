// Domain Entity: Transaction (Sales context)
// cost is received as a parameter from the application layer (SalesService),
// which bridges the Inventory and Sales bounded contexts.
// The Sales domain no longer imports from the Inventory domain directly.

export function calcSaleMath(cost, sellingPrice, zakatRate = 0.025) {
  const grossProfit = (Number(sellingPrice) || 0) - cost;
  const zakat = grossProfit > 0 ? grossProfit * zakatRate : 0;
  const netIncome = grossProfit - zakat;
  return { cost, grossProfit, zakat, netIncome };
}

export function createTransaction(unit, saleDetails, zakatRate = 0.025, cost) {
  const { sellingPrice, buyerName, buyerAddress, notes, soldDate, paymentMethod = 'cash' } = saleDetails;
  const math = calcSaleMath(cost, sellingPrice, zakatRate);
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    unitId: unit.id,
    name: unit.name,
    category: unit.category,
    plate: unit.plate,
    year: unit.year,
    unitPrice: unit.unitPrice,
    repairFee: unit.repairFee ?? 0,
    sellingPrice: Number(sellingPrice) || 0,
    buyerName: String(buyerName || '').trim(),
    buyerAddress: String(buyerAddress || '').trim(),
    buyerContact: String(buyerAddress || '').trim(),
    notes: String(notes || '').trim(),
    soldDate: soldDate || new Date().toISOString().slice(0, 10),
    saleType: paymentMethod === 'tradein' ? 'tradein' : 'regular',
    paymentMethod,
    zakatPaid: paymentMethod === 'tradein',
    ...math,
  };
}

export function isZakatDue(tx) {
  return !tx.zakatPaid && (tx.zakat || 0) > 0;
}
