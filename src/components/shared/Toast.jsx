import React from "react";

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0e3b3a] text-white text-[13px] px-4 py-2.5 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}
