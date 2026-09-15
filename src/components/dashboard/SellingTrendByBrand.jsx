import React, { useMemo, useState } from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { rupiah } from "../../utils/pricing";

const COLORS = ["#0e3b3a", "#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];

export default function SellingTrendByBrand({ transactions }) {
  const { getCategory } = useCategoriesContext();
  const [chartType, setChartType] = useState("bar");
  const [metric, setMetric] = useState("count"); // count | revenue

  const rows = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const b = getCategory(t.category);
      if (!map[b.key]) map[b.key] = { key: b.key, label: b.label, count: 0, revenue: 0 };
      map[b.key].count += 1;
      map[b.key].revenue += t.sellingPrice || 0;
    });
    const arr = Object.values(map).sort((a, b) => (metric === "revenue" ? b.revenue - a.revenue : b.count - a.count));
    return arr;
  }, [transactions, getCategory, metric]);

  const total = rows.reduce((s, r) => s + (metric === "revenue" ? r.revenue : r.count), 0);
  const max = Math.max(...rows.map(r => (metric === "revenue" ? r.revenue : r.count)), 1);

  const pareto = useMemo(() => {
    let cum = 0;
    return rows.map(r => {
      const val = metric === "revenue" ? r.revenue : r.count;
      cum += val;
      return { ...r, val, cumPct: total ? Math.round((cum / total) * 100) : 0 };
    });
  }, [rows, metric, total]);

  function renderBar() {
    return (
      <div className="space-y-3">
        {rows.length === 0 ? <div className="text-[13px] text-[#7c8783]">No sales yet.</div> : rows.map((r, i) => {
          const val = metric === "revenue" ? r.revenue : r.count;
          return (
            <div key={r.key}>
              <div className="flex items-center justify-between mb-1 text-[12.5px]">
                <span className="font-medium">{r.label}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{metric === "revenue" ? rupiah(val) : `${val} sold`}</span>
              </div>
              <div className="w-full h-2.5 rounded bg-[#edece7] overflow-hidden">
                <div className="h-full" style={{ width: `${Math.round((val / max) * 100)}%`, background: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderPie() {
    if (rows.length === 0) return <div className="text-[13px] text-[#7c8783]">No sales yet.</div>;
    let angle = 0;
    const cx = 80, cy = 80, r = 70;
    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0">
          {rows.map((row, i) => {
            const val = metric === "revenue" ? row.revenue : row.count;
            const pct = val / total;
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
          {rows.map((r, i) => {
            const val = metric === "revenue" ? r.revenue : r.count;
            return (
              <div key={r.key} className="flex items-center gap-2 text-[12px]">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="font-medium">{r.label}</span>
                <span className="text-[#7c8783]">{metric === "revenue" ? rupiah(val) : val}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderPareto() {
    if (rows.length === 0) return <div className="text-[13px] text-[#7c8783]">No sales yet.</div>;
    return (
      <div className="relative">
        <div className="flex items-end gap-1.5 h-40 px-1">
          {pareto.map((r, i) => (
            <div key={r.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t" style={{ height: `${Math.max(8, (r.val / max) * 110)}px`, background: COLORS[i % COLORS.length] }} />
              <span className="text-[10px] text-[#7c8783] truncate w-full text-center">{r.label.slice(0, 8)}</span>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-40 pointer-events-none" preserveAspectRatio="none" style={{ top: 0 }}>
          <polyline fill="none" stroke="#0e3b3a" strokeWidth="1.5" points={pareto.map((r, i) => `${(i / Math.max(1, pareto.length - 1)) * 100},${100 - (r.cumPct / 100) * 80 - 10}`).join(" ")} />
          {pareto.map((r, i) => <circle key={r.key} cx={(i / Math.max(1, pareto.length - 1)) * 100} cy={100 - (r.cumPct / 100) * 80 - 10} r="1.5" fill="#0e3b3a" />)}
        </svg>
        <div className="flex justify-between text-[10px] text-[#0e3b3a] mt-1 px-1"><span>0%</span><span>100% cum</span></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-semibold">Selling Trend by Brand</div>
        <div className="flex items-center gap-1.5">
          <select value={metric} onChange={e => setMetric(e.target.value)} className="border border-[#e6e4dd] rounded-lg px-2 py-1 text-[11px] outline-none bg-white">
            <option value="count">Units</option>
            <option value="revenue">Revenue</option>
          </select>
          <div className="flex items-center gap-1 border border-[#e6e4dd] rounded-lg p-0.5">
            {[{ key: "bar", icon: BarChart3 }, { key: "pie", icon: PieChart }, { key: "pareto", icon: TrendingUp }].map(t => {
              const Icon = t.icon;
              return <button key={t.key} onClick={() => setChartType(t.key)} className={`p-1.5 rounded ${chartType === t.key ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"}`}><Icon size={14} /></button>;
            })}
          </div>
        </div>
      </div>
      {chartType === "bar" ? renderBar() : chartType === "pie" ? renderPie() : renderPareto()}
    </div>
  );
}
