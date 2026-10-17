import { describe, expect, it } from "vitest";
import { orderInputSchema, normalizePhone, consultationSchema, slugify } from "@/lib/validation";
import { detectType } from "@/lib/uploads";
import { getPaymentProvider, availablePaymentMethods } from "@/lib/payment";
import { rateLimit } from "@/lib/http";

describe("phone normalisation", () => {
  it("accepts common Saudi formats", () => {
    expect(normalizePhone("+966 55 555 5555")).toBe("0555555555");
    expect(normalizePhone("٠٥٥٥٥٥٥٥٥٥")).toBe("0555555555");
    expect(normalizePhone("555555555")).toBe("0555555555");
  });
});

describe("order input", () => {
  const base = {
    name: "عبدالله",
    phone: "0555555555",
    city: "الرياض",
    address: "حي الملقا، شارع 5",
    deliveryDate: "2026-10-18",
    deliverySlot: "morning",
    paymentMethod: "COD",
    items: [{ productId: "p1", quantity: 2 }],
  };
  it("accepts a valid order", () => {
    expect(orderInputSchema.safeParse(base).success).toBe(true);
  });
  it("rejects bad phone, empty cart and huge quantity", () => {
    expect(orderInputSchema.safeParse({ ...base, phone: "123" }).success).toBe(false);
    expect(orderInputSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(orderInputSchema.safeParse({ ...base, items: [{ productId: "p1", quantity: 99 }] }).success).toBe(false);
  });
  it("rejects unknown payment methods", () => {
    expect(orderInputSchema.safeParse({ ...base, paymentMethod: "BITCOIN" }).success).toBe(false);
  });
});

describe("consultation", () => {
  it("requires a meaningful message", () => {
    const r = consultationSchema.safeParse({ name: "سارة", phone: "0555555555", topic: "أخرى", message: "قصير" });
    expect(r.success).toBe(false);
  });
});

describe("upload sniffing", () => {
  const pad = (b: number[]) => Uint8Array.from([...b, ...new Array(16).fill(0)]);
  it("recognises PDF, JPEG and PNG by magic bytes", () => {
    expect(detectType(pad([0x25, 0x50, 0x44, 0x46]))?.ext).toBe("pdf");
    expect(detectType(pad([0xff, 0xd8, 0xff, 0xe0]))?.ext).toBe("jpg");
    expect(detectType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.ext).toBe("png");
  });
  it("rejects scripts disguised as images", () => {
    const html = new TextEncoder().encode("<script>alert(1)</script>");
    expect(detectType(html)).toBeNull();
  });
});

describe("payment providers", () => {
  it("always offers cash on delivery", () => {
    expect(getPaymentProvider("COD", {})?.id).toBe("COD");
  });
  it("hides the mock provider unless enabled", () => {
    expect(getPaymentProvider("MOCK", {})).toBeNull();
    expect(getPaymentProvider("MOCK", { ENABLE_MOCK_PAYMENT: "1" })?.id).toBe("MOCK");
    expect(availablePaymentMethods({}).map((m) => m.id)).toEqual(["COD"]);
  });
  it("mock charge approves positive amounts only", async () => {
    const p = getPaymentProvider("MOCK", { ENABLE_MOCK_PAYMENT: "1" })!;
    expect((await p.charge({ orderNumber: "X", amountHalala: 1000, customerPhone: "0555555555" })).status).toBe("PAID");
    expect((await p.charge({ orderNumber: "X", amountHalala: 0, customerPhone: "0555555555" })).ok).toBe(false);
  });
});

describe("rate limiter", () => {
  it("blocks after the limit within the window", () => {
    const t = 1_000_000;
    expect(rateLimit("k1", 2, 1000, t)).toBe(true);
    expect(rateLimit("k1", 2, 1000, t + 1)).toBe(true);
    expect(rateLimit("k1", 2, 1000, t + 2)).toBe(false);
    expect(rateLimit("k1", 2, 1000, t + 2000)).toBe(true);
  });
});

describe("slugify", () => {
  it("keeps Arabic and latin, strips symbols", () => {
    expect(slugify("Panadol 500!")).toBe("panadol-500");
    expect(slugify("  ")).toBe("product");
  });
});
