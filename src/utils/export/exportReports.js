// Export functions for sales reports.
import * as XLSX from 'xlsx';
import { arrayToCSV, downloadFile, formatDMY, formatRp, getZakatFraction, calcDays, brandLabel } from './exportHelpers.js';

export function exportReportsToExcel(transactions, availableUnits) {
  const wb = XLSX.utils.book_new();
  const transactionsData = transactions.map(t => ({
    'Sale Date': t.soldDate,
    'Nama Kendaraan': t.name,
    'Category (Brand)': t.category,
    'Tahun': t.year,
    'Plat Nomor': t.plate,
    'Selling Price (Rp)': t.sellingPrice,
    'Payment Method': t.paymentMethod || 'cash',
    'Down Payment (Rp)': t.downPayment || 0,
    'Financing Company': t.financingCompany || '-',
    'Cost Basis (Rp)': t.cost,
    'Gross Profit (Rp)': t.grossProfit,
    'Zakat (Rp)': t.zakat,
    'Commission (Rp)': t.commission || 0,
    'Net Income (Rp)': t.netIncome + (t.commission || 0),
    'Buyer Name': t.buyerName,
    'Buyer Contact': t.buyerContact,
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');
  const inventoryData = availableUnits.map(u => ({
    'Date Acquired': u.dateAcquired,
    'Nama Kendaraan': u.name,
    'Category (Brand)': u.category,
    'Tahun': u.year,
    'Plat Nomor': u.plate,
  }));
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Current Stock');
  XLSX.writeFile(wb, `Reports_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportCompleteReport(units, transactions) {
  const wb = XLSX.utils.book_new();
  const txMap = {};
  transactions.forEach(t => { txMap[t.unitId] = t; });
  const sorted = [...units].sort((a, b) => String(a.dateAcquired).localeCompare(String(b.dateAcquired)));
  const rows = sorted.map(u => {
    const tx = txMap[u.id];
    const isSold = u.status === 'sold' && !!tx;
    const isTradein = isSold && (u.saleType === 'tradein' || tx.saleType === 'tradein' || tx.paymentMethod === 'tradein');
    const hargaBeli = Number(u.unitPrice) || 0;
    const repairFee = Number(u.repairFee ?? u.costUnit ?? u.additionalCost ?? 0) || 0;
    const rawTenaga = u.additionalCost1;
    const rawKomisi = u.additionalCost2;
    const rawLain = u.additionalCost3;
    const tenaga = rawTenaga === undefined || rawTenaga === null || rawTenaga === '' ? 130000 : Number(rawTenaga) || 0;
    const komisi = rawKomisi === undefined || rawKomisi === null || rawKomisi === '' ? 0 : Number(rawKomisi) || 0;
    const lain = rawLain === undefined || rawLain === null || rawLain === '' ? 10000 : Number(rawLain) || 0;
    const hargaSetelahPerbaikan = hargaBeli + repairFee + tenaga + komisi + lain;
    const days = calcDays(u.dateAcquired, isSold ? tx.soldDate : '');
    let hargaTerjual = '---', zakatPct = '---', zakatFee = '---', netIncome = '---', zakatStatus = '---';
    if (isSold) {
      const selling = Number(tx.sellingPrice) || 0;
      const laba = selling - hargaSetelahPerbaikan;
      const rate = getZakatFraction();
      const zakatNum = laba > 0 ? laba * rate : 0;
      const netNum = laba - zakatNum;
      hargaTerjual = formatRp(selling);
      zakatPct = `${(rate * 100).toFixed(2).replace('.', ',')}%`;
      zakatFee = formatRp(zakatNum);
      netIncome = formatRp(netNum);
      if ((tx.zakat || zakatNum) > 0) zakatStatus = tx.zakatPaid ? 'Paid / Sudah Dibayar' : 'Unpaid / Belum Dibayar';
      else zakatStatus = 'No Zakat';
    }
    return {
      'Date Acquired': formatDMY(u.dateAcquired),
      'Date Sold': isSold ? formatDMY(tx.soldDate) : '---',
      'Days in Showroom': days,
      'Status': isTradein ? 'Tukar Tambah' : (isSold ? 'Sold' : 'Available'),
      'Brand (Category)': brandLabel(u.category),
      'Nama Kendaraan': u.name || '---',
      'Color / Warna': u.color || '---',
      'Tahun': u.year || '---',
      'Plat': u.plate || '---',
      'Nama Pemilik': u.ownerName || '---',
      'Alamat Pemilik': u.ownerAddress || '---',
      'Harga Beli (Acquisition)': formatRp(hargaBeli),
      'Repair Fee / Biaya Perbaikan': formatRp(repairFee),
      'Tenaga (Komisi Bonus)': formatRp(tenaga),
      'Komisi': komisi ? formatRp(komisi) : '',
      'Lain-lain': formatRp(lain),
      'Harga Setelah Perbaikan': formatRp(hargaSetelahPerbaikan),
      'Harga Terjual (Gross)': hargaTerjual,
      'Zakat 2.5%': zakatPct,
      'Zakat Fee (Rp)': zakatFee,
      'Net Income': netIncome,
      'Keterangan': isSold ? (tx.notes || '---') : (u.notes || '---'),
      'Nama Pembeli': isSold ? (tx.buyerName || '---') : '---',
      'Alamat Pembeli': isSold ? (tx.buyerAddress || tx.buyerContact || '---') : '---',
      '': '',
      'Zakat Status': zakatStatus,
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 18 }, { wch: 28 },
    { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
    { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
    { wch: 18 }, { wch: 28 }, { wch: 8 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'MONTHLY REPORT');
  XLSX.writeFile(wb, `Complete_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportCompleteReportCSV(units, transactions) {
  const txMap = {};
  transactions.forEach(t => { txMap[t.unitId] = t; });
  const sorted = [...units].sort((a, b) => String(a.dateAcquired).localeCompare(String(b.dateAcquired)));
  const rows = sorted.map(u => {
    const tx = txMap[u.id];
    const isSold = u.status === 'sold' && !!tx;
    const isTradein = isSold && (u.saleType === 'tradein' || tx.saleType === 'tradein' || tx.paymentMethod === 'tradein');
    const hargaBeli = Number(u.unitPrice) || 0;
    const repairFee = Number(u.repairFee ?? u.costUnit ?? u.additionalCost ?? 0) || 0;
    const tenaga = Number(u.additionalCost1) || 0;
    const komisi = Number(u.additionalCost2) || 0;
    const lain = Number(u.additionalCost3) || 0;
    const hargaSetelahPerbaikan = hargaBeli + repairFee + tenaga + komisi + lain;
    const days = calcDays(u.dateAcquired, isSold ? tx.soldDate : '');
    let hargaTerjual = '---', zakatPct = '---', zakatFee = '---', netIncome = '---', zakatStatus = '---';
    if (isSold) {
      const selling = Number(tx.sellingPrice) || 0;
      const laba = selling - hargaSetelahPerbaikan;
      const rate = getZakatFraction();
      const zakatNum = laba > 0 ? laba * rate : 0;
      const netNum = laba - zakatNum;
      hargaTerjual = formatRp(selling);
      zakatPct = `${(rate * 100).toFixed(2).replace('.', ',')}%`;
      zakatFee = formatRp(zakatNum);
      netIncome = formatRp(netNum);
      if ((tx.zakat || zakatNum) > 0) zakatStatus = tx.zakatPaid ? 'Paid / Sudah Dibayar' : 'Unpaid / Belum Dibayar';
      else zakatStatus = 'No Zakat';
    }
    return {
      'Date Acquired': formatDMY(u.dateAcquired),
      'Date Sold': isSold ? formatDMY(tx.soldDate) : '---',
      'Days in Showroom': days,
      'Status': isTradein ? 'Tukar Tambah' : (isSold ? 'Sold' : 'Available'),
      'Brand (Category)': brandLabel(u.category),
      'Nama Kendaraan': u.name || '---',
      'Color / Warna': u.color || '---',
      'Tahun': u.year || '---',
      'Plat': u.plate || '---',
      'Nama Pemilik': u.ownerName || '---',
      'Alamat Pemilik': u.ownerAddress || '---',
      'Harga Beli (Acquisition)': formatRp(hargaBeli),
      'Repair Fee / Biaya Perbaikan': formatRp(repairFee),
      'Tenaga (Komisi Bonus)': formatRp(tenaga),
      'Komisi': komisi ? formatRp(komisi) : '',
      'Lain-lain': formatRp(lain),
      'Harga Setelah Perbaikan': formatRp(hargaSetelahPerbaikan),
      'Harga Terjual (Gross)': hargaTerjual,
      'Zakat 2.5%': zakatPct,
      'Zakat Fee (Rp)': zakatFee,
      'Net Income': netIncome,
      'Keterangan': isSold ? (tx.notes || '---') : (u.notes || '---'),
      'Nama Pembeli': isSold ? (tx.buyerName || '---') : '---',
      'Alamat Pembeli': isSold ? (tx.buyerAddress || tx.buyerContact || '---') : '---',
      '': '',
      'Zakat Status': zakatStatus,
    };
  });
  const csv = arrayToCSV(rows);
  downloadFile(csv, `Complete_Report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportReportsToCSV(transactions) {
  const data = transactions.map(t => ({
    'Sale Date': t.soldDate,
    'Nama Kendaraan': t.name,
    'Category (Brand)': t.category,
    'Tahun': t.year,
    'Plat Nomor': t.plate,
    'Selling Price (Rp)': t.sellingPrice,
    'Payment Method': t.paymentMethod || 'cash',
    'Down Payment (Rp)': t.downPayment || 0,
    'Financing Company': t.financingCompany || '-',
    'Cost Basis (Rp)': t.cost,
    'Gross Profit (Rp)': t.grossProfit,
    'Zakat (Rp)': t.zakat,
    'Commission (Rp)': t.commission || 0,
    'Net Income (Rp)': t.netIncome + (t.commission || 0),
    'Buyer Name': t.buyerName,
    'Buyer Contact': t.buyerContact,
  }));
  const csv = arrayToCSV(data);
  downloadFile(csv, `Transactions_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}
