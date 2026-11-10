const UNITS = [
  [2592000, 'month'],
  [604800, 'week'],
  [86400, 'day'],
  [3600, 'hour'],
  [60, 'minute'],
];

export function formatRetention(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return '';
  for (let i = 0; i < UNITS.length; i++) {
    const size = UNITS[i][0];
    const name = UNITS[i][1];
    if (n % size === 0) {
      const count = n / size;
      return count + ' ' + name + (count === 1 ? '' : 's');
    }
  }
  return n + ' seconds';
}

export function retentionText(lang, seconds, fallback) {
  const map = lang && lang.retentions;
  if (map && map[seconds]) return map[seconds];
  return formatRetention(seconds) || fallback || String(seconds);
}
