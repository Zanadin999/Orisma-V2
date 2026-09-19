import React, { useMemo, useState } from "react";
import { rupiah, rupiahCompact, fmtShortDate } from "../../utils/pricing";
import { BarChart3, LineChart, AreaChart, Layers, Filter, Calendar, X } from "lucide-react";
import { useCategoriesContext } from "../../context/CategoriesContext";

export default function RevenueChart({ transactions }) {
  const { categories: brandCategories } = useCategoriesContext();
  const [chartType, setChartType] = useState("dual"); // dual | bar | line | area
  const [aggregation, setAggregation] = useState("sale"); // sale | daily | weekly | monthly
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [limit, setLimit] = useState(10);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [inspectorData, setInspectorData] = useState(null);

  // Filter transactions by brand
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (selectedBrand === "all") return transactions;
    return transactions.filter(t => (t.category || "").toLowerCase() === selectedBrand.toLowerCase());
  }, [transactions, selectedBrand]);

  // Aggregate data by time period
  const aggregatedData = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => (a.soldDate || "").localeCompare(b.soldDate || ""));

    if (aggregation === "sale") {
      return sorted.slice(-limit).map((t, idx) => ({
        id: `sale-${t.id || idx}`,
        label: fmtShortDate(t.soldDate),
        date: t.soldDate,
        revenue: Number(t.sellingPrice) || 0,
        netIncome: Number(t.netIncome) || 0,
        grossProfit: Number(t.grossProfit) || 0,
        count: 1,
        items: [t],
      }));
    }

    const groups = {};
    sorted.forEach((t, idx) => {
      let key = t.soldDate || "undated";
      let label = fmtShortDate(t.soldDate);

      if (aggregation === "monthly") {
        key = (t.soldDate || "").slice(0, 7) || "monthly";
        const d = new Date((t.soldDate || "") + "T00:00:00");
        label = isNaN(d.getTime()) ? key : d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      } else if (aggregation === "weekly") {
        const d = new Date((t.soldDate || "") + "T00:00:00");
        if (!isNaN(d.getTime())) {
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(d.setDate(diff));
          key = monday.toISOString().slice(0, 10);
          label = `Wk ${fmtShortDate(key)}`;
        }
      }

      if (!groups[key]) {
        groups[key] = {
          id: `grp-${key}`,
          label,
          date: key,
          revenue: 0,
          netIncome: 0,
          grossProfit: 0,
          count: 0,
          items: [],
        };
      }
      groups[key].revenue += Number(t.sellingPrice) || 0;
      groups[key].netIncome += Number(t.netIncome) || 0;
      groups[key].grossProfit += Number(t.grossProfit) || 0;
      groups[key].count += 1;
      groups[key].items.push(t);
    });

    return Object.values(groups).slice(-limit);
  }, [filteredTransactions, aggregation, limit]);

  // Overall metric summary
  const summaryMetrics = useMemo(() => {
    const totalRev = aggregatedData.reduce((sum, d) => sum + d.revenue, 0);
    const totalNet = aggregatedData.reduce((sum, d) => sum + d.netIncome, 0);
    const avgRev = aggregatedData.length > 0 ? Math.round(totalRev / aggregatedData.length) : 0;
    const marginPct = totalRev > 0 ? ((totalNet / totalRev) * 100).toFixed(1) : "0.0";

    return { totalRev, totalNet, avgRev, marginPct };
  }, [aggregatedData]);

  const maxRev = Math.max(...aggregatedData.map(d => d.revenue), 1);

  // Net Income scaling (including negative profit)
  const { minNet, maxNet, netRange } = useMemo(() => {
    const nets = aggregatedData.map(d => d.netIncome);
    const minN = Math.min(0, ...nets);
    const maxN = Math.max(1, ...nets);
    const range = (maxN - minN) || 1;
    return { minNet: minN, maxNet: maxN, netRange: range };
  }, [aggregatedData]);

  // Zero-line baseline percentage in SVG coordinates (0-100)
  const zeroYPct = useMemo(() => {
    return 80 - ((0 - minNet) / netRange) * 60;
  }, [minNet, netRange]);

  // Brand dropdown list
  const availableBrands = useMemo(() => {
    const fromTx = new Set(transactions.map(t => (t.category || "").toLowerCase()).filter(Boolean));
    const list = [{ key: "all", label: "Semua Brand" }];
    brandCategories.forEach(b => {
      list.push({ key: b.key, label: b.label });
      fromTx.delete(b.key.toLowerCase());
    });
    fromTx.forEach(b => {
      list.push({ key: b, label: b.toUpperCase() });
    });
    return list;
  }, [transactions, brandCategories]);

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 relative select-none">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold">Revenue & Profit Performance</h3>
            <span
              className={`px-2.5 py-0.5 text-[10.5px] font-semibold border rounded-full ${
                Number(summaryMetrics.marginPct) < 0
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-teal-50 text-teal-700 border-teal-200"
              }`}
            >
              Margin: {summaryMetrics.marginPct}%
            </span>
          </div>
          <div className="text-[11.5px] text-[#7c8783] flex items-center gap-2 mt-0.5 flex-wrap">
            <span>Rata-rata Revenue: <strong className="text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(summaryMetrics.avgRev)}</strong></span>
            <span>•</span>
            <span>{aggregatedData.length} data point ({aggregation})</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Brand Filter */}
          <div className="flex items-center gap-1 bg-[#f6f5f1] border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px]">
            <Filter size={12} className="text-[#7c8783]" />
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="bg-transparent outline-none text-[#16211f] font-medium cursor-pointer"
            >
              {availableBrands.map(b => (
                <option key={b.key} value={b.key}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Time Aggregation Selector */}
          <div className="flex items-center gap-1 bg-[#f6f5f1] border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px]">
            <Calendar size={12} className="text-[#7c8783]" />
            <select
              value={aggregation}
              onChange={e => setAggregation(e.target.value)}
              className="bg-transparent outline-none text-[#16211f] font-medium cursor-pointer"
            >
              <option value="sale">Per Sale</option>
              <option value="daily">Harian (Daily)</option>
              <option value="weekly">Mingguan (Weekly)</option>
              <option value="monthly">Bulanan (Monthly)</option>
            </select>
          </div>

          {/* Limit dropdown */}
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="border border-[#e6e4dd] rounded-lg px-2 py-1 text-[12px] outline-none bg-white font-medium cursor-pointer"
          >
            {[10, 15, 20, 25, 30].map(n => (
              <option key={n} value={n}>{n} Points</option>
            ))}
          </select>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 border border-[#e6e4dd] rounded-lg p-0.5 bg-white">
            <button
              onClick={() => setChartType("dual")}
              className={`px-2 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-all cursor-pointer ${
                chartType === "dual" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Dual-Metric Overlay (Revenue Bars + Net Profit Line)"
            >
              <Layers size={13} /> Dual
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                chartType === "bar" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Bar Chart"
            >
              <BarChart3 size={14} />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                chartType === "line" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Line Chart"
            >
              <LineChart size={14} />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                chartType === "area" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Area Chart"
            >
              <AreaChart size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      {aggregatedData.length === 0 ? (
        <div className="text-[13px] text-[#7c8783] py-12 text-center border border-dashed border-[#e6e4dd] rounded-lg">
          Tidak ada data transaksi untuk filter yang dipilih.
        </div>
      ) : (
        <div className="relative pt-2 pb-1">
          {/* Legend */}
          <div className="flex items-center justify-end gap-5 text-[11px] text-[#7c8783] mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-400 inline-block" />
              <span>Revenue (Omzet)</span>
            </div>
            {(chartType === "dual" || chartType === "line") && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#047857] inline-block" />
                <span>Net Income (Profit Bersih)</span>
              </div>
            )}
            {minNet < 0 && (
              <div className="flex items-center gap-1">
                <span className="w-3 border-b border-dashed border-red-400 inline-block" />
                <span className="text-red-600 font-medium">Garit Zero Baseline</span>
              </div>
            )}
          </div>

          {/* MAIN CHART CONTAINER */}
          <div className="relative h-64 border-b border-[#e6e4dd] pb-6">
            {/* Revenue Bars */}
            <div className="flex items-end gap-2 h-full px-4 relative z-0">
              {aggregatedData.map((d, idx) => {
                const heightPct = Math.max(6, Math.round((d.revenue / maxRev) * 75));
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={d.id}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setInspectorData(d)}
                    className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group relative"
                  >
                    {/* Bar Revenue Value Label (Clean HTML) */}
                    <span
                      className={`text-[10px] font-semibold text-[#0e3b3a] mb-1 truncate max-w-full transition-all ${
                        isHovered ? "scale-110 font-bold" : ""
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {rupiahCompact(d.revenue)}
                    </span>

                    {/* Bar Column */}
                    <div
                      className={`w-full rounded-t-md transition-all shadow-xs ${
                        isHovered ? "bg-teal-500 shadow-md" : "bg-teal-400/80 group-hover:bg-teal-500"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* DUAL MODE: Net Income Line & Perfect Round Node Dots */}
            {(chartType === "dual" || chartType === "line" || chartType === "area") && (
              <div className="absolute inset-0 pointer-events-none px-4 z-10">
                {/* SVG for Line Path & Baseline */}
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {/* Dashed Zero Line ($y=0$) if negative net income exists */}
                  {minNet < 0 && (
                    <line
                      x1="0"
                      y1={zeroYPct}
                      x2="100"
                      y2={zeroYPct}
                      stroke="#ef4444"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                  )}

                  {/* Net Income Line Path */}
                  {(() => {
                    const points = aggregatedData.map((d, i) => ({
                      x: aggregatedData.length === 1 ? 50 : (i / (aggregatedData.length - 1)) * 90 + 5,
                      y: chartType === "dual"
                        ? 78 - ((d.netIncome - minNet) / netRange) * 55
                        : 78 - (d.revenue / maxRev) * 55,
                    }));
                    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

                    return (
                      <>
                        {chartType === "area" && (
                          <path
                            d={`${pathD} L ${points[points.length - 1].x} 95 L ${points[0].x} 95 Z`}
                            fill="#0d9488"
                            opacity="0.18"
                          />
                        )}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={chartType === "dual" ? "#047857" : "#0d9488"}
                          strokeWidth="2.5"
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    );
                  })()}
                </svg>

                {/* HTML Perfect 100% Round Circle Dots (No SVG Oval Distortion) */}
                {aggregatedData.map((d, idx) => {
                  const xPct = aggregatedData.length === 1 ? 50 : (idx / (aggregatedData.length - 1)) * 90 + 5;
                  const yPct = chartType === "dual"
                    ? 78 - ((d.netIncome - minNet) / netRange) * 55
                    : 78 - (d.revenue / maxRev) * 55;
                  const isNegative = d.netIncome < 0;
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={`dot-${d.id}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                      style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setInspectorData(d)}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white transition-all ${
                          isNegative ? "bg-red-600 ring-2 ring-red-200" : "bg-[#047857]"
                        } ${isHovered ? "scale-130 shadow-md" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hover Tooltip Card */}
            {hoveredIndex !== null && aggregatedData[hoveredIndex] && (
              <div
                className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full -top-2 bg-[#0e3b3a] text-white rounded-lg p-2.5 shadow-xl border border-teal-700/50 text-[11.5px] min-w-[150px]"
                style={{
                  left: `${
                    aggregatedData.length === 1
                      ? 50
                      : (hoveredIndex / (aggregatedData.length - 1)) * 90 + 5
                  }%`,
                }}
              >
                <div className="font-semibold border-b border-teal-800/80 pb-1 mb-1 flex items-center justify-between">
                  <span>{aggregatedData[hoveredIndex].label}</span>
                  <span className="text-[10px] text-teal-300 font-mono">
                    {aggregatedData[hoveredIndex].count} tx
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between gap-3 text-[#cfe6df]">
                    <span>Omzet:</span>
                    <strong className="text-white font-mono">{rupiah(aggregatedData[hoveredIndex].revenue)}</strong>
                  </div>
                  <div className="flex justify-between gap-3 text-[#cfe6df]">
                    <span>Net Profit:</span>
                    <strong
                      className={`font-mono ${
                        aggregatedData[hoveredIndex].netIncome < 0 ? "text-red-300 font-bold" : "text-emerald-300 font-bold"
                      }`}
                    >
                      {rupiah(aggregatedData[hoveredIndex].netIncome)}
                    </strong>
                  </div>
                </div>
                <div className="text-[9.5px] text-teal-200/70 mt-1 text-center font-medium">
                  Klik unit untuk detail transaksi
                </div>
              </div>
            )}
          </div>

          {/* Sub-Row: Date Labels & Separated Net Profit Badges */}
          <div className="flex justify-between px-4 pt-2 gap-1">
            {aggregatedData.map((d, idx) => {
              const isNegative = d.netIncome < 0;
              return (
                <div
                  key={`subrow-${d.id}`}
                  onClick={() => setInspectorData(d)}
                  className="flex-1 text-center cursor-pointer min-w-0"
                  title={`Klik detail ${d.label}`}
                >
                  <div className="text-[10.5px] font-medium text-[#7c8783] truncate">{d.label}</div>
                  {chartType === "dual" && (
                    <div className="mt-1 flex justify-center">
                      <span
                        className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded border inline-block truncate max-w-full font-mono ${
                          isNegative
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {isNegative ? "" : "+"}{rupiahCompact(d.netIncome)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Click-to-Drilldown Transaction Inspector Popover */}
      {inspectorData && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setInspectorData(null)}
        >
          <div
            className="bg-white rounded-xl p-5 w-full max-w-lg shadow-xl border border-[#e6e4dd]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e6e4dd] pb-3 mb-3">
              <div>
                <h4 className="text-[15px] font-semibold flex items-center gap-2">
                  <span>Detail Transaksi: {inspectorData.label}</span>
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-[#f6f5f1] border border-[#e6e4dd] rounded-md text-[#55605d]">
                    {inspectorData.items.length} Unit
                  </span>
                </h4>
                <div className="text-[11.5px] text-[#7c8783] mt-0.5">
                  Total Omzet: <strong className="text-[#0e3b3a]">{rupiah(inspectorData.revenue)}</strong> • Profit Bersih:{" "}
                  <strong className={inspectorData.netIncome < 0 ? "text-red-700" : "text-emerald-700"}>
                    {rupiah(inspectorData.netIncome)}
                  </strong>
                </div>
              </div>
              <button
                onClick={() => setInspectorData(null)}
                className="w-8 h-8 rounded-lg border border-[#e6e4dd] grid place-items-center hover:bg-[#f6f5f1] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#e6e4dd] text-[12.5px]">
              {inspectorData.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#fcfbf9] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[#16211f] truncate">{item.name}</div>
                    <div className="text-[11px] text-[#7c8783] flex items-center gap-2 mt-0.5">
                      <span>Plat: <strong className="font-mono text-[#16211f]">{item.plate || "—"}</strong></span>
                      <span>•</span>
                      <span>Pembeli: {item.buyerName || item.ownerName || "Pelanggan"}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {rupiah(item.sellingPrice)}
                    </div>
                    <div
                      className={`text-[10.5px] font-medium mt-0.5 ${
                        item.netIncome < 0 ? "text-red-600 font-bold" : "text-emerald-600 font-semibold"
                      }`}
                    >
                      {item.netIncome < 0 ? "Loss: " : "+ Net Profit: "}{rupiah(item.netIncome)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e6e4dd] flex justify-end">
              <button
                onClick={() => setInspectorData(null)}
                className="px-4 py-1.5 text-[12px] font-medium bg-[#0e3b3a] text-white rounded-lg hover:bg-[#143a38] cursor-pointer"
              >
                Tutup Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
