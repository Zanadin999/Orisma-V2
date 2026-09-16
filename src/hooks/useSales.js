import { useState, useMemo, useRef, useEffect } from "react";
import { INITIAL_SALES } from "../data/salesData";
import { minPrice, saleMath } from "../utils/pricing";

const STORAGE_KEY = "orisma_sales_v24";
function loadStoredSales() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return null;
}

// Owns the log of completed sales, independent of inventory. It doesn't
// touch stock itself — App.jsx calls useInventory's sellUnit first, and
// only records a transaction here if that succeeds. This keeps "what
// happened" (sales) separate from "what's true now" (inventory).
export function useSales() {
  const [transactions, setTransactions] = useState(() => loadStoredSales() || INITIAL_SALES);
  const nextTxId = useRef(Math.max(0, ...(loadStoredSales() || INITIAL_SALES).map(t => typeof t.id === "number" ? t.id : 0)) + 1);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch {}
  }, [transactions]);

  // unitSnapshot comes from useInventory.sellUnit(); saleDetails is the
  // buyer/price/date info collected on the Sales/POS form.
  function recordSale(unitSnapshot, { sellingPrice, paymentMethod, downPayment, financingCompany, commission, buyerName, buyerAddress, notes, soldDate }) {
    const math = saleMath(unitSnapshot, sellingPrice);
    const tx = {
      id: nextTxId.current++,
      unitId: unitSnapshot.id,
      name: unitSnapshot.name,
      category: unitSnapshot.category,
      plate: unitSnapshot.plate,
      year: unitSnapshot.year,
      unitPrice: unitSnapshot.unitPrice,
      costUnit: unitSnapshot.costUnit,
      additionalCost: unitSnapshot.additionalCost,
      minPrice: minPrice(unitSnapshot),
      sellingPrice: Number(sellingPrice) || 0,
      paymentMethod: paymentMethod || "cash",
      downPayment: Number(downPayment) || 0,
      financingCompany: financingCompany || null,
      commission: Number(commission) || 0,
      buyerName,
      buyerAddress,
      notes,
      soldDate,
      saleType: "regular",
      zakatPaid: false,
      ...math,
    };
    setTransactions(prev => [tx, ...prev]);
  }

  // Trade-in sale: no zakat applied
  function recordTradeInSale({ soldUnit, acquiredUnit, tradeInValue, ownerName, ownerAddress, soldDate }) {
    const tx = {
      id: nextTxId.current++,
      unitId: soldUnit.id,
      name: soldUnit.name,
      category: soldUnit.category,
      plate: soldUnit.plate,
      year: soldUnit.year,
      unitPrice: soldUnit.unitPrice,
      costUnit: soldUnit.costUnit,
      additionalCost: soldUnit.additionalCost,
      minPrice: minPrice(soldUnit),
      sellingPrice: tradeInValue,
      paymentMethod: "tradein",
      downPayment: 0,
      financingCompany: null,
      commission: 0,
      buyerName: ownerName,
      buyerAddress: ownerAddress,
      notes: `Tukar Tambah - ${acquiredUnit.name} (${acquiredUnit.plate})`,
      soldDate: soldDate,
      saleType: "tradein",
      zakatPaid: true,
      cost: (soldUnit.unitPrice || 0) + (soldUnit.costUnit || 0) + (soldUnit.additionalCost || 0),
      grossProfit: tradeInValue - ((soldUnit.unitPrice || 0) + (soldUnit.costUnit || 0) + (soldUnit.additionalCost || 0)),
      zakat: 0, // No zakat on trade-ins
      netIncome: tradeInValue - ((soldUnit.unitPrice || 0) + (soldUnit.costUnit || 0) + (soldUnit.additionalCost || 0)),
      tradeInValue,
    };
    setTransactions(prev => [tx, ...prev]);
  }

  const totalRevenue = useMemo(
    () => transactions.reduce((sum, t) => sum + t.sellingPrice, 0),
    [transactions]
  );
  const totalNetIncome = useMemo(
    () => transactions.reduce((sum, t) => sum + t.netIncome + (t.commission || 0), 0),
    [transactions]
  );
  const lastSale = transactions[0] || null;

  // Grouped by raw key/name here; components resolve brand labels via
  // CategoriesContext when they render these (same split as CategoryBadge).
  const topBrands = useMemo(() => {
    const byKey = {};
    transactions.forEach(t => {
      if (!byKey[t.category]) byKey[t.category] = { key: t.category, count: 0, revenue: 0 };
      byKey[t.category].count += 1;
      byKey[t.category].revenue += t.sellingPrice;
    });
    return Object.values(byKey).sort((a, b) => b.count - a.count);
  }, [transactions]);

  const topModels = useMemo(() => {
    const byName = {};
    transactions.forEach(t => {
      if (!byName[t.name]) byName[t.name] = { name: t.name, count: 0, revenue: 0 };
      byName[t.name].count += 1;
      byName[t.name].revenue += t.sellingPrice;
    });
    return Object.values(byName).sort((a, b) => b.count - a.count);
  }, [transactions]);

  function importTransactions(imported) {
    if (!imported || imported.length === 0) return;
    // Deduplicate sales by NOPOL+soldDate+sellingPrice
    const key = (t) => `${String(t.plate||"").toUpperCase().replace(/\s+/g,"")}|${t.soldDate}|${t.sellingPrice}`;
    const existingKeys = new Set(transactions.map(key));
    const seen = new Set();
    const deduped = [];
    let dupCount = 0;
    for (const t of imported) {
      const k = key(t);
      if (existingKeys.has(k) || seen.has(k)) { dupCount++; continue; }
      seen.add(k);
      // ensure zakatPaid defaults to false for imported regular sales, true for tradein
      if (t.zakatPaid === undefined) t.zakatPaid = t.saleType === "tradein" || t.paymentMethod === "tradein" ? true : false;
      deduped.push(t);
    }
    if (deduped.length === 0) return;
    const withIds = deduped.map(tx => ({
      ...tx,
      id: nextTxId.current++,
    }));
    setTransactions(prev => [...withIds, ...prev]);
  }

  function toggleZakatPaid(id) {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, zakatPaid: !t.zakatPaid } : t));
  }

  function markAllZakatPaid(ids) {
    const idSet = new Set(ids);
    setTransactions(prev => prev.map(t => idSet.has(t.id) ? { ...t, zakatPaid: true } : t));
  }

  return {
    transactions,
    recordSale,
    recordTradeInSale,
    importTransactions,
    toggleZakatPaid,
    markAllZakatPaid,
    totalRevenue,
    totalNetIncome,
    lastSale,
    topBrands,
    topModels,
  };
}
