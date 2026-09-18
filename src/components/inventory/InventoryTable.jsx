import React from "react";
import InventoryRow from "./InventoryRow";

export default function InventoryTable({ units, onEdit, onDelete }) {
  return (
    <div className="border border-[#e6e4dd] rounded-lg overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11.5px] text-[#7c8783] border-b border-[#e6e4dd]">
            <th className="px-4 py-3 font-medium">Unit</th>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">Year</th>
            <th className="px-4 py-3 font-medium">Owner</th>
            <th className="px-4 py-3 font-medium">Harga Rekomendasi</th>
            <th className="px-4 py-3 font-medium">Acquired</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {units.map(u => (
            <InventoryRow key={u.id} unit={u} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {units.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-[#7c8783]">
                No units match the current filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
