import React, { useState } from "react";
import { CategoriesProvider } from "./context/CategoriesContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useInventory } from "./hooks/useInventory";
import { useSales } from "./hooks/useSales";
import { useGoogleFont } from "./hooks/useGoogleFont";
import Sidebar from "./components/layout/Sidebar";
import Toast from "./components/shared/Toast";
import DashboardView from "./components/dashboard/DashboardView";
import InventoryView from "./components/inventory/InventoryView";
import SalesView from "./components/sales/SalesView";
import AcquisitionView from "./components/acquisition/AcquisitionView";
import ReportsView from "./components/reports/ReportsView";
import SettingsView from "./components/settings/SettingsView";
import AccountManagement from "./components/accounts/AccountManagement";
import LoginView from "./components/auth/LoginView";

function AppShell() {
  const { currentUser, logout } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inventory = useInventory();
  const sales = useSales();

  useGoogleFont();

  if (!currentUser) return <LoginView />;

  function handleSelectTab(k) { setTab(k); setDrawerOpen(false); }

  // The only orchestrated action in the app: completing a sale touches
  // both hooks. We only record a transaction if the unit was actually
  // marked sold (sellUnit returns null if it was already gone).
  function handleLogSale(unitId, saleDetails) {
    const unitSnapshot = inventory.sellUnit(unitId);
    if (!unitSnapshot) return;
    sales.recordSale(unitSnapshot, saleDetails);
  }

  // Trade-in orchestration: marks inventory unit as sold, adds new unit,
  // and records the trade-in sale transaction (no zakat)
  function handleTradeIn(tradeInData) {
    const result = inventory.processTradeIn(tradeInData);
    if (!result) return;
    
    sales.recordTradeInSale({
      soldUnit: result.soldUnit,
      acquiredUnit: result.acquiredUnit,
      tradeInValue: result.tradeInValue,
      ownerName: tradeInData.acquiredUnit.ownerName,
      ownerAddress: tradeInData.acquiredUnit.ownerAddress,
      soldDate: tradeInData.acquiredUnit.dateAcquired,
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f6f5f1] text-[#16211f]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-[#0e3b3a] text-[#cfe6df] px-4 py-3">
        <button onClick={() => setDrawerOpen(o => !o)} className="w-9 h-9 grid place-items-center rounded-lg border border-[#1e504d]" aria-label="Menu">☰</button>
        <div className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Showroom <span className="text-teal-300">Orisma</span></div>
        <div className="w-9" />
      </header>

      {/* Sidebar: drawer on mobile, fixed on desktop */}
      <Sidebar activeTab={tab} onSelectTab={handleSelectTab} onLogout={logout} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="flex-1 px-4 lg:px-8 py-5 lg:py-7 max-w-6xl w-full min-w-0 overflow-x-hidden">
        {tab === "dashboard" && (
          <DashboardView
            availableUnits={inventory.availableUnits}
            totalAssetValue={inventory.totalAssetValue}
            transactions={sales.transactions}
            totalNetIncome={sales.totalNetIncome}
          />
        )}

        {tab === "inventory" && (
          <InventoryView
            availableUnits={inventory.availableUnits}
            allUnits={inventory.units}
            onEdit={inventory.editUnit}
            onDelete={inventory.deleteUnit}
            onImport={(units, txs) => {
              inventory.importUnits(units);
              if (txs && txs.length) sales.importTransactions(txs);
            }}
          />
        )}

        {tab === "sales" && (
          <SalesView
            availableUnits={inventory.availableUnits}
            transactions={sales.transactions}
            totalRevenue={sales.totalRevenue}
            totalNetIncome={sales.totalNetIncome}
            lastSale={sales.lastSale}
            topBrands={sales.topBrands}
            topModels={sales.topModels}
            onLogSale={handleLogSale}
          />
        )}

        {tab === "acquisition" && (
          <AcquisitionView 
            units={inventory.units} 
            availableUnits={inventory.availableUnits}
            onAdd={inventory.addUnit}
            onTradeIn={handleTradeIn}
          />
        )}

        {tab === "reports" && (
          <ReportsView
            availableUnits={inventory.availableUnits}
            totalAssetValue={inventory.totalAssetValue}
            transactions={sales.transactions}
            allUnits={inventory.units}
            onToggleZakatPaid={sales.toggleZakatPaid}
            onMarkAllZakatPaid={sales.markAllZakatPaid}
          />
        )}

        {tab === "settings" && <SettingsView />}

        {tab === "accounts" && <AccountManagement />}
      </main>

      <Toast message={inventory.toast} />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CategoriesProvider>
          <AppShell />
        </CategoriesProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
