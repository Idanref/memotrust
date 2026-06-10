/** Local-calendar date helpers — the store's file formats are date-based. */

/** Local calendar date as YYYY-MM-DD (matches the store's file format). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Local date-time as YYYY-MM-DDTHH:MM:SS (event timestamps). */
export function nowISO(): string {
  const d = new Date();
  return `${todayISO()}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/** Local date N days from now as YYYY-MM-DD (decay horizons). */
export function plusDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
