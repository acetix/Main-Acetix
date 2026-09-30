/**
 * Date helpers that tolerate the many shapes a date can take when it
 * arrives from the cloud database (Timestamp objects, `{seconds}` maps,
 * ISO strings or epoch numbers) or from bundled seed data.
 */
export function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'object') {
    const v = value as { toDate?: () => Date; seconds?: number };
    if (typeof v.toDate === 'function') {
      try {
        return v.toDate();
      } catch {
        return null;
      }
    }
    if (typeof v.seconds === 'number') {
      return new Date(v.seconds * 1000);
    }
  }

  return null;
}

export function timeAgo(date: Date | null): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
