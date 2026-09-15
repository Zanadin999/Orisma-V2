import React from "react";
import { rupiah, fmtDate } from "../../utils/pricing";

function PaymentBadge({ method }) {
  const styles = {
    cash: "bg-green-100 text-green-700",
    credit: "bg-blue-100 text-blue-700",
    tradein: "bg-purple-100 text-purple-700",
  };
  
  const labels = {
    cash: "Cash",
    credit: "Credit",
    tradein: "Trade-in",
  };
  
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${styles[method] || styles.cash}`}>
      {labels[method] || method}
    </span>
  );
}

export default function TransactionList({ transactions, title = "Recent sales" }) {
  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-3">{title}</div>
      {transactions.length === 0 ? (
        <div className="text-[13px] text-[#7c8783]">No sales logged yet.</div>
      ) : (
        <div className="divide-y divide-[#e6e4dd]">
          {transactions.map(t => {
            const totalNet = t.netIncome + (t.commission || 0);
            return (
              <div key={t.id} className="flex items-center justify-between py-2.5 text-[13px]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.name} — {t.plate}</span>
                    <PaymentBadge method={t.paymentMethod || "cash"} />
                  </div>
                  <div className="text-[11px] text-[#7c8783]">
                    {t.buyerName} · {fmtDate(t.soldDate)}
                    {t.paymentMethod === "credit" && t.financingCompany && (
                      <> · {t.financingCompany}</>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {rupiah(t.sellingPrice)}
                  </div>
                  <div className={`text-[11px] ${totalNet >= 0 ? "text-teal-600" : "text-red-600"}`}>
                    Net {rupiah(totalNet)}
                    {t.commission > 0 && <span className="text-[10px]"> (+comm)</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
