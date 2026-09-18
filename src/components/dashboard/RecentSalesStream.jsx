import React, { useMemo } from "react";
import { rupiah, fmtDate } from "../../utils/pricing";

export default function RecentSalesStream({ transactions }) {
  const recentSales = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return [...transactions]
      .sort((a, b) => (b.soldDate || "").localeCompare(a.soldDate || ""))
      .slice(0, 5);
  }, [transactions]);

  function getBadge(t) {
    const method = (t.paymentMethod || t.saleType || "cash").toLowerCase();
    if (method.includes("trade") || t.saleType === "tradein") {
      return <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">Tukar Tambah</span>;
    }
    if (method.includes("credit") || method.includes("kredit")) {
      return <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">Kredit</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Tunai (Cash)</span>;
  }

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold">Recent Sales Activity</div>
            <div className="text-[11px] text-[#7c8783]">Latest 5 transactions stream</div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#f6f5f1] border border-[#e6e4dd] rounded-md text-[#55605d]">
            Live Stream
          </span>
        </div>

        {recentSales.length === 0 ? (
          <div className="text-[13px] text-[#7c8783] py-6 text-center border border-dashed border-[#e6e4dd] rounded-lg">
            No sales recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[#e6e4dd]">
            {recentSales.map(t => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-2 text-[12.5px]">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[#16211f] truncate">{t.name}</div>
                  <div className="text-[11px] text-[#7c8783] flex items-center gap-1.5 flex-wrap">
                    <span>{t.buyerName || t.ownerName || "Pelanggan"}</span>
                    <span>•</span>
                    <span>{fmtDate(t.soldDate)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-semibold text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {rupiah(t.sellingPrice)}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    {getBadge(t)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
