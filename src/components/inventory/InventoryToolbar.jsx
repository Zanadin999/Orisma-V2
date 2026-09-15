import React from "react";
import { Search } from "lucide-react";

export default function InventoryToolbar({ query, onQueryChange }) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-4">
      <div className="flex-1 min-w-[180px] max-w-xs flex items-center gap-2 border border-[#e6e4dd] rounded-lg px-3 py-2 bg-white">
        <Search size={14} className="text-[#7c8783]" />
        <input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search unit or plate number…"
          className="outline-none text-[13px] flex-1 bg-transparent"
        />
      </div>
    </div>
  );
}
