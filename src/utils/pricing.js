// Shared formatting + pricing formulas.
// All functions are pure — they only use arguments passed to them.
// No hidden reads from localStorage or global state.

export function rupiah(n) {
  const v = Number(n);
  if (!isFinite(v)) return 'Rp 0';
  return 'Rp ' + Math.round(v).toLocaleString('id-ID');
}

export function rupiahNoPrefix(n) {
  const v = Number(n);
  if (!isFinite(v)) return '0';
  return Math.round(v).toLocaleString('id-ID');
}

export function rupiahCompact(n) {
  const v = Number(n);
  if (!isFinite(v)) return 'Rp 0';
  if (Math.abs(v) >= 1_000_000_000) return 'Rp ' + (v / 1_000_000_000).toFixed(1).replace('.', ',') + ' M';
  if (Math.abs(v) >= 1_000_000) return 'Rp ' + (v / 1_000_000).toFixed(1).replace('.', ',') + ' jt';
  return 'Rp ' + Math.round(v).toLocaleString('id-ID');
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtShortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysInStock(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 86400000));
}

// Cost Basis = Harga Beli + Repair Fee + (Tenaga + Komisi + Lain)
export function costBasis(unit) {
  return (
    (Number(unit.unitPrice) || 0) +
    (Number(unit.repairFee ?? unit.costUnit ?? 0) || 0) + // backward-compat: repairFee is canonical
    (Number(unit.additionalCost ?? 0) || 0) +
    (Number(unit.additionalCost1) || 0) +
    (Number(unit.additionalCost2) || 0) +
    (Number(unit.additionalCost3) || 0)
  );
}

export function hargaModal(unit) {
  return (Number(unit.unitPrice) || 0) + (Number(unit.repairFee ?? unit.costUnit ?? 0) || 0) + (Number(unit.additionalCost) || 0);
}

export function minPrice(unit) {
  return costBasis(unit);
}

export function recommendedPrice(unit, targetLaba = 0) {
  return costBasis(unit) + (Number(targetLaba) || 0);
}

/**
 * Sale-side math: gross profit against cost basis, then zakat on that profit.
 * Pure function — zakatRate must be passed in explicitly by the caller.
 * Get zakatRate from useSettings().zakatFraction in React components/hooks.
 *
 * @param {Object} unit - The unit being sold
 * @param {number} sellingPrice - The selling price
 * @param {number} zakatRate - Zakat rate as a fraction (e.g. 0.025 for 2.5%)
 */
export function saleMath(unit, sellingPrice, zakatRate = 0.025) {
  const cost = costBasis(unit);
  const grossProfit = (Number(sellingPrice) || 0) - cost;
  const rate = (zakatRate != null && isFinite(Number(zakatRate))) ? Number(zakatRate) : 0.025;
  const zakat = grossProfit > 0 ? grossProfit * rate : 0;
  const netIncome = grossProfit - zakat;
  return { cost, grossProfit, zakat, netIncome };
}
