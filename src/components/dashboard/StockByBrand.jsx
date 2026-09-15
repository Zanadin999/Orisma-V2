import React, { useMemo, useState } from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { UNCATEGORIZED } from "../../data/brands";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

const COLORS = ["#0e3b3a", "#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];

export default function StockByBrand({ availableUnits }) {
  const { categories: brands, getCategory } = useCategoriesContext();
  const [chartType, setChartType] = useState("bar");

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

  const total = rows.reduce((s, r) => s + r.count, 0);
  const max = Math.max(...rows.map(r => r.count), 1);

  // Pareto data: cumulative %
  const pareto = useMemo(() => {
    let cum = 0;
    return rows.map(r => {
      cum += r.count;
      return { ...r, cumPct: total ? Math.round((cum / total) * 100) : 0 };
    });
  }, [rows, total]);

  function renderBar() {
    return (
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.key}>
            <div className="flex items-center justify-between mb-1 text-[12.5px]">
              <span className="font-medium">{r.label}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{r.count} ({Math.round((r.count/total)*100)}%)</span>
            </div>
            <div className="w-full h-2.5 rounded bg-[#edece7] overflow-hidden">
              <div className="h-full" style={{ width: `${Math.round((r.count / max) * 100)}%`, background: COLORS[i % COLORS.length] }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderPie() {
    if (rows.length === 0) return null;
    let angle = 0;
    const cx = 80, cy = 80, r = 70;
    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0">
          {rows.map((row, i) => {
            const pct = row.count / total;
            const sweep = pct * 360;
            const startAngle = angle;
            const endAngle = angle + sweep;
            angle = endAngle;
            const largeArc = sweep > 180 ? 1 : 0;
            const x1 = cx + r * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = cy + r * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = cx + r * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = cy + r * Math.sin((endAngle - 90) * Math.PI / 180);
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            return <path key={row.key} d={path} fill={COLORS[i % COLORS.length]} />;
          })}
        </svg>
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div key={r.key} className="flex items-center gap-2 text-[12px]">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="font-medium">{r.label}</span>
              <span className="text-[#7c8783]">{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderPareto() {
    const maxCum = 100;
    return (
      <div className="relative">
        <div className="flex items-end gap-1.5 h-40 px-1">
          {pareto.map((r, i) => (
            <div key={r.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t" style={{ height: `${Math.max(8, (r.count / max) * 110)}px`, background: COLORS[i % COLORS.length] }} />
              <span className="text-[10px] text-[#7c8783] truncate w-full text-center">{r.label.slice(0,8)}</span>
            </div>
          ))}
        </div>
        {/* cumulative line */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-40 pointer-events-none" preserveAspectRatio="none" style={{ top: 0 }}>
          <polyline
            fill="none"
            stroke="#0e3b3a"
            strokeWidth="1.5"
            points={pareto.map((r, i) => `${(i / Math.max(1, pareto.length - 1)) * 100},${100 - (r.cumPct / maxCum) * 80 - 10}`).join(" ")}
          />
          {pareto.map((r, i) => (
            <circle key={r.key} cx={(i / Math.max(1, pareto.length - 1)) * 100} cy={100 - (r.cumPct / maxCum) * 80 - 10} r="1.5" fill="#0e3b3a" />
          ))}
        </svg>
        <div className="flex justify-between text-[10px] text-[#0e3b3a] mt-1 px-1">
          <span>0%</span><span>100% cum</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-semibold">Stock by Brand</div>
        <div className="flex items-center gap-1 border border-[#e6e4dd] rounded-lg p-0.5">
          {[
            { key: "bar", icon: BarChart3, label: "Bar" },
            { key: "pie", icon: PieChart, label: "Pie" },
            { key: "pareto", icon: TrendingUp, label: "Pareto" },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setChartType(t.key)} className={`p-1.5 rounded ${chartType === t.key ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"}`} title={t.label}>
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </div>
      {rows.length === 0 ? <div className="text-[13px] text-[#7c8783]">No stock recorded yet.</div> : chartType === "bar" ? renderBar() : chartType === "pie" ? renderPie() : renderPareto()}
    </div>
  );
}
