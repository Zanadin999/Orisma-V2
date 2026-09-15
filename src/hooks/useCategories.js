import { useState } from "react";
import { DEFAULT_BRANDS, COLOR_PALETTE, resolveCategory, slugifyCategoryLabel } from "../data/brands";

// All brand state and mutations live here, mirroring how useInventory
// owns unit state. A brand's `key` never changes after creation — only
// rename touches `label`, so units referencing that key keep working
// across a rename.
export function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_BRANDS);

  function addCategory(label) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const key = slugifyCategoryLabel(trimmed, categories);
    const color = COLOR_PALETTE[categories.length % COLOR_PALETTE.length];
    setCategories(prev => [...prev, { key, label: trimmed, color }]);
  }

  function renameCategory(key, newLabel) {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    setCategories(prev => prev.map(c => (c.key === key ? { ...c, label: trimmed } : c)));
  }

  function deleteCategory(key) {
    // Units still holding this key simply resolve to "Lainnya" via
    // resolveCategory below — no need to touch unit state here.
    setCategories(prev => prev.filter(c => c.key !== key));
  }

  function getCategory(key) {
    return resolveCategory(categories, key);
  }

  return { categories, addCategory, renameCategory, deleteCategory, getCategory };
}
