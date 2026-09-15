// Domain: Money value object - Indonesian Rupiah handling
export function toRupiah(value) {
  const v = Math.round(Number(value) || 0);
  return { amount: v, formatted: `Rp ${v.toLocaleString("id-ID")}` };
}

export function parseRupiah(raw) {
  if (raw == null || raw === "" || raw === "---") return 0;
  if (typeof raw === "number") return Math.round(raw);
  const cleaned = String(raw).replace(/[^0-9\-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}
