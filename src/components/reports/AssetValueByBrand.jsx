import React, { useMemo } from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { UNCATEGORIZED } from "../../data/brands";
import { costBasis, rupiah } from "../../utils/pricing";

export default function AssetValueByBrand({ availableUnits }) {
  const { categories: brands, getCategory } = useCategoriesContext();

  const rows = useMemo(() => {
    const map = {};
    availableUnits.forEach(u => {
      const b = getCategory(u.category);
      map[b.key] = (map[b.key] || 0) + costBasis(u);
    });
    return [...brands, UNCATEGORIZED]
      .map(b => ({ ...b, value: map[b.key] || 0 }))
      .filter(b => b.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [availableUnits, brands, getCategory]);

  const max = Math.max(...rows.map(r => r.value), 1);

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-4">Stock value by brand</div>
      {rows.length === 0 ? (
        <div className="text-[13px] text-[#7c8783]">No stock recorded yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.key}>
              <div className="flex items-center justify-between mb-1 text-[12.5px]">
                <span className="font-medium">{r.label}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(r.value)}</span>
              </div>
              <div className="w-full h-1.5 rounded bg-[#edece7] overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: `${Math.round((r.value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
