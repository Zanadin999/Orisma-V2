import React, { useMemo, useState } from "react";
import { rupiah, rupiahCompact, fmtShortDate } from "../../utils/pricing";
import { BarChart3, LineChart, AreaChart } from "lucide-react";

const CHART_METRICS = [
  { key: "sellingPrice", label: "Revenue", color: "bg-blue-500", colorLast: "bg-blue-700" },
  { key: "grossProfit", label: "Gross Profit", color: "bg-emerald-500", colorLast: "bg-emerald-700" },
  { key: "netIncome", label: "Net Income", color: "bg-green-500", colorLast: "bg-green-700" },
];

const CHART_TYPES = [
  { key: "bar", label: "Bar", icon: BarChart3 },
  { key: "line", label: "Line", icon: LineChart },
  { key: "area", label: "Area", icon: AreaChart },
];

export default function RevenueChart({ transactions }) {
  const [metric, setMetric] = useState("sellingPrice");
  const [chartType, setChartType] = useState("bar");
  const [limit, setLimit] = useState(10);
  
  const recent = useMemo(
    () => [...transactions].sort((a, b) => a.soldDate.localeCompare(b.soldDate)).slice(-limit),
    [transactions, limit]
  );
  
  const selectedMetric = CHART_METRICS.find(m => m.key === metric) || CHART_METRICS[0];
  const max = Math.max(...recent.map(s => s[metric] || 0), 1);

  const avgMetric = useMemo(() => {
    if (!recent || recent.length === 0) return 0;
    const total = recent.reduce((sum, s) => sum + (s[metric] || 0), 0);
    return Math.round(total / recent.length);
  }, [recent, metric]);

  function renderBar(s, i) {
    const val = s[metric] || 0;
    return (
      <div key={s.id} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${s.name} — ${rupiah(val)}`}>
        <span className="text-[10px] font-semibold text-[#0e3b3a] truncate max-w-full" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {rupiahCompact(val)}
        </span>
        <div
          className={`w-full rounded-t-md transition-all ${i === recent.length - 1 ? selectedMetric.colorLast : selectedMetric.color}`}
          style={{ height: `${Math.max(8, Math.round((val / max) * 115))}px` }}
        />
        <div className="text-[11px] text-[#7c8783] font-medium">{fmtShortDate(s.soldDate)}</div>
      </div>
    );
  }

  function renderChart() {
    if (recent.length === 0) {
      return <div className="text-[13px] text-[#7c8783]">No sales in selected timeframe.</div>;
    }

    if (chartType === "bar") {
      return (
        <div className="flex items-end gap-2.5 h-44 px-1 pt-2">
          {recent.map((s, i) => renderBar(s, i))}
        </div>
      );
    }

    if (chartType === "line") {
      const points = recent.map((s, i) => ({
        x: recent.length === 1 ? 50 : (i / (recent.length - 1)) * 90 + 5,
        y: 85 - ((s[metric] || 0) / max) * 65,
        value: s[metric] || 0,
        date: s.soldDate,
        name: s.name,
      }));

      const pathData = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ');

      return (
        <div className="relative h-44 pt-2">
          <svg viewBox="0 0 100 100" className="w-full h-36" preserveAspectRatio="none">
            <path
              d={pathData}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={selectedMetric.color.replace('bg-', 'text-')}
            />
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="2.5"
                  className={i === points.length - 1 ? selectedMetric.colorLast.replace('bg-', 'fill-') : selectedMetric.color.replace('bg-', 'fill-')}
                  title={`${recent[i].name} — ${rupiah(p.value)}`}
                />
                <text
                  x={p.x}
                  y={p.y - 4}
                  textAnchor="middle"
                  fontSize="3.2"
                  fontWeight="bold"
                  fill="#0e3b3a"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {rupiahCompact(p.value)}
                </text>
              </g>
            ))}
          </svg>
          <div className="flex justify-between mt-1 px-1">
            {recent.map((s, i) => (
              <div key={s.id} className="text-[11px] text-[#7c8783] flex-1 text-center font-medium">
                {i % Math.ceil(recent.length / 5) === 0 ? fmtShortDate(s.soldDate) : ''}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (chartType === "area") {
      const points = recent.map((s, i) => ({
        x: recent.length === 1 ? 50 : (i / (recent.length - 1)) * 90 + 5,
        y: 85 - ((s[metric] || 0) / max) * 65,
        value: s[metric] || 0,
        date: s.soldDate,
        name: s.name,
      }));

      const pathData = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ') + ` L ${points[points.length - 1].x} 95 L ${points[0].x} 95 Z`;

      return (
        <div className="relative h-44 pt-2">
          <svg viewBox="0 0 100 100" className="w-full h-36" preserveAspectRatio="none">
            <path
              d={pathData}
              className={selectedMetric.color.replace('bg-', 'fill-')}
              opacity="0.25"
            />
            <path
              d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={selectedMetric.color.replace('bg-', 'text-')}
            />
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="2.5"
                  className={i === points.length - 1 ? selectedMetric.colorLast.replace('bg-', 'fill-') : selectedMetric.color.replace('bg-', 'fill-')}
                  title={`${recent[i].name} — ${rupiah(p.value)}`}
                />
                <text
                  x={p.x}
                  y={p.y - 4}
                  textAnchor="middle"
                  fontSize="3.2"
                  fontWeight="bold"
                  fill="#0e3b3a"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {rupiahCompact(p.value)}
                </text>
              </g>
            ))}
          </svg>
          <div className="flex justify-between mt-1 px-1">
            {recent.map((s, i) => (
              <div key={s.id} className="text-[11px] text-[#7c8783] flex-1 text-center font-medium">
                {i % Math.ceil(recent.length / 5) === 0 ? fmtShortDate(s.soldDate) : ''}
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[13px] font-semibold">Revenue trend, last {recent.length} transaction{recent.length === 1 ? "" : "s"}</div>
          <div className="text-[11.5px] text-[#7c8783] flex items-center gap-1.5 mt-0.5">
            <span>Rata-rata {selectedMetric.label}:</span>
            <span className="font-semibold text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {rupiah(avgMetric)}
            </span>
            <span className="text-[10px] text-[#94a09c]">/ transaksi</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px] outline-none bg-white">
            {[10,15,20,25,30].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <div className="flex items-center gap-1 border border-[#e6e4dd] rounded-lg p-0.5">
            {CHART_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => setChartType(type.key)}
                  className={`p-1.5 rounded ${chartType === type.key ? 'bg-[#0e3b3a] text-white' : 'text-[#7c8783] hover:bg-[#f6f5f1]'}`}
                  title={type.label}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          <select
            value={metric}
            onChange={e => setMetric(e.target.value)}
            className="border border-[#e6e4dd] rounded-lg px-2.5 py-1 text-[12px] outline-none focus:border-teal-600 bg-white"
          >
            {CHART_METRICS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {renderChart()}
    </div>
  );
}

