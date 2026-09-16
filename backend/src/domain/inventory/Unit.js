// Domain Entity: Unit (aggregate root in Inventory context)
import { normalizePlate, isValidPlate } from "./Plate.js";

export function createUnit(data) {
  if (!data.name?.trim()) throw new Error("Nama kendaraan wajib");
  if (!isValidPlate(data.plate)) throw new Error("NOPOL tidak valid");
  // Cost Unit is deprecated — migrate to repairFee if present
  const repairFee = Number(data.repairFee ?? data.costUnit ?? data.additionalCost ?? 0);
  return {
    id: data.id ?? Date.now() + Math.floor(Math.random() * 1000),
    name: String(data.name).trim(),
    category: String(data.category || "honda").toLowerCase(),
    year: Number(data.year) || new Date().getFullYear(),
    plate: String(data.plate).trim(),
    unitPrice: Number(data.unitPrice) || 0,
    repairFee,
    additionalCost1: Number(data.additionalCost1 ?? 130000),
    additionalCost2: Number(data.additionalCost2 ?? 0),
    additionalCost3: Number(data.additionalCost3 ?? 10000),
    ownerName: String(data.ownerName || "").trim(),
    ownerAddress: String(data.ownerAddress || "").trim(),
    notes: String(data.notes || "").trim(),
    dateAcquired: data.dateAcquired || new Date().toISOString().slice(0, 10),
    status: data.status === "sold" ? "sold" : "available",
    saleType: data.saleType || undefined,
    acquisitionSource: data.acquisitionSource || "purchase",
  };
}

export function costBasis(unit) {
  // Cost Basis = Harga Beli + Repair Fee + (Tenaga + Komisi + Lain)
  return (Number(unit.unitPrice) || 0) + (Number(unit.repairFee ?? unit.costUnit ?? 0) || 0)
       + (Number(unit.additionalCost1) || 0) + (Number(unit.additionalCost2) || 0) + (Number(unit.additionalCost3) || 0);
}

export function hargaSetelahPerbaikan(unit) {
  const hargaBeli = Number(unit.unitPrice) || 0;
  const repairFee = Number(unit.repairFee ?? unit.costUnit ?? 0) || 0;
  return hargaBeli + repairFee + (Number(unit.additionalCost1) || 0) + (Number(unit.additionalCost2) || 0) + (Number(unit.additionalCost3) || 0);
}

export function isAvailable(unit) {
  return unit.status === "available";
}
