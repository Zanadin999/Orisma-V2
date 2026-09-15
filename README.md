# Showroom Orisma — Motorcycle Dashboard

A React + Vite + Tailwind dashboard for a secondhand-motorcycle showroom,
converted from a generic retail-inventory template. Like the original,
there's no backend — all data lives in memory and resets on refresh.

## What's here

| Tab | What it does |
|---|---|
| **Dashboard** | Stock KPIs, a sales trend chart built from real transactions, "longest in stock" units, and inventory-by-brand breakdown |
| **Unit Acquisition** | Add new motorcycles bought from previous owners — the only entry point for new units |
| **Inventory** | View and manage units currently in stock. Edit/delete, filter by brand, search by name or plate |
| **Sales / POS** | Log a sale against an in-stock unit — enforces a minimum price floor, shows gross profit / zakat / net income live, and moves the unit to "sold" |
| **Reports** | Stock value by brand, revenue/net income totals, and a top-brands/top-models performance breakdown |

## Data model

A unit is a **unique motorcycle**, not a restockable SKU — it moves from
`available` to `sold` exactly once, via Sales/POS. Fields match what was
requested for the Excel-aligned format:

- **Unit Details**: Nama Kendaraan, Category (brand), Tahun Keluaran,
  Plat Nomor, Harga Unit, Cost Unit, Additional Cost
- **Unit Acquirement Detail**: Nama Pemilik, Alamat Pemilik, Additional Info

**Pricing formula** (`src/utils/pricing.js`):

```
Harga Minimum Unit = Harga Unit + Cost Unit + Additional Cost + 2.5% × Harga Unit
```

A sale can't be logged below this floor. Separately, each completed sale
computes:

```
Laba Kotor (gross profit) = Harga Terjual − (Harga Unit + Cost Unit + Additional Cost)
Zakat = 2.5% × Laba Kotor  (only if positive)
Net Income = Laba Kotor − Zakat
```

## Project structure

```
src/
  data/          seed data + brand list (brands.js, unitsData.js, salesData.js, nav.js)
  utils/         pricing.js — money/date formatting + the formulas above
  hooks/         useInventory (units), useSales (transactions), useCategories (brands)
  context/       CategoriesContext — shares brands app-wide
  components/
    layout/      Sidebar, NavItem
    shared/      KpiCard, StatusPill, BrandBadge, Toast
    dashboard/   DashboardView, SalesChart, AgingInventory, BrandBreakdown
    inventory/   InventoryView, table/rail/toolbar, Add/Edit modals, UnitFormFields
    sales/       SalesView, LogSaleForm, TransactionList, PerformanceBreakdown
    acquisition/ AcquisitionView, AcquireUnitForm, RecentAcquisitions
    reports/     ReportsView, AssetValueByBrand
  App.jsx        the only place hooks are wired together
```

`App.jsx` is the single orchestration point: completing a sale calls
`useInventory().sellUnit()` first, and only records a transaction via
`useSales().recordSale()` if that succeeds — the two hooks otherwise
know nothing about each other.

## Known limitations

- No backend, no auth — everything is client-side state and resets on refresh.
- No XLSX import/export yet. Field names and shapes were kept close to the
  showroom's existing Excel ledger so that a future import/export feature
  can map to them directly.
- Seed data (units, owners, buyers) is fictional, for demo purposes only.

## Running it

```
npm install
npm run dev
```
