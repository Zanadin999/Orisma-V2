import React, { useState, useMemo } from "react";
import KpiCard from "../shared/KpiCard";
import TimeframeFilter from "../shared/TimeframeFilter";
import ExportButtons from "../shared/ExportButtons";
import RevenueChart from "./RevenueChart";
import StockByBrand from "../dashboard/StockByBrand";
import SellingTrendByBrand from "../dashboard/SellingTrendByBrand";
import TransactionList from "../sales/TransactionList";
import PerformanceBreakdown from "../sales/PerformanceBreakdown";
import ZakatReport from "./ZakatReport";
import { rupiah } from "../../utils/pricing";
import { filterTransactionsByTimeframe } from "../../utils/dateFilters";
import { exportReportsToExcel, exportReportsToCSV, exportCompleteReport, exportCompleteReportCSV } from "../../utils/exportImport";

export default function ReportsView({
  availableUnits, totalAssetValue, transactions, allUnits, onToggleZakatPaid, onMarkAllZakatPaid,
}) {
  const [timeframe, setTimeframe] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filteredTransactions = useMemo(
    () => filterTransactionsByTimeframe(transactions, timeframe, customStart, customEnd),
    [transactions, timeframe, customStart, customEnd]
  );

  const filteredRevenue = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + t.sellingPrice, 0),
    [filteredTransactions]
  );

  const filteredNetIncome = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + t.netIncome, 0),
    [filteredTransactions]
  );

  const filteredTopBrands = useMemo(() => {
    const byBrand = {};
    filteredTransactions.forEach(t => {
      if (!byBrand[t.category]) byBrand[t.category] = { revenue: 0, count: 0 };
      byBrand[t.category].revenue += t.sellingPrice;
      byBrand[t.category].count += 1;
    });
    return Object.entries(byBrand)
      .map(([brand, data]) => ({ brand, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTransactions]);

  const filteredTopModels = useMemo(() => {
    const byModel = {};
    filteredTransactions.forEach(t => {
      if (!byModel[t.name]) byModel[t.name] = { revenue: 0, count: 0 };
      byModel[t.name].revenue += t.sellingPrice;
      byModel[t.name].count += 1;
    });
    return Object.entries(byModel)
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTransactions]);

  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Reports</h1>
        <div className="text-sm text-[#7c8783]">Showroom Orisma</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-3">
        Built entirely from live Inventory and Sales data.
      </p>

      <div className="flex items-center justify-between mb-5">
        <TimeframeFilter
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
        />
        <div className="flex items-center gap-3">
          <ExportButtons 
            onExportExcel={() => exportReportsToExcel(filteredTransactions, availableUnits)}
            onExportCSV={() => exportReportsToCSV(filteredTransactions)}
            label="Export Filtered"
          />
          <div className="h-6 w-px bg-[#e6e4dd]"></div>
          <ExportButtons 
            onExportExcel={() => exportCompleteReport(allUnits, transactions)}
            onExportCSV={() => exportCompleteReportCSV(allUnits, transactions)}
            label="Complete Report"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Stock value (cost)" value={rupiah(totalAssetValue)} />
        <KpiCard label="Units in stock" value={availableUnits.length} />
        <KpiCard label="Total revenue" value={rupiah(filteredRevenue)} />
        <KpiCard label="Total net income" value={rupiah(filteredNetIncome)} valueClassName={filteredNetIncome < 0 ? "text-red-600" : ""} />
      </div>

      <div className="mb-4">
        <RevenueChart transactions={filteredTransactions} />
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-4 mb-4">
        <StockByBrand availableUnits={availableUnits} />
        <TransactionList transactions={filteredTransactions} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <SellingTrendByBrand transactions={filteredTransactions} />
        <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 flex flex-col">
          <div className="text-[13px] font-semibold mb-3">Stock Value by Brand</div>
          <div className="text-[12px] text-[#7c8783]">See Stock by Brand chart — total asset value by brand is shown in KPIs above.</div>
        </div>
      </div>

      <PerformanceBreakdown topBrands={filteredTopBrands} topModels={filteredTopModels} />

      <div className="mt-4">
        <ZakatReport transactions={filteredTransactions} onTogglePaid={onToggleZakatPaid} onMarkAllPaid={onMarkAllZakatPaid} />
      </div>
    </>
  );
}
