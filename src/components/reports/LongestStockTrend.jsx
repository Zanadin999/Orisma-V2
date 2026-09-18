import React, { useMemo } from "react";
import { daysInStock, costBasis, rupiah, fmtDate } from "../../utils/pricing";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";

export default function LongestStockTrend({ availableUnits }) {
  const longestStock = useMemo(() => {
    if (!availableUnits || availableUnits.length === 0) return [];
    return [...availableUnits]
      .map(u => ({
        ...u,
        days: daysInStock(u.dateAcquired),
        cost: costBasis(u),
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 10);
  }, [availableUnits]);

  function renderBadge(days) {
    if (days >= 90) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertCircle size={12} className="shrink-0" />
          {days} hari (Critical 90+)
        </span>
      );
    }
    if (days >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle size={12} className="shrink-0" />
          {days} hari (Warning 60+)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Clock size={12} className="shrink-0" />
        {days} hari
      </span>
    );
  }

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-semibold">Longest Stock in Inventory</h3>
          <p className="text-[11.5px] text-[#7c8783]">Units sitting longest in stock with aging warnings</p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 bg-[#f6f5f1] border border-[#e6e4dd] rounded-lg text-[#55605d]">
          Top {longestStock.length} Units
        </span>
      </div>

      {longestStock.length === 0 ? (
        <div className="text-[13px] text-[#7c8783] py-6 text-center border border-dashed border-[#e6e4dd] rounded-lg">
          No available stock units found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-[#e6e4dd] text-[11px] text-[#7c8783] text-left">
                <th className="py-2 pr-3">Unit Name</th>
                <th className="py-2 pr-3">Plate</th>
                <th className="py-2 pr-3">Year</th>
                <th className="py-2 pr-3">Acquired Date</th>
                <th className="py-2 pr-3">Days in Stock</th>
                <th className="py-2 text-right">Cost Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e4dd]">
              {longestStock.map((u) => (
                <tr key={u.id} className="hover:bg-[#fcfbf9] transition-colors">
                  <td className="py-2.5 pr-3 font-medium text-[#16211f]">{u.name}</td>
                  <td className="py-2.5 pr-3 text-[#7c8783] font-mono text-[11.5px]">{u.plate || "—"}</td>
                  <td className="py-2.5 pr-3 text-[#7c8783]">{u.year || "—"}</td>
                  <td className="py-2.5 pr-3 text-[#7c8783]">{fmtDate(u.dateAcquired)}</td>
                  <td className="py-2.5 pr-3">{renderBadge(u.days)}</td>
                  <td className="py-2.5 text-right font-semibold text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {rupiah(u.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
