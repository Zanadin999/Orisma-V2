import React, { useMemo, useState } from "react";
import { rupiah, rupiahCompact, fmtShortDate, fmtDate } from "../../utils/pricing";
import { BarChart3, LineChart, AreaChart, Layers, Filter, Calendar, X, Info } from "lucide-react";
import { useCategoriesContext } from "../../context/CategoriesContext";

export default function RevenueChart({ transactions }) {
  const { categories: brandCategories } = useCategoriesContext();
  const [chartType, setChartType] = useState("dual"); // dual | bar | line | area
  const [aggregation, setAggregation] = useState("sale"); // sale | daily | weekly | monthly
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [limit, setLimit] = useState(10);
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
  const maxNet = Math.max(...aggregatedData.map(d => d.netIncome), 1);

  // Available brand list
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
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 relative">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold">Revenue & Profit Performance</h3>
            <span className="px-2 py-0.5 text-[10.5px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
              Margin: {summaryMetrics.marginPct}%
            </span>
          </div>
          <div className="text-[11.5px] text-[#7c8783] flex items-center gap-2 mt-0.5 flex-wrap">
            <span>Rata-rata: <strong className="text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(summaryMetrics.avgRev)}</strong></span>
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
              className={`px-2 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-all ${
                chartType === "dual" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Dual-Metric Overlay (Revenue Bars + Net Profit Line)"
            >
              <Layers size={13} /> Dual
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded transition-all ${
                chartType === "bar" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Bar Chart"
            >
              <BarChart3 size={14} />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-1.5 rounded transition-all ${
                chartType === "line" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Line Chart"
            >
              <LineChart size={14} />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded transition-all ${
                chartType === "area" ? "bg-[#0e3b3a] text-white" : "text-[#7c8783] hover:bg-[#f6f5f1]"
              }`}
              title="Area Chart"
            >
              <AreaChart size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {aggregatedData.length === 0 ? (
        <div className="text-[13px] text-[#7c8783] py-12 text-center border border-dashed border-[#e6e4dd] rounded-lg">
          Tidak ada data transaksi untuk filter yang dipilih.
        </div>
      ) : (
        <div className="relative h-52 pt-3 pb-2">
          {/* Legend */}
          <div className="flex items-center justify-end gap-4 text-[11px] text-[#7c8783] mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-600 inline-block" />
              <span>Revenue (Omzet)</span>
            </div>
            {(chartType === "dual" || chartType === "line") && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Net Income (Profit Bersih)</span>
              </div>
            )}
          </div>

          {/* DUAL METRIC OVERLAY CHART */}
          {chartType === "dual" && (
            <div className="relative h-40">
              {/* Bars for Revenue */}
              <div className="flex items-end gap-2 h-full px-2">
                {aggregatedData.map((d, i) => {
                  const heightPct = Math.max(8, Math.round((d.revenue / maxRev) * 100));
                  return (
                    <div
                      key={d.id}
                      onClick={() => setInspectorData(d)}
                      className="flex-1 flex flex-col items-center gap-1 group cursor-pointer h-full justify-end"
                      title={`Klik untuk detail ${d.label} — Omzet: ${rupiah(d.revenue)}`}
                    >
                      <span className="text-[9.5px] font-semibold text-[#0e3b3a] truncate max-w-full group-hover:scale-105 transition-transform" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {rupiahCompact(d.revenue)}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-teal-500/80 group-hover:bg-teal-600 transition-all shadow-sm"
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="text-[10px] text-[#7c8783] font-medium truncate">{d.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Net Income Line Overlay */}
              <div className="absolute inset-0 pointer-events-none px-2">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {(() => {
                    const points = aggregatedData.map((d, i) => ({
                      x: aggregatedData.length === 1 ? 50 : (i / (aggregatedData.length - 1)) * 92 + 4,
                      y: 85 - (d.netIncome / maxNet) * 65,
                      val: d.netIncome,
                    }));
                    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                    return (
                      <>
                        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="none" />
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="2.8" fill="#047857" stroke="#ffffff" strokeWidth="1" />
                            <text
                              x={p.x}
                              y={p.y - 3.5}
                              textAnchor="middle"
                              fontSize="3"
                              fontWeight="bold"
                              fill="#047857"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {rupiahCompact(p.val)}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}

          {/* STANDARD BAR CHART */}
          {chartType === "bar" && (
            <div className="flex items-end gap-2 h-40 px-2">
              {aggregatedData.map((d) => {
                const heightPct = Math.max(8, Math.round((d.revenue / maxRev) * 100));
                return (
                  <div
                    key={d.id}
                    onClick={() => setInspectorData(d)}
                    className="flex-1 flex flex-col items-center gap-1 group cursor-pointer h-full justify-end"
                    title={`Klik untuk detail ${d.label} — Omzet: ${rupiah(d.revenue)}`}
                  >
                    <span className="text-[9.5px] font-semibold text-[#0e3b3a] truncate max-w-full" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {rupiahCompact(d.revenue)}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-teal-600 group-hover:bg-teal-700 transition-all shadow-sm"
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="text-[10px] text-[#7c8783] font-medium truncate">{d.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LINE CHART */}
          {chartType === "line" && (
            <div className="relative h-40 pt-2">
              <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none">
                {(() => {
                  const points = aggregatedData.map((d, i) => ({
                    x: aggregatedData.length === 1 ? 50 : (i / (aggregatedData.length - 1)) * 92 + 4,
                    y: 85 - (d.revenue / maxRev) * 65,
                    val: d.revenue,
                    d,
                  }));
                  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  return (
                    <>
                      <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2.5" />
                      {points.map((p, i) => (
                        <g key={i} onClick={() => setInspectorData(p.d)} className="cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="3" fill="#0e3b3a" stroke="#ffffff" strokeWidth="1" />
                          <text
                            x={p.x}
                            y={p.y - 4}
                            textAnchor="middle"
                            fontSize="3.2"
                            fontWeight="bold"
                            fill="#0e3b3a"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            {rupiahCompact(p.val)}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between px-2 mt-1">
                {aggregatedData.map(d => (
                  <div key={d.id} className="text-[10px] text-[#7c8783] flex-1 text-center font-medium truncate">
                    {d.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AREA CHART */}
          {chartType === "area" && (
            <div className="relative h-40 pt-2">
              <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none">
                {(() => {
                  const points = aggregatedData.map((d, i) => ({
                    x: aggregatedData.length === 1 ? 50 : (i / (aggregatedData.length - 1)) * 92 + 4,
                    y: 85 - (d.revenue / maxRev) * 65,
                    val: d.revenue,
                    d,
                  }));
                  const pathLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const pathArea = `${pathLine} L ${points[points.length - 1].x} 95 L ${points[0].x} 95 Z`;
                  return (
                    <>
                      <path d={pathArea} fill="#0d9488" opacity="0.2" />
                      <path d={pathLine} fill="none" stroke="#0d9488" strokeWidth="2.5" />
                      {points.map((p, i) => (
                        <g key={i} onClick={() => setInspectorData(p.d)} className="cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="3" fill="#0e3b3a" stroke="#ffffff" strokeWidth="1" />
                          <text
                            x={p.x}
                            y={p.y - 4}
                            textAnchor="middle"
                            fontSize="3.2"
                            fontWeight="bold"
                            fill="#0e3b3a"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            {rupiahCompact(p.val)}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between px-2 mt-1">
                {aggregatedData.map(d => (
                  <div key={d.id} className="text-[10px] text-[#7c8783] flex-1 text-center font-medium truncate">
                    {d.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click-to-Drilldown Transaction Inspector Popover */}
      {inspectorData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={() => setInspectorData(null)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-lg shadow-xl border border-[#e6e4dd]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e6e4dd] pb-3 mb-3">
              <div>
                <h4 className="text-[15px] font-semibold flex items-center gap-2">
                  <span>Detail Transaksi: {inspectorData.label}</span>
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-[#f6f5f1] border border-[#e6e4dd] rounded-md text-[#55605d]">
                    {inspectorData.items.length} Unit
                  </span>
                </h4>
                <div className="text-[11.5px] text-[#7c8783] mt-0.5">
                  Total Omzet: <strong className="text-[#0e3b3a]">{rupiah(inspectorData.revenue)}</strong> • Profit Bersih: <strong className="text-emerald-700">{rupiah(inspectorData.netIncome)}</strong>
                </div>
              </div>
              <button
                onClick={() => setInspectorData(null)}
                className="w-8 h-8 rounded-lg border border-[#e6e4dd] grid place-items-center hover:bg-[#f6f5f1] transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#e6e4dd] text-[12.5px]">
              {inspectorData.items.map((item, idx) => (
                <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#fcfbf9] transition-colors">
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
                    <div className="text-[10.5px] font-medium text-emerald-600 mt-0.5">
                      + Net Profit: {rupiah(item.netIncome)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e6e4dd] flex justify-end">
              <button
                onClick={() => setInspectorData(null)}
                className="px-4 py-1.5 text-[12px] font-medium bg-[#0e3b3a] text-white rounded-lg hover:bg-[#143a38]"
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
