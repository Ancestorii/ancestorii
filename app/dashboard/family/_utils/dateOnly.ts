/**
 * A Postgres `date` ("YYYY-MM-DD") as a local-time Date. `new Date("1950-01-01")` is UTC
 * midnight, so west of Greenwich its year, month and day read as 31 December 1949.
 */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value);
  const date = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
