import { LayoutDashboard, Package, ShoppingCart, Handshake, BarChart3, Settings, Users } from "lucide-react";

export const NAV_ITEMS = [
  { key: "dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { key: "inventory",   label: "Inventory",        icon: Package },
  { key: "sales",       label: "Sales / POS",      icon: ShoppingCart },
  { key: "acquisition", label: "Unit Acquisition", icon: Handshake },
  { key: "reports",     label: "Reports",          icon: BarChart3 },
  { key: "settings",    label: "Settings",         icon: Settings },
  { key: "accounts",    label: "Accounts",         icon: Users },
];
