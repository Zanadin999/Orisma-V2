import React, { useState, useMemo } from "react";
import KpiCard from "../shared/KpiCard";
import TimeframeFilter from "../shared/TimeframeFilter";
import SalesChart from "./SalesChart";
import AgingInventory from "./AgingInventory";
import StockByBrand from "./StockByBrand";
import SellingTrendByBrand from "./SellingTrendByBrand";
import { rupiah } from "../../utils/pricing";
import { filterTransactionsByTimeframe } from "../../utils/dateFilters";

export default function DashboardView({
  availableUnits, totalAssetValue, transactions, totalNetIncome,
}) {
  const [timeframe, setTimeframe] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filteredTransactions = useMemo(
    () => filterTransactionsByTimeframe(transactions, timeframe, customStart, customEnd),
    [transactions, timeframe, customStart, customEnd]
  );

  const filteredNetIncome = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + t.netIncome, 0),
    [filteredTransactions]
  );

  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Dashboard</h1>
        <div className="text-sm text-[#7c8783]">Showroom Orisma</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-3">
        A live snapshot of your showroom's stock and sales performance.
      </p>

      <div className="mb-5">
        <TimeframeFilter
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Units in stock" value={availableUnits.length} />
        <KpiCard label="Stock value (cost)" value={rupiah(totalAssetValue)} />
        <KpiCard label="Units sold" value={filteredTransactions.length} />
        <KpiCard label="Net income" value={rupiah(filteredNetIncome)} valueClassName={filteredNetIncome < 0 ? "text-red-600" : ""} />
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-4 mb-4">
        <SalesChart transactions={filteredTransactions} />
        <AgingInventory availableUnits={availableUnits} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <StockByBrand availableUnits={availableUnits} />
        <SellingTrendByBrand transactions={filteredTransactions} />
      </div>
    </>
  );
}
