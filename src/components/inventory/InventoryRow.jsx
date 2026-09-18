import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import BrandBadge from "../shared/BrandBadge";
import { useSettings } from "../../context/SettingsContext";
import { recommendedPrice, rupiah, fmtDate } from "../../utils/pricing";

export default function InventoryRow({ unit, onEdit, onDelete }) {
  const { settings } = useSettings();
  const targetLaba = Number(settings?.targetLaba) || 0;

  return (
    <tr className="group border-b border-[#e6e4dd] hover:bg-neutral-50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-[13px]">{unit.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[11.5px] text-[#7c8783]">{unit.plate}</span>
          {unit.color && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200 whitespace-nowrap">{unit.color}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3"><BrandBadge categoryKey={unit.category} /></td>
      <td className="px-4 py-3 text-[13px]">{unit.year}</td>
      <td className="px-4 py-3 text-[13px]">{unit.ownerName}</td>
      <td className="px-4 py-3 text-[13px] font-medium text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {rupiah(recommendedPrice(unit, targetLaba))}
      </td>
      <td className="px-4 py-3 text-[13px] text-[#7c8783]">{fmtDate(unit.dateAcquired)}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(unit)} className="text-[#b5b2a8] hover:text-black" title={`Edit ${unit.name}`}>
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(unit.id)} className="text-[#b5b2a8] hover:text-red-500" title={`Remove ${unit.name}`}>
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
