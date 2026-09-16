import React, { useRef } from "react";

function formatID(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

function parseID(formatted) {
  const digits = String(formatted || "").replace(/\D/g, "");
  return digits ? digits : "";
}

export default function CurrencyInput({ value, onChange, placeholder = "Rp 0", className = "", disabled }) {
  const inputRef = useRef(null);
  const raw = String(value ?? "");
  const display = raw ? `Rp ${formatID(raw)}` : "";

  function handleChange(e) {
    const input = e.target.value;
    // allow Rp prefix, dots, commas
    const digits = input.replace(/\D/g, "");
    // prevent leading zeros: keep as digits
    onChange(digits);
  }

  function addAmount(delta) {
    const current = Number(parseID(display) || raw || 0);
    const next = current + delta;
    onChange(String(next));
  }

  function clear() { onChange(""); }

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 pr-9 text-[13px] outline-none focus:border-teal-600"
        />
        {raw && (
          <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#7c8783] hover:text-[#0e3b3a] px-1">✕</button>
        )}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {[500000, 1000000, 5000000].map(v => (
          <button key={v} type="button" onClick={() => addAmount(v)} className="text-[11px] border border-[#e6e4dd] rounded-full px-2.5 py-1 hover:bg-[#f6f5f1]">+{v >= 1000000 ? `${v/1000000}jt` : `${v/1000}rb`}</button>
        ))}
        <span className="text-[11px] text-[#7c8783] self-center ml-1">Live: Rp {formatID(raw) || "0"}</span>
      </div>
    </div>
  );
}
