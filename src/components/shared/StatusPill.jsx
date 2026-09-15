import React from "react";

export default function StatusPill({ status, saleType }) {
  if (status === "sold" && saleType === "tradein") {
    return <Pill className="bg-amber-100 text-amber-800">Tukar Tambah</Pill>;
  }
  if (status === "sold") {
    return <Pill className="bg-neutral-100 text-neutral-600">Sold</Pill>;
  }
  return <Pill className="bg-emerald-50 text-emerald-700">Available</Pill>;
}

function Pill({ className, children }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );
}
