import { useState, useMemo, useRef, useEffect } from "react";
import { INITIAL_UNITS } from "../data/unitsData";
import { costBasis, todayISO } from "../utils/pricing";
import { UNCATEGORIZED } from "../data/brands";

const STORAGE_KEY = "orisma_units_v24";

function loadStoredUnits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return null;
}

// All inventory state and mutations live here, independent of any
// component. A unit is a unique motorcycle, not a restockable SKU: it
// moves from "available" to "sold" exactly once, via sellUnit below.
export function useInventory() {
  const [units, setUnits] = useState(() => loadStoredUnits() || INITIAL_UNITS);
  const [toast, setToast] = useState(null);
  const nextId = useRef(Math.max(0, ...(loadStoredUnits() || INITIAL_UNITS).map(u => typeof u.id === "number" ? u.id : 0)) + 1);
  const toastTimer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(units)); } catch {}
  }, [units]);

  const flash = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  function addUnit(form) {
    if (!form.name.trim() || !form.plate.trim()) return;
    const unit = {
      id: nextId.current++,
      name: form.name.trim(),
      category: form.category || UNCATEGORIZED.key,
      year: Number(form.year) || new Date().getFullYear(),
      plate: form.plate.trim(),
      unitPrice: Number(form.unitPrice) || 0,
      repairFee: Number(form.repairFee ?? form.costUnit) || 0,
      additionalCost1: Number(form.additionalCost1) || 0,
      additionalCost2: Number(form.additionalCost2) || 0,
      additionalCost3: Number(form.additionalCost3) || 0,
      acquisitionSource: form.acquisitionSource || "purchase",
      ownerName: form.ownerName.trim(),
      ownerAddress: form.ownerAddress.trim(),
      notes: form.notes.trim(),
      dateAcquired: form.dateAcquired || todayISO(),
      status: "available",
    };
    setUnits(prev => [unit, ...prev]);
    flash(`Added "${unit.name}" to inventory`);
  }

  function editUnit(id, form) {
    setUnits(prev => prev.map(u => (
      u.id === id
        ? {
            ...u,
            name: form.name.trim(),
            category: form.category || u.category,
            year: Number(form.year) || u.year,
            plate: form.plate.trim(),
            unitPrice: Number(form.unitPrice) || 0,
            repairFee: Number(form.repairFee ?? form.costUnit) || 0,
            additionalCost1: Number(form.additionalCost1) || 0,
            additionalCost2: Number(form.additionalCost2) || 0,
            additionalCost3: Number(form.additionalCost3) || 0,
            acquisitionSource: form.acquisitionSource || u.acquisitionSource || "purchase",
            ownerName: form.ownerName.trim(),
            ownerAddress: form.ownerAddress.trim(),
            notes: form.notes.trim(),
            dateAcquired: form.dateAcquired || u.dateAcquired,
          }
        : u
    )));
    flash(`Updated "${form.name.trim()}"`);
  }

  function deleteUnit(id) {
    const target = units.find(u => u.id === id);
    setUnits(prev => prev.filter(u => u.id !== id));
    if (target) flash(`Removed "${target.name}"`);
  }

  // Called by Sales/POS when a sale is logged. Marks the unit sold and
  // returns its pre-sale snapshot so useSales can build a transaction
  // from it — same "only record what actually succeeded" pattern the
  // original app used for stock decrements.
  function sellUnit(id) {
    const target = units.find(u => u.id === id && u.status === "available");
    if (!target) return null;
    setUnits(prev => prev.map(u => (u.id === id ? { ...u, status: "sold" } : u)));
    return { ...target };
  }

  function importUnits(importedUnits) {
    if (!importedUnits || importedUnits.length === 0) return;
    
    // Deduplicate by NOPOL (plate) — the only truly unique key for a motorcycle
    const normalizePlate = (p) => String(p || "").toUpperCase().replace(/\s+/g, "").trim();
    const existingPlates = new Set(units.map(u => normalizePlate(u.plate)));
    const seenInBatch = new Set();
    const deduped = [];
    let dupCount = 0;
    for (const u of importedUnits) {
      const norm = normalizePlate(u.plate);
      if (!norm || existingPlates.has(norm) || seenInBatch.has(norm)) {
        dupCount++;
        continue;
      }
      seenInBatch.add(norm);
      deduped.push(u);
    }

    if (deduped.length === 0) {
      flash(`Skipped ${dupCount} duplicate${dupCount === 1 ? "" : "s"} — all NOPOL already in inventory`);
      return;
    }
    
    const withIds = deduped.map(u => ({
      ...u,
      id: nextId.current++,
    }));
    
    setUnits(prev => [...withIds, ...prev]);
    flash(dupCount > 0
      ? `Imported ${deduped.length}, skipped ${dupCount} duplicate${dupCount === 1 ? "" : "s"} (NOPOL exists)`
      : `Imported ${deduped.length} unit${deduped.length === 1 ? "" : "s"}`);
  }

  function processTradeIn({ soldUnit, acquiredUnit, tradeInValue }) {
    // Mark inventory unit as sold (trade-in) — labeled Traded-out with Keterangan
    const tradedNotes = `Tukar Tambah - ${acquiredUnit.name.trim()} (${acquiredUnit.plate.trim()})${acquiredUnit.notes.trim() ? " — " + acquiredUnit.notes.trim() : ""}`;
    setUnits(prev => prev.map(u => 
      u.id === soldUnit.id 
        ? { ...u, status: "sold", saleType: "tradein", notes: tradedNotes } 
        : u
    ));

    // Add customer's unit to inventory
    const newUnit = {
      id: nextId.current++,
      name: acquiredUnit.name.trim(),
      category: acquiredUnit.category || UNCATEGORIZED.key,
      year: Number(acquiredUnit.year) || new Date().getFullYear(),
      plate: acquiredUnit.plate.trim(),
      unitPrice: tradeInValue,
      repairFee: 0,
      additionalCost1: 0,
      additionalCost2: 0,
      additionalCost3: 0,
      acquisitionSource: "tradein",
      ownerName: acquiredUnit.ownerName.trim(),
      ownerAddress: acquiredUnit.ownerAddress.trim(),
      notes: acquiredUnit.notes.trim(),
      dateAcquired: acquiredUnit.dateAcquired || todayISO(),
      status: "available",
      tradeInValue,
    };
    
    setUnits(prev => [newUnit, ...prev]);
    flash(`Trade-in processed: ${soldUnit.name} → ${newUnit.name}`);
    
    return { soldUnit, acquiredUnit: newUnit, tradeInValue };
  }

  const availableUnits = useMemo(() => units.filter(u => u.status === "available"), [units]);
  const soldUnits = useMemo(() => units.filter(u => u.status === "sold"), [units]);
  const totalAssetValue = useMemo(
    () => availableUnits.reduce((sum, u) => sum + costBasis(u), 0),
    [availableUnits]
  );

  return {
    units,
    availableUnits,
    soldUnits,
    totalAssetValue,
    toast,
    addUnit,
    editUnit,
    deleteUnit,
    sellUnit,
    importUnits,
    processTradeIn,
  };
}
