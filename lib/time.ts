/** Request-time helpers (kept out of component bodies so renders stay pure). */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function isWithin(date: Date, ms: number): boolean {
  return Date.now() - date.getTime() < ms;
}
