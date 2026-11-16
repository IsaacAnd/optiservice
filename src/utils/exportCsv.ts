/**
 * Utility to export data arrays to CSV with UTF-8 BOM for Microsoft Excel compatibility
 */

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const raw = String(field);
  const str = typeof field === 'string' && /^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw;
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): void {
  const csvContent = [
    headers.map(escapeCsvField).join(';'),
    ...rows.map((row) => row.map(escapeCsvField).join(';')),
  ].join('\r\n');

  // UTF-8 BOM (\uFEFF) ensures Excel correctly recognizes UTF-8 (accents like ç, ã, é)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
