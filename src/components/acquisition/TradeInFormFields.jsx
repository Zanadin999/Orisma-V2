import React from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { todayISO } from "../../utils/pricing";

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

      <Field label="Trade-in Valuation (Rp)">
        <input
          type="number" min="0" step="50000" required value={form.tradeInValuation}
          onChange={e => onChange("tradeInValuation", e.target.value)}
          placeholder="Total valuation amount"
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

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
