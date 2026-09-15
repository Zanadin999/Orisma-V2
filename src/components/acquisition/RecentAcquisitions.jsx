import React, { useMemo } from "react";
import StatusPill from "../shared/StatusPill";
import { costBasis, rupiah, fmtDate } from "../../utils/pricing";

export default function RecentAcquisitions({ units }) {
  const recent = useMemo(
    () => [...units].sort((a, b) => b.dateAcquired.localeCompare(a.dateAcquired)).slice(0, 8),
    [units]
  );

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-3">Recent acquisitions</div>
      {recent.length === 0 ? (
        <div className="text-[13px] text-[#7c8783]">No units acquired yet.</div>
      ) : (
        <div className="divide-y divide-[#e6e4dd]">
          {recent.map(u => (
            <div key={u.id} className="flex items-center justify-between py-2.5 text-[13px]">
              <div>
                <div className="font-medium">{u.name} — {u.plate}</div>
                <div className="text-[11px] text-[#7c8783]">From {u.ownerName} · {fmtDate(u.dateAcquired)}</div>
              </div>
              <div className="text-right space-y-1">
                <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(costBasis(u))}</div>
                <StatusPill status={u.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
