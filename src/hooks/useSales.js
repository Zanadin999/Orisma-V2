import { useState, useMemo, useRef, useEffect } from 'react';
import { INITIAL_SALES } from '../data/salesData';
import { minPrice, saleMath, costBasis } from '../utils/pricing';
import { getStoredZakatFraction } from '../context/SettingsContext';

const STORAGE_KEY = 'orisma_sales_v24';

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

// Owns the log of completed sales, independent of inventory.
// App.jsx calls useInventory's sellUnit first, and only records a
// transaction here if that succeeds.
export function useSales() {
  const [transactions, setTransactions] = useState(() => loadStoredSales() || INITIAL_SALES);
  const nextTxId = useRef(
    Math.max(0, ...(loadStoredSales() || INITIAL_SALES).map(t => (typeof t.id === 'number' ? t.id : 0))) + 1
  );

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch {}
  }, [transactions]);

  // unitSnapshot comes from useInventory.sellUnit()
  // zakatRate is passed in explicitly — no hidden localStorage reads
  function recordSale(
    unitSnapshot,
    { sellingPrice, paymentMethod, downPayment, financingCompany, commission, buyerName, buyerAddress, notes, soldDate },
    zakatRate
  ) {
    // Resolve zakat rate: use passed value, else read from stored settings once
    const rate = (zakatRate != null && isFinite(Number(zakatRate)))
      ? Number(zakatRate)
      : getStoredZakatFraction();
    const math = saleMath(unitSnapshot, sellingPrice, rate);
    const tx = {
      id: nextTxId.current++,
      unitId: unitSnapshot.id,
      name: unitSnapshot.name,
      category: unitSnapshot.category,
      plate: unitSnapshot.plate,
      year: unitSnapshot.year,
      unitPrice: unitSnapshot.unitPrice,
      repairFee: unitSnapshot.repairFee ?? unitSnapshot.costUnit ?? 0, // canonical field
      minPrice: minPrice(unitSnapshot),
      sellingPrice: Number(sellingPrice) || 0,
      paymentMethod: paymentMethod || 'cash',
      downPayment: Number(downPayment) || 0,
      financingCompany: financingCompany || null,
      commission: Number(commission) || 0,
      buyerName,
      buyerAddress,
      notes,
      soldDate,
      saleType: 'regular',
      zakatPaid: false,
      ...math,
    };
    setTransactions(prev => [tx, ...prev]);
  }

  // Trade-in sale: zakat = 0 (no profit zakat on trade-ins)
  function recordTradeInSale({ soldUnit, acquiredUnit, tradeInValue, ownerName, ownerAddress, soldDate }) {
    // Use saleMath with zakatRate=0 — no zakat on trade-ins
    // Use costBasis for accurate cost calculation — no inline math
    const math = saleMath(soldUnit, tradeInValue, 0);
    const tx = {
      id: nextTxId.current++,
      unitId: soldUnit.id,
      name: soldUnit.name,
      category: soldUnit.category,
      plate: soldUnit.plate,
      year: soldUnit.year,
      unitPrice: soldUnit.unitPrice,
      repairFee: soldUnit.repairFee ?? soldUnit.costUnit ?? 0, // canonical field
      minPrice: minPrice(soldUnit),
      sellingPrice: tradeInValue,
      paymentMethod: 'tradein',
      downPayment: 0,
      financingCompany: null,
      commission: 0,
      buyerName: ownerName,
      buyerAddress: ownerAddress,
      notes: `Tukar Tambah - ${acquiredUnit.name} (${acquiredUnit.plate})`,
      soldDate,
      saleType: 'tradein',
      zakatPaid: true,
      zakat: 0, // No zakat on trade-ins
      ...math,
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
    const key = t => `${String(t.plate || '').toUpperCase().replace(/\s+/g, '')}|${t.soldDate}|${t.sellingPrice}`;
    const existingKeys = new Set(transactions.map(key));
    const seen = new Set();
    const deduped = [];
    let dupCount = 0;
    for (const t of imported) {
      const k = key(t);
      if (existingKeys.has(k) || seen.has(k)) { dupCount++; continue; }
      seen.add(k);
      if (t.zakatPaid === undefined) {
        t.zakatPaid = t.saleType === 'tradein' || t.paymentMethod === 'tradein';
      }
      deduped.push(t);
    }
    if (deduped.length === 0) return;
    const withIds = deduped.map(tx => ({ ...tx, id: nextTxId.current++ }));
    setTransactions(prev => [...withIds, ...prev]);
  }

  function toggleZakatPaid(id) {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, zakatPaid: !t.zakatPaid } : t)));
  }

  function markAllZakatPaid(ids) {
    const idSet = new Set(ids);
    setTransactions(prev => prev.map(t => (idSet.has(t.id) ? { ...t, zakatPaid: true } : t)));
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
