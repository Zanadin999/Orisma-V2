import * as XLSX from "xlsx";
import { rupiah, fmtDate, costBasis, hargaModal } from "./pricing";

// Convert data to CSV string
function arrayToCSV(data) {
  if (!data || data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      const strValue = String(value ?? "");
      if (strValue.includes(",") || strValue.includes("\n") || strValue.includes('"')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(",")
  );
  
  return [headers.join(","), ...rows].join("\n");
}

// Download file helper
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helpers matching ledger formatting
function formatDMY(iso) {
  if (!iso) return "---";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "---";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function formatRp(n) {
  const v = Math.round(Number(n) || 0);
  return "Rp " + v.toLocaleString("id-ID");
}
function getZakatFraction() {
  try {
    const raw = localStorage.getItem("orisma_settings_v1");
    if (raw) {
      const s = JSON.parse(raw);
      if (s.zakatRate != null) return Number(s.zakatRate) / 100;
    }
  } catch {}
  return 0.025;
}
function calcDays(dateAcquired, soldDate) {
  if (!dateAcquired) return "---";
  const start = new Date(dateAcquired + "T00:00:00");
  if (isNaN(start.getTime())) return "---";
  let end;
  if (soldDate && soldDate !== "---" && soldDate !== "") {
    end = new Date(soldDate + "T00:00:00");
    if (isNaN(end.getTime())) end = new Date();
  } else {
    end = new Date();
  }
  const diff = Math.round((end - start) / 86400000);
  return diff >= 0 ? diff : "---";
}
function brandLabel(key) {
  const map = { honda: "Honda", yamaha: "Yamaha", suzuki: "Suzuki", kawasaki: "Kawasaki", vespa: "Vespa", lainnya: "Lainnya" };
  return map[String(key||"").toLowerCase()] || String(key||"honda");
}

// Export inventory to Excel
export function exportInventoryToExcel(units) {
  const data = units.map(u => ({
    "Date Acquired": u.dateAcquired,
    "Nama Kendaraan": u.name,
    "Category (Brand)": u.category,
    "Tahun Keluaran": u.year,
    "Plat Nomor": u.plate,
    "Harga Unit (Rp)": u.unitPrice,
    "Cost Unit (Rp)": u.costUnit,
    "Additional Cost (Rp)": u.additionalCost,
    "Cost Basis (Rp)": costBasis(u),
    "Acquisition Source": u.acquisitionSource || "purchase",
    "Status": u.status,
    "Nama Pemilik": u.ownerName,
    "Alamat Pemilik": u.ownerAddress,
    "Additional Info": u.notes || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  ws["!cols"] = colWidths;
  
  XLSX.writeFile(wb, `Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Export inventory to CSV
export function exportInventoryToCSV(units) {
  const data = units.map(u => ({
    "Date Acquired": u.dateAcquired,
    "Nama Kendaraan": u.name,
    "Category (Brand)": u.category,
    "Tahun Keluaran": u.year,
    "Plat Nomor": u.plate,
    "Harga Unit (Rp)": u.unitPrice,
    "Cost Unit (Rp)": u.costUnit,
    "Additional Cost (Rp)": u.additionalCost,
    "Cost Basis (Rp)": costBasis(u),
    "Acquisition Source": u.acquisitionSource || "purchase",
    "Status": u.status,
    "Nama Pemilik": u.ownerName,
    "Alamat Pemilik": u.ownerAddress,
    "Additional Info": u.notes || "",
  }));

  const csv = arrayToCSV(data);
  downloadFile(csv, `Inventory_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
}

// Export transactions/reports to Excel
export function exportReportsToExcel(transactions, availableUnits) {
  const wb = XLSX.utils.book_new();
  
  const transactionsData = transactions.map(t => ({
    "Sale Date": t.soldDate,
    "Nama Kendaraan": t.name,
    "Category (Brand)": t.category,
    "Tahun": t.year,
    "Plat Nomor": t.plate,
    "Selling Price (Rp)": t.sellingPrice,
    "Payment Method": t.paymentMethod || "cash",
    "Down Payment (Rp)": t.downPayment || 0,
    "Financing Company": t.financingCompany || "-",
    "Cost Basis (Rp)": t.cost,
    "Gross Profit (Rp)": t.grossProfit,
    "Zakat (Rp)": t.zakat,
    "Commission (Rp)": t.commission || 0,
    "Net Income (Rp)": t.netIncome + (t.commission || 0),
    "Buyer Name": t.buyerName,
    "Buyer Contact": t.buyerContact,
  }));
  
  const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");
  
  const inventoryData = availableUnits.map(u => ({
    "Date Acquired": u.dateAcquired,
    "Nama Kendaraan": u.name,
    "Category (Brand)": u.category,
    "Tahun": u.year,
    "Plat Nomor": u.plate,
    "Cost Basis (Rp)": costBasis(u),
  }));
  
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, wsInventory, "Current Stock");
  
  XLSX.writeFile(wb, `Reports_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Export complete report — NEW 22-col layout (no CLOSE BOOK)
// 1 Date Acquired | 2 Date Sold | 3 Days | 4 Status | 5 Brand | 6 Nama Kendaraan | 7 Tahun | 8 Plat | 9 Nama Pemilik | 10 Alamat Pemilik | 11 Harga Unit | 12 Tenaga | 13 Komisi | 14 Lain-lain | 15 Harga Setelah Perbaikan | 16 Harga Terjual | 17 Zakat 2.5% | 18 Zakat Fee | 19 Net Income | 20 Keterangan | 21 Nama Pembeli | 22 Alamat Pembeli
export function exportCompleteReport(units, transactions) {
  const wb = XLSX.utils.book_new();
  
  const txMap = {};
  transactions.forEach(t => { txMap[t.unitId] = t; });

  const sorted = [...units].sort((a, b) => String(a.dateAcquired).localeCompare(String(b.dateAcquired)));

  const rows = sorted.map(u => {
    const tx = txMap[u.id];
    const isSold = u.status === "sold" && !!tx;
    const isTradein = isSold && (u.saleType === "tradein" || tx.saleType === "tradein" || tx.paymentMethod === "tradein");

    // Cost breakdown: Harga Unit = unitPrice (+legacy costUnit/additionalCost)
    const hargaUnit = (Number(u.unitPrice) || 0) + (Number(u.costUnit) || 0) + (Number(u.additionalCost) || 0);
    const rawTenaga = u.additionalCost1;
    const rawKomisi = u.additionalCost2;
    const rawLain = u.additionalCost3;
    const tenaga = rawTenaga === undefined || rawTenaga === null || rawTenaga === "" ? 130000 : Number(rawTenaga) || 0;
    const komisi = rawKomisi === undefined || rawKomisi === null || rawKomisi === "" ? 0 : Number(rawKomisi) || 0;
    const lain = rawLain === undefined || rawLain === null || rawLain === "" ? 10000 : Number(rawLain) || 0;

    const hargaSetelahPerbaikan = hargaUnit + tenaga + komisi + lain;
    const days = calcDays(u.dateAcquired, isSold ? tx.soldDate : "");

    let hargaTerjual = "---";
    let zakatPct = "---";
    let zakatFee = "---";
    let netIncome = "---";

    if (isSold) {
      const selling = Number(tx.sellingPrice) || 0;
      const laba = selling - hargaSetelahPerbaikan;
      const rate = getZakatFraction();
      const zakatNum = laba > 0 ? laba * rate : 0;
      const netNum = laba - zakatNum;
      hargaTerjual = formatRp(selling);
      zakatPct = `${(rate*100).toFixed(2).replace(".", ",")}%`;
      zakatFee = formatRp(zakatNum);
      netIncome = formatRp(netNum);
    }

    return {
      "Date Acquired": formatDMY(u.dateAcquired),
      "Date Sold": isSold ? formatDMY(tx.soldDate) : "---",
      "Days in Showroom": days,
      "Status": isTradein ? "Tukar Tambah" : (isSold ? "Sold" : "Available"),
      "Brand (Category)": brandLabel(u.category),
      "Nama Kendaraan": u.name || "---",
      "Tahun": u.year || "---",
      "Plat": u.plate || "---",
      "Nama Pemilik": u.ownerName || "---",
      "Alamat Pemilik": u.ownerAddress || "---",
      "Harga Unit (Acquisition)": formatRp(hargaUnit),
      "Tenaga (Komisi Bonus)": formatRp(tenaga),
      "Komisi": komisi ? formatRp(komisi) : "",
      "Lain-lain": formatRp(lain),
      "Harga Setelah Perbaikan": formatRp(hargaSetelahPerbaikan),
      "Harga Terjual (Gross)": hargaTerjual,
      "Zakat 2.5%": zakatPct,
      "Zakat Fee (Rp)": zakatFee,
      "Net Income": netIncome,
      "Keterangan": isSold ? (tx.notes || "---") : (u.notes || "---"),
      "Nama Pembeli": isSold ? (tx.buyerName || "---") : "---",
      "Alamat Pembeli": isSold ? (tx.buyerAddress || tx.buyerContact || "---") : "---",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws["!cols"] = [
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 30 }, { wch: 8 }, { wch: 14 }, { wch: 18 }, { wch: 28 },
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
    { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
    { wch: 18 }, { wch: 28 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "MONTHLY REPORT");
  
  XLSX.writeFile(wb, `Complete_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Export complete report to CSV — same 22-col layout
export function exportCompleteReportCSV(units, transactions) {
  const txMap = {};
  transactions.forEach(t => { txMap[t.unitId] = t; });
  const sorted = [...units].sort((a, b) => String(a.dateAcquired).localeCompare(String(b.dateAcquired)));

  const rows = sorted.map(u => {
    const tx = txMap[u.id];
    const isSold = u.status === "sold" && !!tx;
    const isTradein = isSold && (u.saleType === "tradein" || tx.saleType === "tradein" || tx.paymentMethod === "tradein");
    const hargaUnit = (Number(u.unitPrice) || 0) + (Number(u.costUnit) || 0) + (Number(u.additionalCost) || 0);
    const rawTenaga2 = u.additionalCost1;
    const rawKomisi2 = u.additionalCost2;
    const rawLain2 = u.additionalCost3;
    const tenaga = rawTenaga2 === undefined || rawTenaga2 === null || rawTenaga2 === "" ? 130000 : Number(rawTenaga2) || 0;
    const komisi = rawKomisi2 === undefined || rawKomisi2 === null || rawKomisi2 === "" ? 0 : Number(rawKomisi2) || 0;
    const lain = rawLain2 === undefined || rawLain2 === null || rawLain2 === "" ? 10000 : Number(rawLain2) || 0;
    const hargaSetelahPerbaikan = hargaUnit + tenaga + komisi + lain;
    const days = calcDays(u.dateAcquired, isSold ? tx.soldDate : "");
    let hargaTerjual = "---", zakatPct = "---", zakatFee = "---", netIncome = "---";
    if (isSold) {
      const selling = Number(tx.sellingPrice) || 0;
      const laba = selling - hargaSetelahPerbaikan;
      const rate2 = getZakatFraction();
      const zakatNum = laba > 0 ? laba * rate2 : 0;
      const netNum = laba - zakatNum;
      hargaTerjual = formatRp(selling);
      zakatPct = `${(rate2*100).toFixed(2).replace(".", ",")}%`;
      zakatFee = formatRp(zakatNum);
      netIncome = formatRp(netNum);
    }
    return {
      "Date Acquired": formatDMY(u.dateAcquired),
      "Date Sold": isSold ? formatDMY(tx.soldDate) : "---",
      "Days in Showroom": days,
      "Status": isTradein ? "Tukar Tambah" : (isSold ? "Sold" : "Available"),
      "Brand (Category)": brandLabel(u.category),
      "Nama Kendaraan": u.name || "---",
      "Tahun": u.year || "---",
      "Plat": u.plate || "---",
      "Nama Pemilik": u.ownerName || "---",
      "Alamat Pemilik": u.ownerAddress || "---",
      "Harga Unit (Acquisition)": formatRp(hargaUnit),
      "Tenaga (Komisi Bonus)": formatRp(tenaga),
      "Komisi": komisi ? formatRp(komisi) : "",
      "Lain-lain": formatRp(lain),
      "Harga Setelah Perbaikan": formatRp(hargaSetelahPerbaikan),
      "Harga Terjual (Gross)": hargaTerjual,
      "Zakat 2.5%": zakatPct,
      "Zakat Fee (Rp)": zakatFee,
      "Net Income": netIncome,
      "Keterangan": isSold ? (tx.notes || "---") : (u.notes || "---"),
      "Nama Pembeli": isSold ? (tx.buyerName || "---") : "---",
      "Alamat Pembeli": isSold ? (tx.buyerAddress || tx.buyerContact || "---") : "---",
    };
  });

  const csv = arrayToCSV(rows);
  downloadFile(csv, `Complete_Report_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
}

export function exportReportsToCSV(transactions) {
  const data = transactions.map(t => ({
    "Sale Date": t.soldDate,
    "Nama Kendaraan": t.name,
    "Category (Brand)": t.category,
    "Tahun": t.year,
    "Plat Nomor": t.plate,
    "Selling Price (Rp)": t.sellingPrice,
    "Payment Method": t.paymentMethod || "cash",
    "Down Payment (Rp)": t.downPayment || 0,
    "Financing Company": t.financingCompany || "-",
    "Cost Basis (Rp)": t.cost,
    "Gross Profit (Rp)": t.grossProfit,
    "Zakat (Rp)": t.zakat,
    "Commission (Rp)": t.commission || 0,
    "Net Income (Rp)": t.netIncome + (t.commission || 0),
    "Buyer Name": t.buyerName,
    "Buyer Contact": t.buyerContact,
  }));

  const csv = arrayToCSV(data);
  downloadFile(csv, `Transactions_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
}

// Import inventory from Excel/CSV — auto-detects ALL formats:
//  • New 22-col Complete Report (Date Acquired, Days in Showroom, Status, Brand ...)
//  • Old 19-col ledger (Tanggal Unit Masuk, NAMA KENDARAAN, ...)
//  • Inventory export (Date Acquired, Nama Kendaraan, ...)
// Calls onSuccess(units, transactions)
export function importInventoryFromFile(file, onSuccess, onError) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      let jsonData = XLSX.utils.sheet_to_json(firstSheet);
      const raw = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: null, blankrows: false, raw: false });
      let headerIdx = -1;
      for (let i = 0; i < Math.min(4, raw.length); i++) {
        if (raw[i] && raw[i].some(v => {
          const s = String(v||"");
          return s.includes("Tanggal Unit Masuk") || s.includes("Date Acquired");
        })) {
          headerIdx = i;
          break;
        }
      }
      if (headerIdx >= 0) {
        const headers = raw[headerIdx].map(h => String(h||"").trim()).filter(Boolean);
        const rows = raw.slice(headerIdx + 1);
        jsonData = rows.map(r => {
          const obj = {};
          headers.forEach((h, ci) => { obj[h] = r[ci]; });
          return obj;
        }).filter(r => Object.values(r).some(v => v != null && String(v).trim() !== "" && !String(Object.values(r)[0]||"").includes("CLOSE BOOK")));
        // also filter CLOSE BOOK
        jsonData = jsonData.filter(r => !String(r["Date Acquired"]||r["Tanggal Unit Masuk (Acquisition)"]||"").includes("CLOSE BOOK"));
      }
      if (!jsonData || jsonData.length === 0) {
        onSuccess([], []);
        return;
      }

      const firstRow = jsonData[0] || {};
      const keys = Object.keys(firstRow);
      const isNew22 = keys.some(k => k.includes("Days in Showroom") || k.includes("Harga Setelah Perbaikan"));
      const isOld19 = keys.some(k => k.includes("Tanggal Unit Masuk") || k.includes("HARGA MODAL UNIT"));

      const parseRp = (v) => {
        if (v == null || v === "" || v === "---") return 0;
        if (typeof v === "number") return Math.round(v);
        const cleaned = String(v).replace(/[^0-9\-]/g, "");
        return cleaned ? Number(cleaned) : 0;
      };
      const dmyToISO = (v) => {
        if (!v || v === "---" || v === "") return "";
        const s = String(v).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
        const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
        return s;
      };
      const inferCategory = (name, brandVal) => {
        if (brandVal && String(brandVal).trim() !== "---" && String(brandVal).trim() !== "") {
          const bv = String(brandVal).toLowerCase().trim();
          if (["honda","yamaha","suzuki","kawasaki","vespa","lainnya"].includes(bv)) return bv;
          // try label
          const n = bv;
          if (n.includes("honda")) return "honda";
          if (n.includes("yamaha")) return "yamaha";
          if (n.includes("suzuki")) return "suzuki";
          if (n.includes("kawasaki")) return "kawasaki";
          if (n.includes("vespa")) return "vespa";
        }
        const n = String(name||"").toLowerCase();
        if (n.includes("honda")) return "honda";
        if (n.includes("yamaha")) return "yamaha";
        if (n.includes("suzuki")) return "suzuki";
        if (n.includes("kawasaki")) return "kawasaki";
        if (n.includes("vespa")) return "vespa";
        return "honda";
      };

      if (isNew22) {
        const units = [];
        const transactions = [];
        jsonData.forEach((row, idx) => {
          if (!row["Nama Kendaraan"] && !row["Plat"]) return;
          const dateAcquired = dmyToISO(row["Date Acquired"]) || new Date().toISOString().slice(0,10);
          const dateSoldRaw = row["Date Sold"];
          const hasSaleDate = dateSoldRaw && String(dateSoldRaw).trim() !== "---" && String(dateSoldRaw).trim() !== "";
          const dateSold = hasSaleDate ? dmyToISO(dateSoldRaw) : "";
          const hargaUnit = parseRp(row["Harga Unit (Acquisition)"]);
          const tenaga = parseRp(row["Tenaga (Komisi Bonus)"]);
          const komisi = parseRp(row["Komisi"]);
          const lain = parseRp(row["Lain-lain"]);
          const hargaTerjualRaw = row["Harga Terjual (Gross)"];
          const hargaTerjual = parseRp(hargaTerjualRaw);
          const statusRaw = String(row["Status"]||"").toLowerCase();
          const isSold = (statusRaw === "sold" || statusRaw === "terjual" || statusRaw.includes("tukar")) || (hargaTerjual > 0 && String(hargaTerjualRaw??"").trim() !== "---" && hargaTerjualRaw != null);
          const isTradeinRow = statusRaw.includes("tukar") || String(row["Keterangan"]||"").toLowerCase().includes("tukar tambah");
          const name = row["Nama Kendaraan"] || "";
          const plate = row["Plat"] || "";
          const brandVal = row["Brand (Category)"] || "";
          const unitId = `imported-${Date.now()}-${idx}`;
          const unit = {
            id: unitId,
            dateAcquired,
            name,
            category: inferCategory(name, brandVal),
            year: Number(row["Tahun"]) || new Date().getFullYear(),
            plate,
            unitPrice: hargaUnit,
            costUnit: 0,
            additionalCost: 0,
            additionalCost1: tenaga || 130000,
            additionalCost2: komisi || 0,
            additionalCost3: lain || 10000,
            acquisitionSource: "purchase",
            ownerName: row["Nama Pemilik"] || "",
            ownerAddress: row["Alamat Pemilik"] || "",
            notes: row["Keterangan"] || "",
            status: isSold ? "sold" : "available",
            saleType: isTradeinRow ? "tradein" : undefined,
          };
          units.push(unit);
          if (isSold) {
            const hargaSetelahPerbaikan = hargaUnit + tenaga + komisi + lain;
            const laba = hargaTerjual - hargaSetelahPerbaikan;
            const zakat = laba > 0 ? laba * 0.025 : 0;
            const net = laba - zakat;
            transactions.push({
              unitId, name: unit.name, category: unit.category, plate: unit.plate, year: unit.year,
              unitPrice: unit.unitPrice, costUnit: 0, additionalCost: 0,
              minPrice: hargaSetelahPerbaikan, sellingPrice: hargaTerjual,
              paymentMethod: isTradeinRow ? "tradein" : "cash",
              downPayment: 0, financingCompany: null, commission: 0,
              buyerName: row["Nama Pembeli"] && String(row["Nama Pembeli"]).trim() !== "---" ? row["Nama Pembeli"] : "Unknown Buyer",
              buyerAddress: row["Alamat Pembeli"] && String(row["Alamat Pembeli"]).trim() !== "---" ? row["Alamat Pembeli"] : "",
              buyerContact: row["Alamat Pembeli"] && String(row["Alamat Pembeli"]).trim() !== "---" ? row["Alamat Pembeli"] : "",
              notes: row["Keterangan"] || "", soldDate: dateSold || dateAcquired, saleType: isTradeinRow ? "tradein" : "regular",
              cost: hargaSetelahPerbaikan, grossProfit: laba, zakat, netIncome: net,
            });
          }
        });
        onSuccess(units, transactions);
        return;
      }

      if (isOld19) {
        const units = [];
        const transactions = [];
        jsonData.forEach((row, idx) => {
          if (String(row["Tanggal Unit Masuk (Acquisition)"]||"").includes("CLOSE BOOK")) return;
          if (!row["NAMA KENDARAAN"] && !row["NOPOL"]) return;
          const dateAcquired = dmyToISO(row["Tanggal Unit Masuk (Acquisition)"]) || new Date().toISOString().slice(0, 10);
          const dateSoldRaw = row["Tanggal Unit Keluar (Sold)"];
          const hasSaleDate = dateSoldRaw && String(dateSoldRaw).trim() !== "---" && String(dateSoldRaw).trim() !== "";
          const dateSold = hasSaleDate ? dmyToISO(dateSoldRaw) : "";
          const modal = parseRp(row["HARGA MODAL UNIT SETELAH PERBAIKAN"]);
          const tenaga = parseRp(row["TENAGA (Komisi Bonus)"]);
          const komisi = parseRp(row["KOMISI"]);
          const lain = parseRp(row["LAIN-LAIN"]);
          const hargaTerjualRaw = row["HARGA TERJUAL"];
          const hargaTerjual = parseRp(hargaTerjualRaw);
          const name = row["NAMA KENDARAAN"] || "";
          const plate = row["NOPOL"] || "";
          const isSold = hargaTerjual > 0 && String(hargaTerjualRaw ?? "").trim() !== "---" && hargaTerjualRaw != null;
          const unitId = `imported-${Date.now()}-${idx}`;
          const unit = {
            id: unitId, dateAcquired, name, category: inferCategory(name, ""), year: Number(row["TAHUN"]) || new Date().getFullYear(), plate,
            unitPrice: modal, costUnit: 0, additionalCost: 0,
            additionalCost1: tenaga || 130000, additionalCost2: komisi || 0, additionalCost3: lain || 10000,
            acquisitionSource: "purchase", ownerName: row["NAMA PEMILIK"] || "", ownerAddress: row["ALAMAT PEMILIK"] || "", notes: isSold ? "" : (row["KETERANGAN"] || ""), status: isSold ? "sold" : "available",
          };
          units.push(unit);
          if (isSold) {
            const cost = modal + tenaga + komisi + lain;
            const grossProfit = hargaTerjual - cost;
            const zakat = grossProfit > 0 ? grossProfit * 0.025 : 0;
            const netIncome = grossProfit - zakat;
            transactions.push({
              unitId, name: unit.name, category: unit.category, plate: unit.plate, year: unit.year,
              unitPrice: unit.unitPrice, costUnit: unit.costUnit, additionalCost: 0,
              minPrice: cost, sellingPrice: hargaTerjual,
              paymentMethod: String(row["KETERANGAN"]||"").toLowerCase().includes("tukar tambah") ? "tradein" : "cash",
              downPayment: 0, financingCompany: null, commission: 0,
              buyerName: row["NAMA PEMBELI"] && String(row["NAMA PEMBELI"]).trim() !== "---" ? row["NAMA PEMBELI"] : "",
              buyerAddress: row["ALAMAT PEMBELI"] && String(row["ALAMAT PEMBELI"]).trim() !== "---" ? row["ALAMAT PEMBELI"] : "",
              buyerContact: row["ALAMAT PEMBELI"] && String(row["ALAMAT PEMBELI"]).trim() !== "---" ? row["ALAMAT PEMBELI"] : "",
              notes: row["KETERANGAN"] && String(row["KETERANGAN"]).trim() !== "---" ? row["KETERANGAN"] : "",
              soldDate: dateSold || dateAcquired, saleType: "regular", cost, grossProfit, zakat, netIncome,
            });
          }
        });
        onSuccess(units, transactions);
        return;
      }

      // Inventory format
      const units = jsonData.map((row, idx) => ({
        id: `imported-${Date.now()}-${idx}`,
        dateAcquired: dmyToISO(row["Date Acquired"]) || row["Date Acquired"] || new Date().toISOString().slice(0, 10),
        name: row["Nama Kendaraan"] || row["NAMA KENDARAAN"] || "",
        category: (row["Category (Brand)"] || "honda").toLowerCase(),
        year: Number(row["Tahun Keluaran"] || row["Tahun"] || row["TAHUN"]) || new Date().getFullYear(),
        plate: row["Plat Nomor"] || row["NOPOL"] || row["Plat"] || "",
        unitPrice: parseRp(row["Harga Unit (Rp)"] ?? row["HARGA MODAL UNIT SETELAH PERBAIKAN"] ?? row["Harga Unit (Acquisition)"]) || 0,
        costUnit: parseRp(row["Cost Unit (Rp)"]) || 0,
        additionalCost: parseRp(row["Additional Cost (Rp)"]) || 0,
        additionalCost1: parseRp(row["TENAGA (Komisi Bonus)"]) || 0,
        additionalCost2: parseRp(row["KOMISI"]) || 0,
        additionalCost3: parseRp(row["LAIN-LAIN"]) || 0,
        status: row["Status"] || "available",
        ownerName: row["Nama Pemilik"] || row["NAMA PEMILIK"] || "",
        ownerAddress: row["Alamat Pemilik"] || row["ALAMAT PEMILIK"] || "",
        notes: row["Additional Info"] || row["KETERANGAN"] || "",
      }));
      
      onSuccess(units, []);
    } catch (err) {
      onError(err.message);
    }
  };
  
  reader.onerror = () => onError("Failed to read file");
  reader.readAsArrayBuffer(file);
}
