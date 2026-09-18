import React, { useMemo, useState } from "react";
import { rupiah, fmtDate } from "../../utils/pricing";

export default function ZakatReport({ transactions, onTogglePaid, onMarkAllPaid }) {
  const [showPaid, setShowPaid] = useState(false);

  // Zakat is 2.5% of laba kotor (profit) — t.zakat already = profit*0.025, 0 for tradeins
  const unpaid = useMemo(() => transactions.filter(t => !t.zakatPaid && (t.zakat || 0) > 0), [transactions]);
  const paid = useMemo(() => transactions.filter(t => t.zakatPaid), [transactions]);
  const visible = showPaid ? transactions.filter(t => (t.zakat || 0) > 0) : unpaid;

  const zakatData = useMemo(() => {
    return visible.map(t => ({
      id: t.id,
      soldDate: t.soldDate,
      name: t.name,
      plate: t.plate,
      sellingPrice: t.sellingPrice,
      grossProfit: t.grossProfit ?? (t.sellingPrice - (t.cost || 0)),
      zakatAmount: t.zakat ?? 0,
      zakatPaid: !!t.zakatPaid,
      saleType: t.saleType,
    }));
  }, [visible]);

  const totalGross = useMemo(() => zakatData.reduce((s, z) => s + (z.sellingPrice || 0), 0), [zakatData]);
  const totalProfit = useMemo(() => zakatData.reduce((s, z) => s + (z.grossProfit || 0), 0), [zakatData]);
  const totalZakat = useMemo(() => zakatData.reduce((s, z) => s + (z.zakatAmount || 0), 0), [zakatData]);

  const totalUnpaidZakat = useMemo(() => unpaid.reduce((s, t) => s + (t.zakat || 0), 0), [unpaid]);
  const unpaidCount = unpaid.length;
  const paidCount = paid.length;

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <div className="text-[13px] font-semibold mb-1">Zakat Report — linked to timeline</div>
          <div className="text-[11px] text-[#7c8783]">2.5% of Laba Kotor (profit) per sold unit • filtered by timeframe above</div>
          <div className="text-[11px] text-[#7c8783] mt-1">
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Due: {unpaidCount}</span>
            <span className="mx-2">•</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Paid: {paidCount}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-[#7c8783] mb-0.5">Total Zakat Due (unpaid)</div>
          <div className="text-[18px] font-bold text-amber-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {rupiah(totalUnpaidZakat)}
          </div>
          {visible.length !== unpaid.length && (
            <div className="text-[11px] text-[#7c8783]">Shown: {rupiah(totalZakat)}</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 gap-2">
        <label className="flex items-center gap-2 text-[12px] cursor-pointer select-none">
          <input type="checkbox" checked={showPaid} onChange={e => setShowPaid(e.target.checked)} className="rounded border-[#e6e4dd]" />
          Show paid (skipped)
        </label>
        {unpaid.length > 0 && (
          <button
            onClick={() => onMarkAllPaid && onMarkAllPaid(unpaid.map(t => t.id))}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-[#0e3b3a] text-white hover:bg-[#143a38]"
          >
            Mark all filtered as paid ({unpaid.length})
          </button>
        )}
      </div>

      {zakatData.length === 0 ? (
        <div className="text-[13px] text-[#7c8783] py-4 text-center border border-dashed border-[#e6e4dd] rounded-lg">
          {showPaid ? "No zakat in this timeframe." : "All zakat paid for this timeframe — nothing due."}
        </div>
      ) : (
        <>
          <div className="mb-3 p-3 bg-[#f6f5f1] rounded-lg grid grid-cols-3 gap-3 text-[12px]">
            <div><div className="text-[#7c8783] text-[11px]">Gross Sales (shown)</div><div className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(totalGross)}</div></div>
            <div><div className="text-[#7c8783] text-[11px]">Laba Kotor (profit)</div><div className="font-semibold">{rupiah(totalProfit)}</div></div>
            <div><div className="text-[#7c8783] text-[11px]">Zakat 2.5% of Laba</div><div className="font-bold text-amber-600">{rupiah(totalZakat)}</div></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[#e6e4dd] text-[11px] text-[#7c8783]">
                  <th className="text-left py-2 pr-3 w-8">Paid</th>
                  <th className="text-left py-2 pr-3">Date</th>
                  <th className="text-left py-2 pr-3">Unit</th>
                  <th className="text-left py-2 pr-3">Plate</th>
                  <th className="text-right py-2 pr-3">Laba</th>
                  <th className="text-right py-2">Zakat (2.5%)</th>
                </tr>
              </thead>
              <tbody>
                {zakatData.map(z => (
                  <tr key={z.id} className={`border-b border-[#e6e4dd] transition-colors ${z.zakatPaid ? "bg-emerald-50/60 text-[#16211f]" : "hover:bg-[#fcfbf9]"}`}>
                    <td className="py-2.5 pr-3">
                      <input
                        type="checkbox"
                        checked={!!z.zakatPaid}
                        onChange={() => onTogglePaid && onTogglePaid(z.id)}
                        className="w-4 h-4 rounded border-[#e6e4dd] text-teal-600 focus:ring-teal-500 cursor-pointer"
                        title={z.zakatPaid ? "Mark unpaid" : "Mark paid"}
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-[#7c8783]">{fmtDate(z.soldDate)}</td>
                    <td className="py-2.5 pr-3 font-medium">
                      {z.name}
                      {z.saleType === "tradein" && <span className="text-[10px] text-amber-600 ml-1">(Tukar Tambah)</span>}
                      {z.zakatPaid && <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">Lunas</span>}
                    </td>
                    <td className="py-2.5 pr-3 text-[#7c8783] font-mono text-[11.5px]">{z.plate}</td>
                    <td className="py-2.5 pr-3 text-right" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(z.grossProfit)}</td>
                    <td className="py-2.5 text-right font-medium text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(z.zakatAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#0e3b3a]">
                  <td colSpan="4" className="py-2.5 pr-3 font-semibold">Total (shown)</td>
                  <td className="py-2.5 pr-3 text-right font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(totalProfit)}</td>
                  <td className="py-2.5 text-right font-bold text-amber-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rupiah(totalZakat)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
