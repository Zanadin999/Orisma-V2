import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import BrandBadge from "../shared/BrandBadge";
import { costBasis, minPrice, rupiah, fmtDate } from "../../utils/pricing";

export default function InventoryRow({ unit, onEdit, onDelete }) {
  return (
    <tr className="group border-b border-[#e6e4dd] hover:bg-neutral-50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-[13px]">{unit.name}</div>
        <div className="text-[11.5px] text-[#7c8783]">{unit.plate}</div>
      </td>
      <td className="px-4 py-3"><BrandBadge categoryKey={unit.category} /></td>
      <td className="px-4 py-3 text-[13px]">{unit.year}</td>
      <td className="px-4 py-3 text-[13px]">{unit.ownerName}</td>
      <td className="px-4 py-3 text-[13px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {rupiah(costBasis(unit))}
      </td>
      <td className="px-4 py-3 text-[13px] font-medium text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {rupiah(minPrice(unit))}
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
