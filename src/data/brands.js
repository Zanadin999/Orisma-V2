// Starting brands — editable at runtime via CategoriesContext.
// Renaming a brand only changes its label; its `key` stays stable
// so existing units keep pointing at the right brand.
export const DEFAULT_BRANDS = [
  { key: "honda",    label: "Honda",             color: "bg-red-50 text-red-700" },
  { key: "yamaha",   label: "Yamaha",            color: "bg-blue-50 text-blue-700" },
  { key: "suzuki",   label: "Suzuki",            color: "bg-amber-50 text-amber-700" },
  { key: "kawasaki", label: "Kawasaki",          color: "bg-emerald-50 text-emerald-700" },
  { key: "vespa",    label: "Vespa / Piaggio",   color: "bg-pink-50 text-pink-700" },
];

// Rotated through when the user adds a new brand, so each new one
// gets a distinct color without needing to be picked manually.
export const COLOR_PALETTE = [
  "bg-red-50 text-red-700",
  "bg-blue-50 text-blue-700",
  "bg-amber-50 text-amber-700",
  "bg-emerald-50 text-emerald-700",
  "bg-pink-50 text-pink-700",
  "bg-violet-50 text-violet-700",
  "bg-cyan-50 text-cyan-700",
  "bg-orange-50 text-orange-700",
];

// Any unit whose brand key no longer matches a real brand
// (because that brand was renamed away or deleted) falls back to this.
export const UNCATEGORIZED = {
  key: "lainnya",
  label: "Lainnya",
  color: "bg-neutral-100 text-neutral-600",
};

export function resolveCategory(brands, key) {
  return brands.find(b => b.key === key) || UNCATEGORIZED;
}

// Turns a typed label into a stable, unique key like "honda-cbr".
export function slugifyCategoryLabel(label, existingBrands) {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "brand";
  let key = base;
  let suffix = 2;
  while (existingBrands.some(b => b.key === key)) {
    key = `${base}-${suffix}`;
    suffix += 1;
  }
  return key;
}
