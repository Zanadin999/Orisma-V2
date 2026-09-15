// Domain: Plate value object - single source of truth for NOPOL identity
export function normalizePlate(plate) {
  return String(plate || "").toUpperCase().replace(/\s+/g, "").trim();
}

export function isValidPlate(plate) {
  return normalizePlate(plate).length >= 3;
}
