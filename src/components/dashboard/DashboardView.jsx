import React, { useState, useMemo } from "react";
import KpiCard from "../shared/KpiCard";
import TimeframeFilter from "../shared/TimeframeFilter";
import SalesChart from "./SalesChart";
import AgingInventory from "./AgingInventory";
import RecentSalesStream from "./RecentSalesStream";
import PaymentMethodBreakdown from "./PaymentMethodBreakdown";
import StockByBrand from "./StockByBrand";
import SellingTrendByBrand from "./SellingTrendByBrand";
import { rupiah } from "../../utils/pricing";
import { filterTransactionsByTimeframe } from "../../utils/dateFilters";
import { useSettings } from "../../context/SettingsContext";

export default function DashboardView({
  availableUnits, totalAssetValue, transactions, totalNetIncome, onSelectTab
}) {
  const { settings } = useSettings();
  const [timeframe, setTimeframe] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filteredTransactions = useMemo(
    () => filterTransactionsByTimeframe(transactions, timeframe, customStart, customEnd),
    [transactions, timeframe, customStart, customEnd]
  );

  const filteredNetIncome = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + (t.netIncome || 0), 0),
    [filteredTransactions]
  );

  const targetLaba = Number(settings.targetLaba) || 0;
  const goalProgress = targetLaba > 0 ? Math.min(100, Math.round((filteredNetIncome / targetLaba) * 100)) : 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Dashboard</h1>
          <p className="text-[13.5px] text-[#7c8783] mt-0.5">
            A live snapshot of your showroom's stock and sales performance.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelectTab && onSelectTab("sales")}
            className="bg-[#0e3b3a] text-white px-3.5 py-2 rounded-lg text-[12.5px] font-medium hover:bg-[#143a38] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>+ Log New Sale</span>
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab("acquisition")}
            className="bg-white border border-[#e6e4dd] text-[#16211f] px-3.5 py-2 rounded-lg text-[12.5px] font-medium hover:bg-[#f6f5f1] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Add Inventory</span>
          </button>
        </div>
      </div>

      <div className="mb-5 mt-2">
        <TimeframeFilter
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        <KpiCard label="Units in stock" value={availableUnits.length} />
        <KpiCard label="Stock value (cost)" value={rupiah(totalAssetValue)} />
        <KpiCard label="Units sold" value={filteredTransactions.length} />
        <KpiCard
          label="Net income"
          value={rupiah(filteredNetIncome)}
          valueClassName={filteredNetIncome < 0 ? "text-red-600" : ""}
        >
          {targetLaba > 0 && (
            <div className="mt-2.5 pt-2 border-t border-[#e6e4dd]">
              <div className="flex items-center justify-between text-[10.5px] text-[#7c8783] mb-1">
                <span>Target Laba Goal</span>
                <span className="font-semibold text-[#0e3b3a]">{goalProgress}% ({rupiah(targetLaba)})</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#edece7] overflow-hidden">
                <div className="h-full bg-teal-600 transition-all" style={{ width: `${Math.max(0, goalProgress)}%` }} />
              </div>
            </div>
          )}
        </KpiCard>
      </div>

      {/* Upper Section: Full-Width Hero SalesChart */}
      <div className="mb-5">
        <SalesChart transactions={filteredTransactions} />
      </div>

      {/* Lower Section: 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <AgingInventory availableUnits={availableUnits} />
        <RecentSalesStream transactions={filteredTransactions} />
        <PaymentMethodBreakdown transactions={filteredTransactions} />
      </div>

      {/* Brand & Stock Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <StockByBrand availableUnits={availableUnits} />
        <SellingTrendByBrand transactions={filteredTransactions} />
      </div>
    </>
  );
}
