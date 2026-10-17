import { describe, expect, it } from "vitest";
import { computeTotals, vatFromGross, DELIVERY_FEE_HALALA } from "@/lib/pricing";
import { expiryState, isLowStock, isSellable } from "@/lib/inventory";
import { canTransition } from "@/lib/status";
import { getDeliveryDays, isValidDeliverySlot } from "@/lib/delivery";
import { aggregateSales } from "@/lib/reports";

describe("VAT 15% (prices are VAT-inclusive)", () => {
  it("extracts VAT from a gross amount", () => {
    expect(vatFromGross(11500)).toBe(1500);
    expect(vatFromGross(0)).toBe(0);
  });

  it("adds delivery fee under the free-delivery threshold", () => {
    const t = computeTotals([{ priceHalala: 5000, quantity: 2 }]);
    expect(t.subtotalHalala).toBe(10000);
    expect(t.deliveryFeeHalala).toBe(DELIVERY_FEE_HALALA);
    expect(t.totalHalala).toBe(12500);
    expect(t.vatHalala + t.netHalala).toBe(t.totalHalala);
  });

  it("gives free delivery from 200 SAR", () => {
    const t = computeTotals([{ priceHalala: 20000, quantity: 1 }]);
    expect(t.deliveryFeeHalala).toBe(0);
    expect(t.totalHalala).toBe(20000);
  });
});

describe("inventory rules", () => {
  const now = new Date("2026-10-17T00:00:00Z");
  it("classifies expiry", () => {
    expect(expiryState(null, now)).toBe("none");
    expect(expiryState(new Date("2026-10-01T00:00:00Z"), now)).toBe("expired");
    expect(expiryState(new Date("2026-11-20T00:00:00Z"), now)).toBe("near");
    expect(expiryState(new Date("2027-10-01T00:00:00Z"), now)).toBe("ok");
  });
  it("flags low stock at or below threshold", () => {
    expect(isLowStock(5, 5)).toBe(true);
    expect(isLowStock(6, 5)).toBe(false);
  });
  it("blocks selling expired, inactive or empty products", () => {
    expect(isSellable({ active: true, stock: 3, expiryDate: null }, now)).toBe(true);
    expect(isSellable({ active: true, stock: 0, expiryDate: null }, now)).toBe(false);
    expect(isSellable({ active: false, stock: 3, expiryDate: null }, now)).toBe(false);
    expect(isSellable({ active: true, stock: 3, expiryDate: new Date("2026-01-01T00:00:00Z") }, now)).toBe(false);
  });
});

describe("order status machine", () => {
  it("allows only forward transitions and cancel", () => {
    expect(canTransition("NEW", "PREPARING")).toBe(true);
    expect(canTransition("NEW", "DELIVERED")).toBe(false);
    expect(canTransition("DELIVERED", "CANCELLED")).toBe(false);
    expect(canTransition("PENDING_RX", "NEW")).toBe(false);
  });
});

describe("delivery slots", () => {
  const now = new Date("2026-10-17T09:00:00Z");
  it("offers days starting tomorrow (Riyadh)", () => {
    const days = getDeliveryDays(now);
    expect(days[0].date).toBe("2026-10-18");
    expect(days).toHaveLength(4);
  });
  it("validates date and slot", () => {
    expect(isValidDeliverySlot("2026-10-18", "morning", now)).toBe(true);
    expect(isValidDeliverySlot("2026-10-17", "morning", now)).toBe(false);
    expect(isValidDeliverySlot("2026-10-18", "midnight", now)).toBe(false);
  });
});

describe("sales aggregation", () => {
  it("groups by Riyadh day and sums VAT", () => {
    const { rows, totals } = aggregateSales([
      { createdAt: new Date("2026-10-16T10:00:00Z"), totalHalala: 11500, vatHalala: 1500 },
      { createdAt: new Date("2026-10-16T12:00:00Z"), totalHalala: 23000, vatHalala: 3000 },
      { createdAt: new Date("2026-10-15T12:00:00Z"), totalHalala: 11500, vatHalala: 1500 },
    ]);
    expect(rows).toHaveLength(2);
    expect(totals.orders).toBe(3);
    expect(totals.grossHalala).toBe(46000);
    expect(totals.vatHalala).toBe(6000);
    expect(totals.netHalala).toBe(40000);
  });
});
