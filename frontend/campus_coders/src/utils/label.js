export function humanize(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatMinutes(minutes) {
  if (minutes == null) return null;
  const n = Number(minutes);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function difficultyClass(value) {
  const key = String(value || '').toLowerCase();
  if (key.includes('beginner')) return 'beginner';
  if (key.includes('intermediate')) return 'intermediate';
  if (key.includes('advanced')) return 'advanced';
  return 'beginner';
}
