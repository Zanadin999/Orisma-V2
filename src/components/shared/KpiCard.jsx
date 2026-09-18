import React from "react";

export default function KpiCard({ label, value, valueClassName = "", children, subtext }) {
  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="text-[12.5px] text-[#7c8783] mb-2">{label}</div>
        <div
          className={`text-2xl font-semibold ${valueClassName}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {value}
        </div>
      </div>
      {subtext && <div className="text-[11px] text-[#7c8783] mt-2">{subtext}</div>}
      {children}
    </div>
  );
}
