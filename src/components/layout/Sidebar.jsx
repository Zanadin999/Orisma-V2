import React from "react";
import NavItem from "./NavItem";
import { NAV_ITEMS } from "../../data/nav";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ activeTab, onSelectTab }) {
  const { settings, t } = useSettings();
  const { currentUser } = useAuth();
  const initials = currentUser.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  return (
    <aside className="w-56 shrink-0 bg-[#0e3b3a] text-[#cfe6df] flex flex-col p-5">
      <div
        className="text-white font-semibold text-lg mb-8 tracking-tight truncate"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        title={settings.shopName}
      >
        {settings.shopName.split(" ")[0]} <span className="text-teal-300">{settings.shopName.split(" ").slice(1).join(" ")}</span>
      </div>

      <nav className="space-y-1 mb-8">
        <div className="text-[11px] text-teal-200/70 px-2 mb-2">{t("overview")}</div>
        {NAV_ITEMS.map(({ key, label, icon }) => (
          <NavItem
            key={key}
            icon={icon}
            label={t(key) || label}
            active={activeTab === key}
            onClick={() => onSelectTab(key)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-[#1e504d] flex items-center gap-2.5 text-[12.5px] text-teal-200/80">
        <div
          className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-semibold shrink-0"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium text-white text-[12px]">{currentUser.name}</div>
          <div className="text-[11px] capitalize">{currentUser.role} • {settings.shopShortName}</div>
        </div>
      </div>
    </aside>
  );
}
