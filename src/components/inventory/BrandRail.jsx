import React, { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { UNCATEGORIZED } from "../../data/brands";
import BrandManagerModal from "./BrandManagerModal";

export default function BrandRail({ availableUnits, active, onSelect }) {
  const { categories: brands, getCategory } = useCategoriesContext();
  const [showManager, setShowManager] = useState(false);

  const counts = useMemo(() => {
    const map = {};
    availableUnits.forEach(u => {
      const b = getCategory(u.category);
      map[b.key] = (map[b.key] || 0) + 1;
    });
    return map;
  }, [availableUnits, getCategory]);
  const uncategorizedCount = counts[UNCATEGORIZED.key] || 0;

  return (
    <div className="w-[190px] shrink-0 bg-white rounded-l-xl border-r border-[#e6e4dd] py-2 flex flex-col">
      <div className="flex-1">
        <RailItem label="All brands" count={availableUnits.length} active={active === "all"} onClick={() => onSelect("all")} />
        {brands.map(b => (
          <RailItem key={b.key} label={b.label} count={counts[b.key] || 0} active={active === b.key} onClick={() => onSelect(b.key)} />
        ))}
        {uncategorizedCount > 0 && (
          <RailItem
            label={UNCATEGORIZED.label}
            count={uncategorizedCount}
            active={active === UNCATEGORIZED.key}
            onClick={() => onSelect(UNCATEGORIZED.key)}
          />
        )}
      </div>
      <button
        onClick={() => setShowManager(true)}
        className="flex items-center gap-2 px-4 py-2.5 mt-1 text-[12.5px] text-[#7c8783] border-t border-[#e6e4dd]"
      >
        <Settings2 size={13} /> Edit brands
      </button>

      {showManager && <BrandManagerModal onClose={() => setShowManager(false)} />}
    </div>
  );
}

function RailItem({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors ${
        active ? "bg-[#e3f3ee] text-[#0e3b3a] font-semibold border-r-2 border-teal-600" : "text-[#3a3a42] hover:bg-neutral-50"
      }`}
    >
      <span>{label}</span>
      <span className={`text-[11.5px] ${active ? "text-teal-600" : "text-[#7c8783]"}`}>{count}</span>
    </button>
  );
}
