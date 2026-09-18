import React, { useMemo } from "react";
import { rupiah } from "../../utils/pricing";

export default function PaymentMethodBreakdown({ transactions }) {
  const stats = useMemo(() => {
    let cashCount = 0, cashRev = 0;
    let creditCount = 0, creditRev = 0;
    let tradeInCount = 0, tradeInRev = 0;
    const totalCount = transactions.length || 0;

    transactions.forEach(t => {
      const method = (t.paymentMethod || t.saleType || "cash").toLowerCase();
      const rev = Number(t.sellingPrice) || 0;

      if (method.includes("trade") || t.saleType === "tradein") {
        tradeInCount += 1;
        tradeInRev += rev;
      } else if (method.includes("credit") || method.includes("kredit")) {
        creditCount += 1;
        creditRev += rev;
      } else {
        cashCount += 1;
        cashRev += rev;
      }
    });

    const getPct = (cnt) => (totalCount > 0 ? Math.round((cnt / totalCount) * 100) : 0);

    return {
      totalCount,
      cash: { count: cashCount, rev: cashRev, pct: getPct(cashCount) },
      credit: { count: creditCount, rev: creditRev, pct: getPct(creditCount) },
      tradeIn: { count: tradeInCount, rev: tradeInRev, pct: getPct(tradeInCount) },
    };
  }, [transactions]);

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold">Metode Pembayaran</div>
            <div className="text-[11px] text-[#7c8783]">Breakdown Cash vs Kredit vs Tukar Tambah</div>
          </div>
          <span className="text-[11px] font-medium text-[#7c8783]">{stats.totalCount} Transaksi</span>
        </div>

        {stats.totalCount === 0 ? (
          <div className="text-[13px] text-[#7c8783] py-6 text-center border border-dashed border-[#e6e4dd] rounded-lg">
            Belum ada transaksi pada periode ini.
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {/* Cash */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="font-medium text-[#16211f] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Tunai (Cash)
                </span>
                <span className="font-semibold text-[#0e3b3a]">
                  {stats.cash.pct}% <span className="text-[11px] font-normal text-[#7c8783]">({stats.cash.count} unit)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded bg-[#edece7] overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${stats.cash.pct}%` }} />
              </div>
              <div className="text-[11px] text-[#7c8783] mt-0.5 text-right font-mono">{rupiah(stats.cash.rev)}</div>
            </div>

            {/* Credit */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="font-medium text-[#16211f] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Kredit (Leasing)
                </span>
                <span className="font-semibold text-[#0e3b3a]">
                  {stats.credit.pct}% <span className="text-[11px] font-normal text-[#7c8783]">({stats.credit.count} unit)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded bg-[#edece7] overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${stats.credit.pct}%` }} />
              </div>
              <div className="text-[11px] text-[#7c8783] mt-0.5 text-right font-mono">{rupiah(stats.credit.rev)}</div>
            </div>

            {/* Trade In */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="font-medium text-[#16211f] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Tukar Tambah (Trade-In)
                </span>
                <span className="font-semibold text-[#0e3b3a]">
                  {stats.tradeIn.pct}% <span className="text-[11px] font-normal text-[#7c8783]">({stats.tradeIn.count} unit)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded bg-[#edece7] overflow-hidden">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${stats.tradeIn.pct}%` }} />
              </div>
              <div className="text-[11px] text-[#7c8783] mt-0.5 text-right font-mono">{rupiah(stats.tradeIn.rev)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
