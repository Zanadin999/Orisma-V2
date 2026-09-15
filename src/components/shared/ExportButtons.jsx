import React from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";

export default function ExportButtons({ onExportExcel, onExportCSV, label = "Export" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-[#7c8783]">{label}:</span>
      <button
        onClick={onExportExcel}
        className="flex items-center gap-1.5 border border-[#e6e4dd] rounded-lg px-3 py-1.5 text-[12px] font-medium hover:bg-[#f6f5f1] transition-colors"
        title="Export to Excel"
      >
        <FileSpreadsheet size={14} className="text-[#0e3b3a]" />
        Excel
      </button>
      <button
        onClick={onExportCSV}
        className="flex items-center gap-1.5 border border-[#e6e4dd] rounded-lg px-3 py-1.5 text-[12px] font-medium hover:bg-[#f6f5f1] transition-colors"
        title="Export to CSV"
      >
        <FileDown size={14} className="text-[#0e3b3a]" />
        CSV
      </button>
    </div>
  );
}
