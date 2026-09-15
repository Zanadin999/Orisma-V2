import React, { useMemo, useState } from "react";
import { fmtShortDate } from "../../utils/pricing";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { BarChart3, Layers } from "lucide-react";

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
    const recent = [...transactions].sort((a, b) => a.soldDate.localeCompare(b.soldDate)).slice(-limit);
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
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px] bg-white">
            {[10,15,20,25,30].map(n => <option key={n} value={n}>{n} transactions</option>)}
          </select>
        </div>
        <div className="text-[13px] text-[#7c8783]">No sales logged yet.</div>
      </div>
    );
  }

  const barHeight = 130;

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] font-semibold">Sales Trend — Units Sold per Day</div>
          <div className="text-[11px] text-[#7c8783]">X: Date • Y: Total sold (stacked by Brand) • dots = total</div>
        </div>
        <div className="flex items-center gap-2">
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px] bg-white outline-none">
            {[10,15,20,25,30].map(n => <option key={n} value={n}>{n} tx</option>)}
          </select>
          <button
            onClick={() => setStacked(!stacked)}
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-[11px] ${stacked ? "bg-[#0e3b3a] text-white border-[#0e3b3a]" : "border-[#e6e4dd] text-[#7c8783] hover:bg-[#f6f5f1]"}`}
            title="Toggle stacked by brand"
          >
            <Layers size={12} /> {stacked ? "Stacked" : "Total"}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-[#7c8783] pr-1" style={{ height: barHeight }}>
          <span>{maxTotal}</span>
          <span>{Math.round(maxTotal/2)}</span>
          <span>0</span>
        </div>

        <div className="ml-6">
          <div className="relative flex items-end gap-1.5" style={{ height: barHeight }}>
            {/* grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-[#edece7] w-full" />
              <div className="border-t border-dashed border-[#edece7] w-full" />
              <div className="border-t border-[#edece7] w-full" />
            </div>

            {buckets.map((b, idx) => {
              const brandEntries = stacked ? Object.entries(b.byBrand) : [["total", b.total]];
              // stacked segments
              let cum = 0;
              return (
                <div key={b.date} className="flex-1 flex flex-col items-center gap-1 relative" style={{ height: barHeight }}>
                  {/* bar */}
                  <div className="flex-1 w-full flex flex-col justify-end items-center" style={{ height: barHeight }}>
                    <div className="w-full flex flex-col-reverse rounded-t overflow-hidden border border-[#edece7]" style={{ height: `${Math.max(6, (b.total / maxTotal) * barHeight)}px` }}>
                      {brandEntries.map(([key, cnt]) => {
                        const h = (cnt / b.total) * 100;
                        const color = stacked ? (BRAND_COLORS[key] || "#6b7280") : "#0e3b3a";
                        return <div key={key} style={{ height: `${h}%`, background: color }} title={`${key}: ${cnt}`} />;
                      })}
                    </div>
                  </div>
                  {/* dot for total */}
                  <div
                    className="absolute w-2 h-2 rounded-full bg-[#0e3b3a] border-2 border-white shadow"
                    style={{ bottom: `${(b.total / maxTotal) * barHeight - 4}px`, left: "50%", transform: "translateX(-50%)" }}
                    title={`Total: ${b.total} on ${b.date}`}
                  />
                  {/* value label */}
                  <span className="text-[10px] font-semibold text-[#0e3b3a] -mt-1">{b.total}</span>
                </div>
              );
            })}
          </div>

          {/* X labels */}
          <div className="flex gap-1.5 mt-1.5">
            {buckets.map(b => (
              <div key={b.date} className="flex-1 text-center text-[10px] text-[#7c8783] truncate">
                {fmtShortDate(b.date)}
              </div>
            ))}
          </div>

          {/* line connecting totals */}
          <svg viewBox="0 0 100 100" className="absolute pointer-events-none" preserveAspectRatio="none" style={{ left: 24, right: 0, top: 0, height: barHeight }}>
            <polyline
              fill="none"
              stroke="#0e3b3a"
              strokeWidth="0.7"
              strokeDasharray="1.5 1"
              opacity="0.6"
              points={buckets.map((b, i) => {
                const x = buckets.length === 1 ? 50 : (i / (buckets.length - 1)) * 100;
                const y = 100 - (b.total / maxTotal) * 100;
                return `${x},${y}`;
              }).join(" ")}
            />
          </svg>
        </div>
      </div>

      {/* Brand legend */}
      {stacked && brandKeys.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {brandKeys.map(k => (
            <div key={k} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BRAND_COLORS[k] || "#6b7280" }} />
              <span className="font-medium capitalize">{k}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
