import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import BrandBadge from "../shared/BrandBadge";
import { minPrice, saleMath, rupiah, todayISO } from "../../utils/pricing";

export default function LogSaleForm({ availableUnits, onLogSale }) {
  const [search, setSearch] = useState("");
  const filteredUnits = availableUnits.filter(u => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.plate.toLowerCase().includes(q);
  });
  const [unitId, setUnitId] = useState(filteredUnits[0]?.id ?? "");
  // keep selection in sync when filter changes
  React.useEffect(() => {
    if (filteredUnits.length === 0) { setUnitId(""); return; }
    if (!filteredUnits.some(u => String(u.id) === String(unitId))) setUnitId(filteredUnits[0].id);
  }, [search, availableUnits]);
  const [sellingPrice, setSellingPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [downPayment, setDownPayment] = useState("");
  const [financingCompany, setFinancingCompany] = useState("FIF");
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [soldDate, setSoldDate] = useState(todayISO());

  const unit = availableUnits.find(u => u.id === Number(unitId));
  const floor = unit ? minPrice(unit) : 0;
  const price = Number(sellingPrice) || 0;
  const belowMin = unit && sellingPrice !== "" && price < floor;
  const math = unit ? saleMath(unit, price) : null;
  const commission = paymentMethod === "credit" ? 700000 : 0;
  const canSubmit = unit && sellingPrice !== "" && buyerName.trim() && buyerAddress.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onLogSale(unit.id, {
      sellingPrice: price,
      paymentMethod,
      downPayment: paymentMethod === "credit" ? Number(downPayment) || 0 : 0,
      financingCompany: paymentMethod === "credit" ? financingCompany : null,
      commission,
      buyerName: buyerName.trim(),
      buyerAddress: buyerAddress.trim(),
      notes: notes.trim(),
      soldDate,
    });
    setSellingPrice("");
    setPaymentMethod("cash");
    setDownPayment("");
    setFinancingCompany("FIF");
    setBuyerName("");
    setBuyerAddress("");
    setNotes("");
    setSoldDate(todayISO());
  }

  if (availableUnits.length === 0) {
    return (
      <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
        <div className="text-[13px] font-semibold mb-4">Log a sale</div>
        <div className="text-[13px] text-[#7c8783]">
          Nothing in stock to sell — add a unit from Inventory or Unit Acquisition first.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-4">Log a sale</div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[12px] text-[#7c8783] block mb-1">Unit — search by Name or Plat</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau plat, e.g. Vario atau B 1234"
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600 mb-2"
          />
          <select
            value={unitId}
            onChange={e => setUnitId(e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none bg-white"
          >
            {filteredUnits.length === 0 ? (
              <option value="">No units match "{search}"</option>
            ) : filteredUnits.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.plate}
              </option>
            ))}
          </select>
        </div>

        {unit && (
          <div className="flex items-center gap-2">
            <BrandBadge categoryKey={unit.category} />
            <span className="text-[12px] text-[#7c8783]">{unit.year} · Owner: {unit.ownerName}</span>
          </div>
        )}

        <div>
          <label className="text-[12px] text-[#7c8783] block mb-1">Harga Terjual (Rp)</label>
          <input
            type="number" min="0" step="50000"
            value={sellingPrice}
            onChange={e => setSellingPrice(e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none"
          />
          {unit && (
            <div className={`text-[11.5px] mt-1 ${belowMin ? "text-amber-600" : "text-[#7c8783]"}`}>
              {belowMin ? `⚠ Below recommended minimum of ${rupiah(floor)}` : `Recommended minimum: ${rupiah(floor)}`}
            </div>
          )}
        </div>

        <div>
          <label className="text-[12px] text-[#7c8783] block mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600 bg-white"
          >
            <option value="cash">Cash (Tunai)</option>
            <option value="credit">Credit (Kredit/Cicilan)</option>
          </select>
        </div>

        {paymentMethod === "credit" && (
          <>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[12px] text-[#7c8783] block mb-1">Down Payment (Rp)</label>
                <input
                  type="number" min="0" step="50000"
                  value={downPayment}
                  onChange={e => setDownPayment(e.target.value)}
                  placeholder="Uang muka"
                  className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-[#7c8783] block mb-1">Financing Company</label>
                <select
                  value={financingCompany}
                  onChange={e => setFinancingCompany(e.target.value)}
                  className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600 bg-white"
                >
                  <option value="FIF">FIF (Federal International Finance)</option>
                  <option value="Adira">Adira Finance</option>
                  <option value="BAF">BAF (Bussan Auto Finance)</option>
                  <option value="WOM">WOM Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[12px] text-blue-700">
              💰 Commission bonus: {rupiah(commission)}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[12px] text-[#7c8783] block mb-1">Nama Pembeli</label>
            <input
              required value={buyerName} onChange={e => setBuyerName(e.target.value)}
              className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none"
            />
          </div>
          <div className="w-36">
            <label className="text-[12px] text-[#7c8783] block mb-1">Sold Date</label>
            <input
              type="date" required value={soldDate} onChange={e => setSoldDate(e.target.value)}
              className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] text-[#7c8783] block mb-1">Alamat Pembeli</label>
          <input
            required value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none"
          />
        </div>

        <div>
          <label className="text-[12px] text-[#7c8783] block mb-1">Keterangan (if any)</label>
          <input
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Lunas tunai, tukar tambah"
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none"
          />
        </div>

        {math && sellingPrice !== "" && (
          <div className="bg-[#f6f5f1] rounded-lg p-3 space-y-1 text-[12.5px]">
            <Row label="Laba kotor" value={rupiah(math.grossProfit)} />
            <Row label="Zakat (2.5%)" value={rupiah(math.zakat)} />
            {paymentMethod === "credit" && <Row label="Commission" value={rupiah(commission)} />}
            <Row label="Net income" value={rupiah(math.netIncome + commission)} bold />
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 bg-[#0e3b3a] text-white text-[13px] font-medium rounded-lg py-2.5 mt-1 disabled:opacity-40 hover:bg-[#0b302f]"
        >
          <ShoppingCart size={14} /> Complete sale
        </button>
      </form>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#7c8783]">{label}</span>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}
