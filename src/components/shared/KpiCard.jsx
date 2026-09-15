import React from "react";

export default function KpiCard({ label, value, valueClassName = "" }) {
  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-4">
      <div className="text-[12.5px] text-[#7c8783] mb-2">{label}</div>
      <div
        className={`text-2xl font-semibold ${valueClassName}`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {value}
      </div>
    </div>
  );
}
