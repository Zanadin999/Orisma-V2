// Domain Entity: Unit (aggregate root in Inventory context)
import { normalizePlate, isValidPlate } from "./Plate.js";

export function createUnit(data) {
  if (!data.name?.trim()) throw new Error("Nama kendaraan wajib");
  if (!isValidPlate(data.plate)) throw new Error("NOPOL tidak valid");
  return {
    id: data.id ?? Date.now() + Math.floor(Math.random() * 1000),
    name: String(data.name).trim(),
    category: String(data.category || "honda").toLowerCase(),
    year: Number(data.year) || new Date().getFullYear(),
    plate: String(data.plate).trim(),
    unitPrice: Number(data.unitPrice) || 0,
    costUnit: Number(data.costUnit) || 0,
    additionalCost: Number(data.additionalCost) || 0,
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
  return (Number(unit.unitPrice) || 0) + (Number(unit.costUnit) || 0) + (Number(unit.additionalCost) || 0)
       + (Number(unit.additionalCost1) || 0) + (Number(unit.additionalCost2) || 0) + (Number(unit.additionalCost3) || 0);
}

export function hargaSetelahPerbaikan(unit) {
  const hargaUnit = (Number(unit.unitPrice) || 0) + (Number(unit.costUnit) || 0) + (Number(unit.additionalCost) || 0);
  return hargaUnit + (Number(unit.additionalCost1) || 0) + (Number(unit.additionalCost2) || 0) + (Number(unit.additionalCost3) || 0);
}

export function isAvailable(unit) {
  return unit.status === "available";
}
