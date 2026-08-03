/**
 * Whole days from `now` until a yyyy-mm-dd date.
 *
 * `now` is passed in rather than read from the clock so callers can capture it
 * once (in an effect, alongside their data fetch) instead of calling Date.now()
 * during render, which is impure and can drift between renders.
 */
export function daysUntil(date: string | null, now: number | null): number | null {
  if (!date || now === null) return null;
  const target = new Date(`${date}T00:00:00`).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - now) / 86_400_000);
}

/** "in 12 days" / "today" / "3 days ago", or null when there's no date yet. */
export function relativeDay(date: string | null, now: number | null): string | null {
  const days = daysUntil(date, now);
  if (days === null) return null;
  if (days === 0) return "today";
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} away`;
  return `${Math.abs(days)} day${days === -1 ? "" : "s"} ago`;
}
