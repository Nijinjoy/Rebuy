export function formatPrice(amount: number) {
  return `AED ${amount.toLocaleString('en-US')}`;
}

// "just now", "5 minutes ago", "2 days ago", then a date after a month.
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(
    0,
    Math.round((now - new Date(iso).getTime()) / 1000),
  );
  const units: [number, string][] = [
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  if (seconds < 60) {
    return 'just now';
  }
  if (seconds >= 60 * 60 * 24 * 30) {
    return new Date(iso).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  for (const [size, unit] of units) {
    if (seconds >= size) {
      const count = Math.floor(seconds / size);
      return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}
