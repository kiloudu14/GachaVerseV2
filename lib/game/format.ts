export function formatNumber(n: number): string {
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'Oc', 'No'];
  if (!isFinite(n)) return '0';
  let value = Math.floor(n);
  let idx = 0;
  while (value >= 1000 && idx < suffixes.length - 1) {
    value = Math.floor(value / 1000);
    idx++;
  }

  // Recompute a more-precise display value (with one decimal) using float division
  const display = n / Math.pow(1000, idx);
  const formatted = display >= 100 ? Math.round(display).toString() : display.toFixed(1).replace(/\.0$/, '');
  return formatted + (suffixes[idx] || '');
}
