import React from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { todayISO, rupiah } from "../../utils/pricing";
import CurrencyInput from "../shared/CurrencyInput";

export function Field({ label, className = "", children }) {
  return (
    <div className={className}>
      <label className="text-[12px] text-[#7c8783] block mb-1">{label}</label>
      {children}
    </div>
  );
}

export function emptyTradeInForm() {
  return {
    dateAcquired: todayISO(),
    name: "",
    category: "honda",
    year: String(new Date().getFullYear()),
    plate: "",
    tradeInValuation: "",
    ownerName: "",
    ownerAddress: "",
    notes: "",
  };
}

// Simplified form for trade-in acquisitions - no cost breakdown needed
export default function TradeInFormFields({ form, onChange }) {
  const { categories: brands } = useCategoriesContext();

  // Parse sign from the stored value
  const storedNum = Number(form.tradeInValuation) || 0;
  const isNegative = storedNum < 0;
  const absValue = storedNum !== 0 ? String(Math.abs(storedNum)) : (form.tradeInValuation === "" ? "" : "0");

  function handleAmountChange(digits) {
    const abs = Number(digits) || 0;
    if (digits === "" || digits === "0" || abs === 0) {
      onChange("tradeInValuation", digits === "" ? "" : isNegative ? String(-abs) : String(abs));
    } else {
      onChange("tradeInValuation", isNegative ? String(-abs) : digits);
    }
  }

  function toggleSign() {
    const abs = Math.abs(Number(form.tradeInValuation) || 0);
    onChange("tradeInValuation", isNegative ? String(abs) : String(-abs));
  }

  return (
    <>
      <Field label="Date">
        <input
          type="date" required value={form.dateAcquired}
          onChange={e => onChange("dateAcquired", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <div className="text-[12.5px] font-semibold text-[#0e3b3a] pt-1 pb-0.5">Customer's Unit Details</div>

      <Field label="Nama Kendaraan">
        <input
          required value={form.name} onChange={e => onChange("name", e.target.value)}
          placeholder="e.g. Honda Vario 125"
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <div className="flex gap-3">
        <Field label="Category (brand)" className="flex-1">
          <select
            value={form.category} onChange={e => onChange("category", e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600 bg-white"
          >
            {brands.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
          </select>
        </Field>
        <Field label="Tahun Keluaran" className="w-28">
          <input
            type="number" min="1980" max="2100" required value={form.year}
            onChange={e => onChange("year", e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
          />
        </Field>
      </div>

      <Field label="Plat Nomor">
        <input
          required value={form.plate} onChange={e => onChange("plate", e.target.value)}
          placeholder="e.g. B 1234 XYZ"
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      {/* Nilai Tukar Tambah — signed currency input */}
      <div>
        <label className="text-[12px] text-[#7c8783] block mb-1">Nilai Tukar Tambah (Rp)</label>
        <div className="flex gap-2 items-start">
          <button
            type="button"
            onClick={toggleSign}
            title="Toggle positive / negative"
            className={`mt-0.5 h-9 w-12 flex-shrink-0 flex items-center justify-center rounded-lg border text-[13px] font-bold transition-colors ${
              isNegative
                ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                : "bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100"
            }`}
          >
            {isNegative ? "−" : "+"}
          </button>
          <CurrencyInput
            value={absValue}
            onChange={handleAmountChange}
            placeholder="Rp 0"
            className="flex-1"
          />
        </div>
        <div className={`text-[11px] mt-1 ${isNegative ? "text-red-500" : "text-teal-700"}`}>
          {isNegative
            ? `Showroom membayar kelebihan ${rupiah(Math.abs(storedNum))} ke pelanggan`
            : `Pelanggan membayar kelebihan ${rupiah(storedNum)} ke showroom`}
        </div>
      </div>

      <div className="text-[12.5px] font-semibold text-[#0e3b3a] pt-1 pb-0.5">
        Owner Detail
      </div>

      <Field label="Nama Pemilik">
        <input
          required value={form.ownerName} onChange={e => onChange("ownerName", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <Field label="Alamat Pemilik">
        <input
          required value={form.ownerAddress} onChange={e => onChange("ownerAddress", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <Field label="Additional Info (if any)">
        <textarea
          rows={2} value={form.notes} onChange={e => onChange("notes", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>
    </>
  );
}

