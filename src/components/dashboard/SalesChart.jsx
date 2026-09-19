import React, { useMemo, useState } from "react";
import { fmtShortDate } from "../../utils/pricing";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { Layers } from "lucide-react";

const BRAND_COLORS = {
  honda: "#ef4444",
  yamaha: "#3b82f6",
  suzuki: "#f59e0b",
  kawasaki: "#10b981",
  vespa: "#ec4899",
  lainnya: "#6b7280",
};

export default function SalesChart({ transactions }) {
  const { getCategory } = useCategoriesContext();
  const [limit, setLimit] = useState(15);
  const [stacked, setStacked] = useState(true);

  // Group last N transactions by date, stacked by brand
  const { buckets, maxTotal, brandKeys } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { buckets: [], maxTotal: 1, brandKeys: [] };
    }
    const recent = [...transactions].sort((a, b) => (a.soldDate || "").localeCompare(b.soldDate || "")).slice(-limit);
    const map = {};
    recent.forEach(t => {
      const d = t.soldDate || "unknown";
      if (!map[d]) map[d] = { date: d, total: 0, byBrand: {} };
      map[d].total += 1;
      const key = getCategory(t.category).key;
      map[d].byBrand[key] = (map[d].byBrand[key] || 0) + 1;
    });
    const buckets = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    const maxTotal = Math.max(...buckets.map(b => b.total), 1);
    const brandKeys = [...new Set(recent.map(t => getCategory(t.category).key))];
    return { buckets, maxTotal, brandKeys };
  }, [transactions, limit, getCategory]);

  if (buckets.length === 0) {
    return (
      <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-semibold">Sales Trend — Units Sold per Day</div>
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px] bg-white"
          >
            {[10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} transactions</option>)}
          </select>
        </div>
        <div className="text-[13px] text-[#7c8783]">No sales logged yet.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] font-semibold">Sales Trend — Units Sold per Day</div>
          <div className="text-[11px] text-[#7c8783]">
            X: Date • Y: Total units sold ({stacked ? "stacked by brand" : "total"})
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px] bg-white outline-none font-medium cursor-pointer"
          >
            {[10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} tx</option>)}
          </select>
          <button
            onClick={() => setStacked(!stacked)}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              stacked
                ? "bg-[#0e3b3a] text-white border-[#0e3b3a]"
                : "border-[#e6e4dd] text-[#7c8783] hover:bg-[#f6f5f1]"
            }`}
            title="Toggle stacked by brand"
          >
            <Layers size={12} /> {stacked ? "Stacked" : "Total"}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        {/* Y Axis Grid lines */}
        <div className="relative h-44 pt-6 pb-6">
          <div className="absolute inset-x-0 top-6 bottom-6 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-[#edece7] w-full" />
            <div className="border-t border-dashed border-[#edece7] w-full" />
            <div className="border-t border-[#edece7] w-full" />
          </div>

          {/* Columns Container */}
          <div className="flex items-end gap-2 h-full px-2 relative z-10">
            {buckets.map((b) => {
              const heightPct = Math.max(12, Math.round((b.total / maxTotal) * 100));
              const brandEntries = stacked ? Object.entries(b.byBrand) : [["total", b.total]];

              return (
                <div
                  key={b.date}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                >
                  {/* Total Count Label ABOVE Bar */}
                  <span
                    className="text-[11px] font-bold text-[#0e3b3a] mb-1 group-hover:scale-110 transition-transform"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {b.total}
                  </span>

                  {/* Stacked Bar Column */}
                  <div
                    className="w-full rounded-t overflow-hidden border border-[#e6e4dd] flex flex-col-reverse transition-all shadow-xs group-hover:shadow-md"
                    style={{ height: `${heightPct}%` }}
                  >
                    {brandEntries.map(([key, cnt]) => {
                      const hPct = (cnt / b.total) * 100;
                      const color = stacked ? (BRAND_COLORS[key] || "#6b7280") : "#0e3b3a";
                      return (
                        <div
                          key={key}
                          style={{ height: `${hPct}%`, background: color }}
                          title={`${key.toUpperCase()}: ${cnt} unit sold on ${b.date}`}
                        />
                      );
                    })}
                  </div>

                  {/* Date Label BELOW Bar */}
                  <div className="text-[10.5px] font-medium text-[#7c8783] mt-2 truncate w-full text-center">
                    {fmtShortDate(b.date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brand Legend */}
      {stacked && brandKeys.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-[#e6e4dd]">
          {brandKeys.map(k => (
            <div key={k} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ background: BRAND_COLORS[k] || "#6b7280" }} />
              <span className="font-medium capitalize text-[#16211f]">{k}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
