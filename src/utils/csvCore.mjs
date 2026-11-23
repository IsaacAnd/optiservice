export function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  const raw = String(field);
  const safe = typeof field === 'string' && /^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function serializeCsv(headers, rows) {
  return [
    headers.map(escapeCsvField).join(';'),
    ...rows.map((row) => row.map(escapeCsvField).join(';')),
  ].join('\r\n');
}
