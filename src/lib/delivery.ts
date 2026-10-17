import { riyadhDate } from "./format";

export const DELIVERY_SLOTS = [
  { id: "morning", label: "9 ص – 12 م" },
  { id: "afternoon", label: "12 م – 4 م" },
  { id: "evening", label: "4 م – 9 م" },
] as const;

export type DeliverySlotId = (typeof DELIVERY_SLOTS)[number]["id"];
export const DELIVERY_DAYS_AHEAD = 4;

export type DeliveryDay = { date: string; label: string };

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Delivery is offered from tomorrow for the next few days (Riyadh calendar). */
export function getDeliveryDays(now: Date = new Date()): DeliveryDay[] {
  const today = riyadhDate(now);
  return Array.from({ length: DELIVERY_DAYS_AHEAD }, (_, i) => {
    const date = addDays(today, i + 1);
    const label = new Date(`${date}T12:00:00Z`).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });
    return { date, label };
  });
}

export function isValidDeliverySlot(date: string, slotId: string, now: Date = new Date()): boolean {
  return getDeliveryDays(now).some((d) => d.date === date) && DELIVERY_SLOTS.some((s) => s.id === slotId);
}

export function slotLabel(slotId: string): string {
  return DELIVERY_SLOTS.find((s) => s.id === slotId)?.label ?? slotId;
}
