export const NEAR_EXPIRY_DAYS = 60;

export type ExpiryState = "none" | "expired" | "near" | "ok";

export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}

export function expiryState(date: Date | null | undefined, now: Date = new Date()): ExpiryState {
  if (!date) return "none";
  const d = daysUntil(date, now);
  if (d < 0) return "expired";
  if (d <= NEAR_EXPIRY_DAYS) return "near";
  return "ok";
}

export function isLowStock(stock: number, threshold: number): boolean {
  return stock <= threshold;
}

export type SellableInput = { active: boolean; stock: number; expiryDate: Date | null };

/** A product can be sold when active, in stock and not expired. */
export function isSellable(p: SellableInput, now: Date = new Date()): boolean {
  return p.active && p.stock > 0 && expiryState(p.expiryDate, now) !== "expired";
}
