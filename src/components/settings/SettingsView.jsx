import React from "react";
import { useSettings } from "../../context/SettingsContext";
import { rupiah } from "../../utils/pricing";

export default function SettingsView() {
  const { settings, update } = useSettings();

  function handleClearData() {
    if (!confirm("Hapus semua data inventaris & penjualan? Tindakan ini tidak bisa dibatalkan. / Clear all inventory & sales? This cannot be undone.")) return;
    localStorage.removeItem("orisma_units_v22");
    localStorage.removeItem("orisma_sales_v22");
    alert("Data cleared — refresh to see demo data. / Data dihapus — refresh untuk data demo.");
  }

  function handleExportBackup() {
    const units = localStorage.getItem("orisma_units_v22");
    const sales = localStorage.getItem("orisma_sales_v22");
    const backup = JSON.stringify({ units: units ? JSON.parse(units) : [], sales: sales ? JSON.parse(sales) : [], settings }, null, 2);
    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orisma_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Settings</h1>
        <div className="text-sm text-[#7c8783]">{settings.shopName}</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-5">Customize business rules, display, and shop identity. All settings are saved locally.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Business Rules */}
        <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
          <div className="text-[13px] font-semibold mb-4">Business Rules</div>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-[#7c8783]">Zakat Rate (%)</label>
              <input type="number" step="0.1" min="0" max="10" value={settings.zakatRate} onChange={e => update({ zakatRate: Number(e.target.value) })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" />
              <div className="text-[11px] text-[#7c8783] mt-1">Applied as {settings.zakatRate}% × Laba Kotor. Current: {rupiah(1000000 * settings.zakatRate/100)} per Rp 1jt profit.</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#7c8783]">Default Tenaga (Rp)</label>
                <input type="number" step="10000" value={settings.tenagaDefault} onChange={e => update({ tenagaDefault: Number(e.target.value) })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-[#7c8783]">Default Komisi (Rp)</label>
                <input type="number" step="10000" value={settings.komisiDefault} onChange={e => update({ komisiDefault: Number(e.target.value) })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-[#7c8783]">Default Lain-lain (Rp)</label>
                <input type="number" step="10000" value={settings.lainDefault} onChange={e => update({ lainDefault: Number(e.target.value) })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" />
              </div>
            </div>
            <div className="text-[11px] text-[#7c8783]">These defaults pre-fill Unit Acquisition → Add Unit form. You can still edit per unit.</div>
          </div>
        </div>

        {/* Display & Shop */}
        <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
          <div className="text-[13px] font-semibold mb-4">Display & Shop Identity</div>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-[#7c8783]">Shop Name (Logo)</label>
              <input value={settings.shopName} onChange={e => update({ shopName: e.target.value, shopShortName: e.target.value.split(" ").pop() || e.target.value })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" placeholder="Showroom Orisma" />
              <div className="text-[11px] text-[#7c8783] mt-1">Shown in Sidebar and Reports header.</div>
            </div>
            <div>
              <label className="text-[11px] text-[#7c8783]">Language / Bahasa</label>
              <select value={settings.language} onChange={e => update({ language: e.target.value })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1 bg-white">
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="text-[11px] text-[#7c8783]">Currency: Rp 17.700.000 (id-ID) • Date: DD/MM/YYYY</div>
          </div>
        </div>

        {/* Dashboard thresholds */}
        <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
          <div className="text-[13px] font-semibold mb-4">Dashboard — Aging Thresholds</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#7c8783]">Warning (days)</label>
              <input type="number" min="1" value={settings.agingWarn} onChange={e => update({ agingWarn: Number(e.target.value) })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-[#7c8783]">Critical (days)</label>
              <input type="number" min="1" value={settings.agingCritical} onChange={e => update({ agingCritical: Number(e.target.value) })} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" />
            </div>
          </div>
          <div className="text-[11px] text-[#7c8783] mt-2">Longest in stock pills turn amber at Warn, red at Critical.</div>
        </div>

        {/* Data & Safety */}
        <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
          <div className="text-[13px] font-semibold mb-4">Data & Safety</div>
          <div className="space-y-3">
            <button onClick={handleExportBackup} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[12px] font-medium hover:bg-[#f6f5f1]">Export Backup (JSON)</button>
            <button onClick={handleClearData} className="w-full bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-[12px] font-medium hover:bg-red-100">Clear All Data</button>
            <div className="text-[11px] text-[#7c8783]">Dedup by NOPOL, localStorage keys: orisma_units_v22, orisma_sales_v22, orisma_settings_v1</div>
          </div>
        </div>
      </div>
    </>
  );
}
