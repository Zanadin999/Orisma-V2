import React from "react";

export default function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 text-sm px-2.5 py-2 rounded-lg transition-colors ${
        active ? "bg-[#153f3d] text-white font-medium" : "hover:bg-[#123634]/60 text-[#cfe6df]"
      }`}
    >
      <Icon size={16} className={active ? "opacity-100" : "opacity-80"} />
      {label}
    </button>
  );
}
