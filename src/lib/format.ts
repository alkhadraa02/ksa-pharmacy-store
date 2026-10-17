const LOCALE = "ar-SA-u-ca-gregory-nu-latn";

const sar = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "SAR" });
const num = new Intl.NumberFormat(LOCALE);

export function formatSar(halala: number): string {
  return sar.format(halala / 100);
}

export function formatNumber(n: number): string {
  return num.format(n);
}

export function formatDate(d: Date | string | number): string {
  return new Date(d).toLocaleDateString(LOCALE, { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Riyadh" });
}

export function formatDateTime(d: Date | string | number): string {
  return new Date(d).toLocaleString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  });
}

/** yyyy-mm-dd in Riyadh time (UTC+3, no DST). */
export function riyadhDate(now: Date = new Date()): string {
  return new Date(now.getTime() + 3 * 3600_000).toISOString().slice(0, 10);
}

export function dateInputValue(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}
