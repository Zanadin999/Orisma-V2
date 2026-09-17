// Data import functions — handles Excel/CSV files from multiple historical formats.
import * as XLSX from 'xlsx';

// Import inventory from Excel/CSV — auto-detects ALL formats:
//  • New 26-col Complete Report (Date Acquired, Days, Status, Brand, Nama Kendaraan, Color, ... Zakat Status)
//  • Old 23/22-col Complete Report & Old 19-col ledger
//  • Inventory export (stock-only, new acquisition format)
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
        // Keep all headers including blank at 25 so Zakat Status at 26 stays aligned (do NOT filter)
        const headers = raw[headerIdx].map(h => String(h||"").trim());
        const rows = raw.slice(headerIdx + 1);
        jsonData = rows.map(r => {
          const obj = {};
          headers.forEach((h, ci) => { if (h) obj[h] = r[ci]; });
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
      const isNew26 = keys.some(k => k === "Zakat Status" || k.includes("Color / Warna"));
      const isNew22 = !isNew26 && keys.some(k => k.includes("Days in Showroom") || k.includes("Harga Setelah Perbaikan"));
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

      if (isNew26) {
        const units = [];
        const transactions = [];
        jsonData.forEach((row, idx) => {
          if (!row["Nama Kendaraan"] && !row["Plat"]) return;
          const dateAcquired = dmyToISO(row["Date Acquired"]) || new Date().toISOString().slice(0,10);
          const dateSoldRaw = row["Date Sold"];
          const hasSaleDate = dateSoldRaw && String(dateSoldRaw).trim() !== "---" && String(dateSoldRaw).trim() !== "";
          const dateSold = hasSaleDate ? dmyToISO(dateSoldRaw) : "";
          const hargaBeli = parseRp(row["Harga Beli (Acquisition)"]);
          const repairFee = parseRp(row["Repair Fee / Biaya Perbaikan"]);
          const tenaga = parseRp(row["Tenaga (Komisi Bonus)"]);
          const komisi = parseRp(row["Komisi"]);
          const lain = parseRp(row["Lain-lain"]);
          const hargaTerjualRaw = row["Harga Terjual (Gross)"];
          const hargaTerjual = parseRp(hargaTerjualRaw);
          const statusRaw = String(row["Status"]||"").toLowerCase();
          const isSold = (statusRaw === "sold" || statusRaw === "terjual" || statusRaw.includes("tukar")) || (hargaTerjual > 0 && String(hargaTerjualRaw??"").trim() !== "---" && hargaTerjualRaw != null);
          const isTradeinRow = statusRaw.includes("tukar") || String(row["Keterangan"]||"").toLowerCase().includes("tukar tambah");
          const zakatStatusRaw = String(row["Zakat Status"]||"").toLowerCase();
          const name = row["Nama Kendaraan"] || "";
          const plate = row["Plat"] || "";
          const brandVal = row["Brand (Category)"] || "";
          const color = String(row["Color / Warna"]||"").trim();
          const unitId = `imported-${Date.now()}-${idx}`;
          const unit = {
            id: unitId,
            dateAcquired,
            name,
            category: inferCategory(name, brandVal),
            year: Number(row["Tahun"]) || new Date().getFullYear(),
            plate,
            color,
            unitPrice: hargaBeli,
            repairFee,
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
            const hargaSetelahPerbaikan = hargaBeli + repairFee + tenaga + komisi + lain;
            const laba = hargaTerjual - hargaSetelahPerbaikan;
            const zakat = laba > 0 ? laba * 0.025 : 0;
            const net = laba - zakat;
            const zakatPaid = zakatStatusRaw.includes("paid") || zakatStatusRaw.includes("sudah") || isTradeinRow;
            transactions.push({
              unitId, name: unit.name, category: unit.category, plate: unit.plate, year: unit.year,
              unitPrice: unit.unitPrice, repairFee: unit.repairFee, cost: hargaSetelahPerbaikan, grossProfit: laba, zakat, netIncome: net,
              minPrice: hargaSetelahPerbaikan, sellingPrice: hargaTerjual,
              paymentMethod: isTradeinRow ? "tradein" : "cash",
              downPayment: 0, financingCompany: null, commission: 0,
              buyerName: row["Nama Pembeli"] && String(row["Nama Pembeli"]).trim() !== "---" ? row["Nama Pembeli"] : "Unknown Buyer",
              buyerAddress: row["Alamat Pembeli"] && String(row["Alamat Pembeli"]).trim() !== "---" ? row["Alamat Pembeli"] : "",
              buyerContact: row["Alamat Pembeli"] && String(row["Alamat Pembeli"]).trim() !== "---" ? row["Alamat Pembeli"] : "",
              notes: row["Keterangan"] || "", soldDate: dateSold || dateAcquired, saleType: isTradeinRow ? "tradein" : "regular",
              zakatPaid,
            });
          }
        });
        onSuccess(units, transactions);
        return;
      }

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
