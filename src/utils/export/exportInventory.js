// Export functions for inventory data.
import * as XLSX from 'xlsx';
import { costBasis } from '../pricing.js';
import { arrayToCSV, downloadFile, formatDMY, formatRp, calcDays, brandLabel } from './exportHelpers.js';

export function exportInventoryToExcel(units) {
  const stock = units.filter(u => u.status === 'available');
  const data = stock.map(u => {
    const hargaBeli = Number(u.unitPrice) || 0;
    const repairFee = Number(u.repairFee ?? u.costUnit ?? 0) || 0;
    const tenaga = Number(u.additionalCost1) || 0;
    const komisi = Number(u.additionalCost2) || 0;
    const lain = Number(u.additionalCost3) || 0;
    const hargaSetelah = hargaBeli + repairFee + tenaga + komisi + lain;
    return {
      'Date Acquired': formatDMY(u.dateAcquired),
      'Nama Kendaraan': u.name,
      'Color / Warna': u.color || '---',
      'Brand (Category)': brandLabel(u.category),
      'Tahun': u.year,
      'Plat': u.plate,
      'Nama Pemilik': u.ownerName || '---',
      'Alamat Pemilik': u.ownerAddress || '---',
      'Harga Beli (Acquisition)': formatRp(hargaBeli),
      'Repair Fee / Biaya Perbaikan': formatRp(repairFee),
      'Tenaga (Komisi Bonus)': formatRp(tenaga),
      'Komisi': komisi ? formatRp(komisi) : '',
      'Lain-lain': formatRp(lain),
      'Harga Setelah Perbaikan': formatRp(hargaSetelah),
      'Days in Showroom': calcDays(u.dateAcquired, ''),
      'Status': 'Available',
      'Keterangan': u.notes || '---',
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  ws['!cols'] = [
    { wch: 14 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 8 },
    { wch: 14 }, { wch: 18 }, { wch: 28 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 18 },
  ];
  XLSX.writeFile(wb, `Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportInventoryToCSV(units) {
  const data = units.map(u => ({
    'Date Acquired': u.dateAcquired,
    'Nama Kendaraan': u.name,
    'Category (Brand)': u.category,
    'Tahun Keluaran': u.year,
    'Plat Nomor': u.plate,
    'Harga Unit (Rp)': u.unitPrice,
    'Repair Fee (Rp)': u.repairFee ?? u.costUnit ?? 0,
    'Cost Basis (Rp)': costBasis(u),
    'Acquisition Source': u.acquisitionSource || 'purchase',
    'Status': u.status,
    'Nama Pemilik': u.ownerName,
    'Alamat Pemilik': u.ownerAddress,
    'Additional Info': u.notes || '',
  }));
  const csv = arrayToCSV(data);
  downloadFile(csv, `Inventory_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}
