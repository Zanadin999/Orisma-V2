import React, { useMemo, useState } from "react";
import { fmtShortDate } from "../../utils/pricing";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { Layers } from "lucide-react";

const BRAND_COLORS = {
  honda: "#0e3b3a",
  yamaha: "#0d9488",
  suzuki: "#10b981",
  kawasaki: "#f59e0b",
  vespa: "#ec4899",
  lainnya: "#6b7280",
};

export default function SalesChart({ transactions }) {
  const { getCategory } = useCategoriesContext();
  const [limit, setLimit] = useState(15);
  const [stacked, setStacked] = useState(true);

  // Group last N transactions by date, stacked by brand
  const { buckets, maxTotal, niceMax, yTicks, brandKeys } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { buckets: [], maxTotal: 1, niceMax: 1, yTicks: [], brandKeys: [] };
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

    // Calculate nice max & evenly spaced 4-5 ticks
    let niceMax = maxTotal;
    let ticks = [];
    if (maxTotal <= 4) {
      niceMax = maxTotal;
      ticks = Array.from({ length: maxTotal }, (_, i) => maxTotal - i);
    } else {
      const step = Math.ceil(maxTotal / 4);
      niceMax = step * 4;
      ticks = [step * 4, step * 3, step * 2, step * 1];
    }

    const brandKeys = [...new Set(recent.map(t => getCategory(t.category).key))];
    return { buckets, maxTotal, niceMax, yTicks: ticks, brandKeys };
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

      {/* Main Chart Section */}
      <div className="relative overflow-x-auto pb-2">
        <div className="min-w-[600px] pt-4">
          {/* Plot container with Solid L-Shaped Axis Frame */}
          <div className="relative h-48 border-l-2 border-b-2 border-slate-700 ml-9 mr-2">
            {/* Horizontal Dashed Grid Lines (Positioned by exact Y percentage) */}
            {yTicks.map(t => (
              <div
                key={t}
                className="absolute left-0 right-0 border-t border-dashed border-slate-200 pointer-events-none flex items-center"
                style={{ bottom: `${(t / niceMax) * 100}%` }}
              >
                <span className="absolute -left-8 text-[10px] font-bold text-slate-600 font-mono w-6 text-right -translate-y-1/2 select-none">
                  {t}
                </span>
              </div>
            ))}

            {/* Zero Baseline Tick Label */}
            <span className="absolute -left-8 -bottom-2 text-[10px] font-bold text-slate-700 font-mono w-6 text-right pointer-events-none select-none">
              0
            </span>

            {/* Bars Container (Sharp Flat Blocks inside L-Frame) */}
            <div className="relative z-10 flex items-end justify-around gap-2 h-full px-2">
              {buckets.map(b => {
                const heightPct = Math.round((b.total / niceMax) * 100);
                const brandEntries = stacked ? Object.entries(b.byBrand) : [["total", b.total]];

                return (
                  <div
                    key={b.date}
                    className="flex flex-col items-center justify-end h-full group cursor-pointer relative w-10 shrink-0"
                  >
                    {/* Number Badge Sits Dynamically Above Top Edge of Bar */}
                    <span className="text-[10px] font-bold text-[#0e3b3a] bg-white border border-slate-200 shadow-xs px-1.5 py-0.5 mb-1 font-mono group-hover:bg-[#0e3b3a] group-hover:text-white transition-all whitespace-nowrap">
                      {b.total}
                    </span>

                    {/* Uniform Sharp Flat Block Bar (rounded-none) */}
                    <div
                      className="w-10 rounded-none overflow-hidden flex flex-col-reverse shadow-xs group-hover:shadow-md transition-all"
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Labels below X-Axis Baseline */}
          <div className="flex justify-around ml-9 mr-2 mt-2 text-[10.5px] font-medium text-[#7c8783]">
            {buckets.map(b => (
              <div key={b.date} className="w-10 text-center truncate">
                {fmtShortDate(b.date)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Legend */}
      {stacked && brandKeys.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-[#e6e4dd]">
          {brandKeys.map(k => (
            <div key={k} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-none" style={{ background: BRAND_COLORS[k] || "#6b7280" }} />
              <span className="font-medium capitalize text-[#16211f]">{k}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
