import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { daysInStock, costBasis, rupiah } from "../../utils/pricing";
import { useSettings } from "../../context/SettingsContext";

export default function AgingInventory({ availableUnits }) {
  const { settings } = useSettings();
  const warn = Number(settings.agingWarn) || 30;
  const critical = Number(settings.agingCritical) || 60;

  const oldest = useMemo(
    () => [...availableUnits].sort((a, b) => a.dateAcquired.localeCompare(b.dateAcquired)).slice(0, 5),
    [availableUnits]
  );

  const trappedCapital = useMemo(() => {
    return availableUnits
      .filter(u => daysInStock(u.dateAcquired) >= critical)
      .reduce((sum, u) => sum + costBasis(u), 0);
  }, [availableUnits, critical]);

  const trappedCount = useMemo(() => {
    return availableUnits.filter(u => daysInStock(u.dateAcquired) >= critical).length;
  }, [availableUnits, critical]);

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold">Longest in stock</div>
            <div className="text-[11px] text-[#7c8783]">Inventory aging warnings</div>
          </div>
          <div className="text-[11px] font-medium text-[#7c8783]">{warn}d / {critical}d</div>
        </div>

        {/* Trapped Capital Banner */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 mb-3 flex items-center justify-between text-[12px]">
          <div>
            <div className="text-[10.5px] font-medium text-amber-800 uppercase tracking-wide">Trapped Capital ({critical}+ days)</div>
            <div className="font-bold text-amber-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {rupiah(trappedCapital)}
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10.5px] font-semibold bg-amber-200/60 text-amber-900 rounded-md">
            {trappedCount} Unit
          </span>
        </div>

        {oldest.length === 0 ? (
          <div className="text-[13px] text-[#7c8783] py-4">No units in stock right now.</div>
        ) : (
          <div className="divide-y divide-[#e6e4dd]">
            {oldest.map(u => {
              const days = daysInStock(u.dateAcquired);
              const isCritical = days >= critical;
              const isWarn = days >= warn;
              return (
                <div key={u.id} className="flex items-center justify-between py-2.5 gap-2 text-[13px]">
                  <div className="flex items-center gap-2 min-w-0">
                    {isWarn && <AlertTriangle size={14} className={isCritical ? "text-red-600 shrink-0" : "text-amber-600 shrink-0"} />}
                    <div className="min-w-0">
                      <div className="font-medium truncate text-[#16211f]">{u.name}</div>
                      <div className="text-[11.5px] text-[#7c8783]">{u.plate} • {days} days</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${isCritical ? "bg-red-50 text-red-700" : isWarn ? "bg-amber-50 text-amber-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {days} days
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
