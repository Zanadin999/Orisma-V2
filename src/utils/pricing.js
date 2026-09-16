// Shared formatting + pricing formulas. Kept in one place so the same
// math is used everywhere a unit's cost or a sale's profit is shown.

export function rupiah(n) {
  const v = Number(n);
  if (!isFinite(v)) return "Rp 0";
  return "Rp " + Math.round(v).toLocaleString("id-ID");
}

export function rupiahNoPrefix(n) {
  const v = Number(n);
  if (!isFinite(v)) return "0";
  return Math.round(v).toLocaleString("id-ID");
}

export function rupiahCompact(n) {
  const v = Number(n);
  if (!isFinite(v)) return "Rp 0";
  if (Math.abs(v) >= 1_000_000_000) return "Rp " + (v / 1_000_000_000).toFixed(1).replace(".", ",") + " M";
  if (Math.abs(v) >= 1_000_000) return "Rp " + (v / 1_000_000).toFixed(1).replace(".", ",") + " jt";
  return "Rp " + Math.round(v).toLocaleString("id-ID");
}

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtShortDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysInStock(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 86400000));
}

// Modal (capital) tied up in a unit: Cost Basis = Harga Beli + Repair Fee + (Tenaga+Komisi+Lain)
export function costBasis(unit) {
  return (Number(unit.unitPrice) || 0) + 
         (Number(unit.repairFee ?? unit.costUnit ?? 0) || 0) + 
         (Number(unit.additionalCost ?? 0) || 0) + 
         (Number(unit.additionalCost1) || 0) + 
         (Number(unit.additionalCost2) || 0) + 
         (Number(unit.additionalCost3) || 0);
}

// Base Harga Beli + Repair Fee (without Tenaga/Komisi/Lain)
export function hargaModal(unit) {
  return (Number(unit.unitPrice) || 0) + (Number(unit.repairFee ?? unit.costUnit ?? 0) || 0) + (Number(unit.additionalCost) || 0);
}

// Harga Minimum Unit = Harga Beli + Repair Fee + Tenaga+Komisi+Lain
export function minPrice(unit) {
  return costBasis(unit);
}

// Sale-side math: gross profit against cost basis, then zakat on
// that profit (rate from Settings or fallback 2.5%).
export function saleMath(unit, sellingPrice, zakatRate) {
  const cost = costBasis(unit);
  const grossProfit = (Number(sellingPrice) || 0) - cost;
  let rate = 0.025;
  if (zakatRate != null) rate = Number(zakatRate);
  else {
    try {
      const raw = localStorage.getItem("orisma_settings_v1");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.zakatRate != null) rate = Number(s.zakatRate) / 100;
      }
    } catch {}
  }
  const zakat = grossProfit > 0 ? grossProfit * rate : 0;
  const netIncome = grossProfit - zakat;
  return { cost, grossProfit, zakat, netIncome };
}
