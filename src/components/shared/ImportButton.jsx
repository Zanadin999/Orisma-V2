import React, { useRef } from "react";
import { FileUp } from "lucide-react";

export default function ImportButton({ onImport, accept = ".xlsx,.xls,.csv" }) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 border border-[#e6e4dd] rounded-lg px-3 py-1.5 text-[12px] font-medium hover:bg-[#f6f5f1] transition-colors"
        title="Import from file"
      >
        <FileUp size={14} className="text-[#0e3b3a]" />
        Import
      </button>
    </>
  );
}
