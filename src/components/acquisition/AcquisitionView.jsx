import React, { useMemo } from "react";
import KpiCard from "../shared/KpiCard";
import AcquireUnitForm from "./AcquireUnitForm";
import RecentAcquisitions from "./RecentAcquisitions";
import { costBasis, rupiah } from "../../utils/pricing";

export default function AcquisitionView({ units, availableUnits, onAdd, onTradeIn }) {
  const totalUnits = units.length;
  const available = useMemo(() => units.filter(u => u.status === "available").length, [units]);
  const totalSpend = useMemo(() => units.reduce((sum, u) => sum + costBasis(u), 0), [units]);

  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Unit Acquisition</h1>
        <div className="text-sm text-[#7c8783]">Showroom Orisma</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-5">
        Purchase units or process trade-in transactions — units added straight to Inventory.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <KpiCard label="Units acquired (all time)" value={totalUnits} />
        <KpiCard label="Currently available" value={available} />
        <KpiCard label="Total capital invested" value={rupiah(totalSpend)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
          <div className="text-[13px] font-semibold mb-4">Acquire a unit</div>
          <AcquireUnitForm 
            availableUnits={availableUnits}
            onSubmit={onAdd} 
            onTradeIn={onTradeIn}
          />
        </div>
        <RecentAcquisitions units={units} />
      </div>
    </>
  );
}
