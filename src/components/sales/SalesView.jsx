import React from "react";
import KpiCard from "../shared/KpiCard";
import LogSaleForm from "./LogSaleForm";
import TransactionList from "./TransactionList";
import PerformanceBreakdown from "./PerformanceBreakdown";
import { rupiah, fmtDate } from "../../utils/pricing";

export default function SalesView({
  availableUnits, transactions, totalRevenue, totalNetIncome, lastSale, topBrands, topModels, onLogSale,
}) {
  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sales / POS</h1>
        <div className="text-sm text-[#7c8783]">Showroom Orisma</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-5">
        Completing a sale here marks the unit sold in Inventory automatically.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        <KpiCard label="Units sold" value={transactions.length} />
        <KpiCard label="Total revenue" value={rupiah(totalRevenue)} />
        <KpiCard label="Net income" value={rupiah(totalNetIncome)} valueClassName={totalNetIncome < 0 ? "text-red-600" : ""} />
        <KpiCard label="Last sale" value={lastSale ? fmtDate(lastSale.soldDate) : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 mb-4">
        <LogSaleForm availableUnits={availableUnits} onLogSale={onLogSale} />
        <TransactionList transactions={transactions} />
      </div>

      <PerformanceBreakdown topBrands={topBrands} topModels={topModels} />
    </>
  );
}
