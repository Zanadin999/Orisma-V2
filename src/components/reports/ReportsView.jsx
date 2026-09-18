import React, { useState, useMemo, useEffect } from "react";
import KpiCard from "../shared/KpiCard";
import TimeframeFilter from "../shared/TimeframeFilter";
import ExportButtons from "../shared/ExportButtons";
import RevenueChart from "./RevenueChart";
import StockByBrand from "../dashboard/StockByBrand";
import SellingTrendByBrand from "../dashboard/SellingTrendByBrand";
import TransactionList from "../sales/TransactionList";
import PerformanceBreakdown from "../sales/PerformanceBreakdown";
import AssetValueByBrand from "./AssetValueByBrand";
import LongestStockTrend from "./LongestStockTrend";
import ZakatReport from "./ZakatReport";
import { rupiah } from "../../utils/pricing";
import { filterTransactionsByTimeframe } from "../../utils/dateFilters";
import { exportReportsToExcel, exportReportsToCSV, exportCompleteReport, exportCompleteReportCSV } from "../../utils/exportImport";

const SECTIONS = [
  { id: "financial", label: "Financial Overview" },
  { id: "sales", label: "Sales Analytics & History" },
  { id: "stock", label: "Stock Valuation & Aging" },
  { id: "zakat", label: "Zakat Report" },
];

export default function ReportsView({
  availableUnits, totalAssetValue, transactions, allUnits, onToggleZakatPaid, onMarkAllZakatPaid,
}) {
  const [timeframe, setTimeframe] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeSection, setActiveSection] = useState("financial");

  const filteredTransactions = useMemo(
    () => filterTransactionsByTimeframe(transactions, timeframe, customStart, customEnd),
    [transactions, timeframe, customStart, customEnd]
  );

  const filteredRevenue = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + (t.sellingPrice || 0), 0),
    [filteredTransactions]
  );

  const filteredNetIncome = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + (t.netIncome || 0), 0),
    [filteredTransactions]
  );

  const filteredTopBrands = useMemo(() => {
    const byBrand = {};
    filteredTransactions.forEach(t => {
      if (!byBrand[t.category]) byBrand[t.category] = { revenue: 0, count: 0 };
      byBrand[t.category].revenue += t.sellingPrice || 0;
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
      byModel[t.name].revenue += t.sellingPrice || 0;
      byModel[t.name].count += 1;
    });
    return Object.entries(byModel)
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTransactions]);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map(s => document.getElementById(`section-${s.id}`));
      const scrollPos = window.scrollY + 120;
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(id) {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Reports</h1>
        <div className="text-sm text-[#7c8783]">Showroom Orisma</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-3">
        Built entirely from live Inventory and Sales data.
      </p>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <TimeframeFilter
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <ExportButtons 
            onExportExcel={() => exportReportsToExcel(filteredTransactions, availableUnits)}
            onExportCSV={() => exportReportsToCSV(filteredTransactions)}
            label="Export Filtered"
          />
          <div className="hidden lg:block h-6 w-px bg-[#e6e4dd]"></div>
          <ExportButtons 
            onExportExcel={() => exportCompleteReport(allUnits, transactions)}
            onExportCSV={() => exportCompleteReportCSV(allUnits, transactions)}
            label="Complete Report"
          />
        </div>
      </div>

      {/* Option B: Sticky Pill Navigation */}
      <div className="sticky top-0 z-20 bg-[#f6f5f1]/90 backdrop-blur-md py-2.5 mb-6 border-b border-[#e6e4dd] flex items-center gap-2 overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSection === s.id
                ? "bg-[#0e3b3a] text-white shadow-sm"
                : "bg-white text-[#55605d] hover:bg-[#edece7] border border-[#e6e4dd]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section 1: Financial Overview */}
      <section id="section-financial" className="scroll-mt-20 space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[#16211f]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Financial Overview
          </h2>
          <div className="flex-1 h-px bg-[#e6e4dd]" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <KpiCard label="Stock value (cost)" value={rupiah(totalAssetValue)} />
          <KpiCard label="Units in stock" value={availableUnits.length} />
          <KpiCard label="Total revenue" value={rupiah(filteredRevenue)} />
          <KpiCard label="Total net income" value={rupiah(filteredNetIncome)} valueClassName={filteredNetIncome < 0 ? "text-red-600" : ""} />
        </div>

        <RevenueChart transactions={filteredTransactions} />
      </section>

      {/* Section 2: Sales Analytics & History */}
      <section id="section-sales" className="scroll-mt-20 space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[#16211f]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sales Analytics & History
          </h2>
          <div className="flex-1 h-px bg-[#e6e4dd]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SellingTrendByBrand transactions={filteredTransactions} />
          <PerformanceBreakdown topBrands={filteredTopBrands} topModels={filteredTopModels} />
        </div>

        <TransactionList transactions={filteredTransactions} />
      </section>

      {/* Section 3: Stock Valuation & Aging */}
      <section id="section-stock" className="scroll-mt-20 space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[#16211f]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Stock Valuation & Aging
          </h2>
          <div className="flex-1 h-px bg-[#e6e4dd]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StockByBrand availableUnits={availableUnits} />
          <AssetValueByBrand availableUnits={availableUnits} />
        </div>

        <LongestStockTrend availableUnits={availableUnits} />
      </section>

      {/* Section 4: Zakat Report */}
      <section id="section-zakat" className="scroll-mt-20 space-y-4 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[#16211f]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Zakat Report
          </h2>
          <div className="flex-1 h-px bg-[#e6e4dd]" />
        </div>

        <ZakatReport transactions={filteredTransactions} onTogglePaid={onToggleZakatPaid} onMarkAllPaid={onMarkAllZakatPaid} />
      </section>
    </>
  );
}
