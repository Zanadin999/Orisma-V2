import React, { useMemo } from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { UNCATEGORIZED } from "../../data/brands";

export default function BrandBreakdown({ availableUnits }) {
  const { categories: brands, getCategory } = useCategoriesContext();

  const rows = useMemo(() => {
    const map = {};
    availableUnits.forEach(u => {
      const b = getCategory(u.category);
      map[b.key] = (map[b.key] || 0) + 1;
    });
    return [...brands, UNCATEGORIZED]
      .map(b => ({ ...b, count: map[b.key] || 0 }))
      .filter(b => b.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [availableUnits, brands, getCategory]);

  const max = Math.max(...rows.map(r => r.count), 1);

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-4">Inventory by brand</div>
      {rows.length === 0 ? (
        <div className="text-[13px] text-[#7c8783]">No stock recorded yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.key}>
              <div className="flex items-center justify-between mb-1 text-[12.5px]">
                <span className="font-medium">{r.label}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{r.count}</span>
              </div>
              <div className="w-full h-1.5 rounded bg-[#edece7] overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
