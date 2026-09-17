// Shared helper utilities for export/import modules.
import * as XLSX from 'xlsx';

export { XLSX };

export function arrayToCSV(data) {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      const strValue = String(value ?? '');
      if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDMY(iso) {
  if (!iso) return '---';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '---';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatRp(n) {
  const v = Math.round(Number(n) || 0);
  return 'Rp ' + v.toLocaleString('id-ID');
}

export function getZakatFraction() {
  try {
    const raw = localStorage.getItem('orisma_settings_v1');
    if (raw) {
      const s = JSON.parse(raw);
      if (s.zakatRate != null) return Number(s.zakatRate) / 100;
    }
  } catch {}
  return 0.025;
}

export function calcDays(dateAcquired, soldDate) {
  if (!dateAcquired) return '---';
  const start = new Date(dateAcquired + 'T00:00:00');
  if (isNaN(start.getTime())) return '---';
  let end;
  if (soldDate && soldDate !== '---' && soldDate !== '') {
    end = new Date(soldDate + 'T00:00:00');
    if (isNaN(end.getTime())) end = new Date();
  } else {
    end = new Date();
  }
  const diff = Math.round((end - start) / 86400000);
  return diff >= 0 ? diff : '---';
}

export function brandLabel(key) {
  const map = { honda: 'Honda', yamaha: 'Yamaha', suzuki: 'Suzuki', kawasaki: 'Kawasaki', vespa: 'Vespa', lainnya: 'Lainnya' };
  return map[String(key || '').toLowerCase()] || String(key || 'honda');
}
