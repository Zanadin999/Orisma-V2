import React from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";
import { minPrice, rupiah, todayISO } from "../../utils/pricing";

export function Field({ label, className = "", children }) {
  return (
    <div className={className}>
      <label className="text-[12px] text-[#7c8783] block mb-1">{label}</label>
      {children}
    </div>
  );
}

export function emptyUnitForm() {
  try {
    const raw = localStorage.getItem("orisma_settings_v1");
    if (raw) {
      const s = JSON.parse(raw);
      return {
        dateAcquired: todayISO(),
        name: "",
        category: "honda",
        year: String(new Date().getFullYear()),
        plate: "",
        unitPrice: "",
        costUnit: "",
        additionalCost1: String(s.tenagaDefault ?? 130000),
        additionalCost2: String(s.komisiDefault ?? 0),
        additionalCost3: String(s.lainDefault ?? 10000),
        acquisitionSource: "purchase",
        ownerName: "",
        ownerAddress: "",
        notes: "",
      };
    }
  } catch {}
  return {
    dateAcquired: todayISO(),
    name: "",
    category: "honda",
    year: String(new Date().getFullYear()),
    plate: "",
    unitPrice: "",
    costUnit: "",
    additionalCost1: "130000",
    additionalCost2: "0",
    additionalCost3: "10000",
    acquisitionSource: "purchase",
    ownerName: "",
    ownerAddress: "",
    notes: "",
  };
}

export function unitToForm(u) {
  return {
    dateAcquired: u.dateAcquired,
    name: u.name,
    category: u.category,
    year: String(u.year),
    plate: u.plate,
    unitPrice: String(u.unitPrice),
    costUnit: String(u.costUnit),
    additionalCost1: String(u.additionalCost1 || 0),
    additionalCost2: String(u.additionalCost2 || 0),
    additionalCost3: String(u.additionalCost3 || 0),
    acquisitionSource: u.acquisitionSource || "purchase",
    ownerName: u.ownerName,
    ownerAddress: u.ownerAddress,
    notes: u.notes || "",
  };
}

// Renders the full Unit Details + Unit Acquirement Detail fields shared
// by AddUnitModal, EditUnitModal, and AcquireUnitForm. `form` +
// `onChange(field, value)` follow the same shape in all three places.
export default function UnitFormFields({ form, onChange }) {
  const { categories: brands } = useCategoriesContext();
  const preview = minPrice({
    unitPrice: form.unitPrice,
    costUnit: form.costUnit,
    additionalCost: form.additionalCost,
  });

  return (
    <>
      <Field label="Date">
        <input
          type="date" required value={form.dateAcquired}
          onChange={e => onChange("dateAcquired", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <div className="text-[12.5px] font-semibold text-[#0e3b3a] pt-1 pb-0.5">Unit Details</div>

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

      <div className="flex gap-3">
        <Field label="Harga Unit (Rp)" className="flex-1">
          <input
            type="number" min="0" step="50000" required value={form.unitPrice}
            onChange={e => onChange("unitPrice", e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
          />
        </Field>
        <Field label="Cost Unit (Rp)" className="flex-1">
          <input
            type="number" min="0" step="50000" value={form.costUnit}
            onChange={e => onChange("costUnit", e.target.value)}
            className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
          />
        </Field>
      </div>

      <Field label="TENAGA - Additional Cost 1 (Rp)">
        <input
          type="number" min="0" step="50000" value={form.additionalCost1}
          onChange={e => onChange("additionalCost1", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <Field label="KOMISI - Additional Cost 2 (Rp)">
        <input
          type="number" min="0" step="50000" value={form.additionalCost2}
          onChange={e => onChange("additionalCost2", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <Field label="LAIN-LAIN - Additional Cost 3 (Rp)">
        <input
          type="number" min="0" step="50000" value={form.additionalCost3}
          onChange={e => onChange("additionalCost3", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600"
        />
      </Field>

      <div className="text-[12.5px] font-semibold text-[#0e3b3a] pt-1 pb-0.5">
        Unit Acquirement Detail
      </div>

      <Field label="Acquisition Source">
        <select
          value={form.acquisitionSource}
          onChange={e => onChange("acquisitionSource", e.target.value)}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600 bg-white"
        >
          <option value="purchase">Purchase from Owner</option>
          <option value="tradein">Trade-in</option>
        </select>
      </Field>

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

      <div className="rounded-lg px-3 py-2.5 flex items-center justify-between bg-[#e3f3ee]">
        <span className="text-[12px] text-[#0e3b3a]">Recommended Minimum Sales</span>
        <span className="text-[14px] font-semibold text-[#0e3b3a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {rupiah(preview)}
        </span>
      </div>
    </>
  );
}
