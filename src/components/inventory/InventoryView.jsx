import React, { useState, useMemo } from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import BrandRail from "./BrandRail";
import InventoryToolbar from "./InventoryToolbar";
import InventoryTable from "./InventoryTable";
import EditUnitModal from "./EditUnitModal";
import ExportButtons from "../shared/ExportButtons";
import ImportButton from "../shared/ImportButton";
import { exportInventoryToExcel, exportInventoryToCSV, importInventoryFromFile } from "../../utils/exportImport";

export default function InventoryView({ availableUnits, allUnits, onEdit, onDelete, onImport }) {
  const { getCategory } = useCategoriesContext();
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return availableUnits.filter(u => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.plate.toLowerCase().includes(q);
      const matchesBrand = brandFilter === "all" || getCategory(u.category).key === brandFilter;
      return matchesQuery && matchesBrand;
    });
  }, [availableUnits, query, brandFilter, getCategory]);

  const activeLabel = brandFilter === "all" ? "All brands" : getCategory(brandFilter).label;

  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Inventory</h1>
        <div className="text-sm text-[#7c8783]">Showroom Orisma</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-3">
        Manage units currently in stock. Add new units via Unit Acquisition tab.
      </p>

      <div className="flex items-center justify-between mb-5">
        <ExportButtons 
          onExportExcel={() => exportInventoryToExcel(allUnits)}
          onExportCSV={() => exportInventoryToCSV(allUnits)}
        />
        <ImportButton 
          onImport={(file) => {
            importInventoryFromFile(
              file,
              (units, txs) => onImport(units, txs),
              (error) => alert(`Import failed: ${error}`)
            );
          }}
        />
      </div>

      <div className="flex flex-col lg:flex-row bg-white border border-[#e6e4dd] rounded-xl overflow-hidden">
        <BrandRail availableUnits={availableUnits} active={brandFilter} onSelect={setBrandFilter} />

        <div className="flex-1 p-4 lg:p-5 min-w-0 overflow-x-auto">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[13px] font-semibold">{activeLabel}</div>
            <div className="text-[12px] text-[#7c8783]">{filtered.length} unit{filtered.length === 1 ? "" : "s"}</div>
          </div>

          <InventoryToolbar query={query} onQueryChange={setQuery} />

          <div className="overflow-x-auto -mx-4 lg:mx-0">
            <InventoryTable units={filtered} onEdit={setEditing} onDelete={onDelete} />
          </div>
        </div>
      </div>

      {editing && (
        <EditUnitModal
          unit={editing}
          onClose={() => setEditing(null)}
          onSubmit={(form) => { onEdit(editing.id, form); setEditing(null); }}
        />
      )}
    </>
  );
}
