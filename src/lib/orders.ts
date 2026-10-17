import { randomInt } from "node:crypto";
import { db } from "./db";
import { isValidDeliverySlot } from "./delivery";
import { isSellable } from "./inventory";
import { computeTotals } from "./pricing";
import { getPaymentProvider } from "./payment";
import { riyadhDate } from "./format";
import { canTransition } from "./status";
import type { OrderInput } from "./validation";

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function generateOrderNumber(now = new Date()): string {
  const d = riyadhDate(now).replaceAll("-", "").slice(2);
  return `PH-${d}-${randomInt(10000, 99999)}`;
}

export type QuoteLine = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  priceHalala: number;
  requiresPrescription: boolean;
  available: boolean;
  stock: number;
};

/** Merge duplicate product lines. */
export function mergeLines(items: { productId: string; quantity: number }[]) {
  const map = new Map<string, number>();
  for (const i of items) map.set(i.productId, (map.get(i.productId) ?? 0) + i.quantity);
  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

export async function quoteCart(items: { productId: string; quantity: number }[]) {
  const merged = mergeLines(items);
  const products = await db.product.findMany({ where: { id: { in: merged.map((m) => m.productId) } } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: QuoteLine[] = [];
  for (const m of merged) {
    const p = byId.get(m.productId);
    if (!p) continue;
    lines.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      quantity: Math.min(m.quantity, 20),
      priceHalala: p.priceHalala,
      requiresPrescription: p.requiresPrescription,
      available: isSellable(p) && p.stock >= m.quantity,
      stock: p.stock,
    });
  }
  const totals = computeTotals(lines.map((l) => ({ priceHalala: l.priceHalala, quantity: l.quantity })));
  return { lines, totals, needsPrescription: lines.some((l) => l.requiresPrescription) };
}

export async function createOrder(input: OrderInput) {
  if (!isValidDeliverySlot(input.deliveryDate, input.deliverySlot)) {
    throw new OrderError("موعد التوصيل المختار غير متاح");
  }
  const provider = getPaymentProvider(input.paymentMethod);
  if (!provider) throw new OrderError("طريقة الدفع غير متاحة");

  const merged = mergeLines(input.items);

  return db.$transaction(async (tx) => {
    const products = await tx.product.findMany({ where: { id: { in: merged.map((m) => m.productId) } } });
    const byId = new Map(products.map((p) => [p.id, p]));

    for (const m of merged) {
      const p = byId.get(m.productId);
      if (!p) throw new OrderError("أحد المنتجات لم يعد متوفرًا");
      if (!isSellable(p)) throw new OrderError(`المنتج «${p.name}» غير متوفر حاليًا`);
      if (p.stock < m.quantity) throw new OrderError(`الكمية المتاحة من «${p.name}» هي ${p.stock} فقط`);
    }

    const needsRx = merged.some((m) => byId.get(m.productId)!.requiresPrescription);
    let prescription = null;
    if (needsRx) {
      if (!input.prescriptionId) throw new OrderError("ارفع الوصفة الطبية قبل إتمام الطلب: السلة تحتوي أدوية تتطلب وصفة");
      prescription = await tx.prescription.findUnique({ where: { id: input.prescriptionId } });
      if (!prescription || prescription.filePath === "") throw new OrderError("الوصفة غير موجودة، ارفعها من جديد");
      if (prescription.status === "REJECTED") throw new OrderError("الوصفة المرفوعة مرفوضة، ارفع وصفة جديدة");
      if (prescription.phone !== input.phone) throw new OrderError("رقم جوال الوصفة لا يطابق رقم جوال الطلب");
    }

    const lines = merged.map((m) => ({ product: byId.get(m.productId)!, quantity: m.quantity }));
    const totals = computeTotals(lines.map((l) => ({ priceHalala: l.product.priceHalala, quantity: l.quantity })));

    const number = generateOrderNumber();
    const payment = await provider.charge({ orderNumber: number, amountHalala: totals.totalHalala, customerPhone: input.phone });
    if (!payment.ok) throw new OrderError(payment.error ?? "تعذّر إتمام الدفع");

    const customer = await tx.customer.upsert({
      where: { phone: input.phone },
      create: { name: input.name, phone: input.phone, city: input.city },
      update: { name: input.name, city: input.city },
    });

    const status = needsRx && prescription!.status !== "APPROVED" ? "PENDING_RX" : "NEW";

    for (const l of lines) {
      const res = await tx.product.updateMany({
        where: { id: l.product.id, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (res.count !== 1) throw new OrderError(`نفدت كمية «${l.product.name}» للتو`, 409);
    }

    const order = await tx.order.create({
      data: {
        number,
        customerId: customer.id,
        status,
        paymentMethod: provider.id,
        paymentStatus: payment.status,
        paymentRef: payment.reference,
        address: input.address,
        city: input.city,
        notes: input.notes,
        deliveryDate: input.deliveryDate,
        deliverySlot: input.deliverySlot,
        subtotalHalala: totals.subtotalHalala,
        deliveryFeeHalala: totals.deliveryFeeHalala,
        totalHalala: totals.totalHalala,
        vatHalala: totals.vatHalala,
        prescriptionId: prescription?.id ?? null,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            name: l.product.name,
            unitPriceHalala: l.product.priceHalala,
            quantity: l.quantity,
            requiresPrescription: l.product.requiresPrescription,
          })),
        },
      },
    });

    if (prescription && !prescription.customerId) {
      await tx.prescription.update({ where: { id: prescription.id }, data: { customerId: customer.id } });
    }
    return order;
  });
}

export async function trackOrder(number: string, phone: string) {
  const order = await db.order.findUnique({
    where: { number: number.trim().toUpperCase() },
    include: { items: true, customer: true, prescription: true },
  });
  if (!order || order.customer.phone !== phone) return null;
  return order;
}

async function restock(tx: Pick<typeof db, "orderItem" | "product">, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const i of items) {
    await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
  }
}

export async function updateOrderStatus(orderId: string, to: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new OrderError("الطلب غير موجود", 404);
    if (!canTransition(order.status, to)) throw new OrderError("لا يمكن نقل الطلب إلى هذه الحالة");
    if (to === "CANCELLED") await restock(tx, orderId);
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: to,
        paymentStatus: to === "DELIVERED" && order.paymentMethod === "COD" ? "PAID" : order.paymentStatus,
      },
    });
  });
}

export async function reviewPrescription(id: string, decision: "APPROVED" | "REJECTED", note: string, reviewer: string) {
  const trimmed = note.trim();
  if (decision === "REJECTED" && trimmed.length < 3) throw new OrderError("اكتب سبب الرفض للعميل");
  return db.$transaction(async (tx) => {
    const rx = await tx.prescription.findUnique({ where: { id } });
    if (!rx) throw new OrderError("الوصفة غير موجودة", 404);
    if (rx.status !== "PENDING") throw new OrderError("تمت مراجعة هذه الوصفة مسبقًا");
    await tx.prescription.update({
      where: { id },
      data: { status: decision, reviewNote: trimmed, reviewedAt: new Date(), reviewedBy: reviewer },
    });
    const waiting = await tx.order.findMany({ where: { prescriptionId: id, status: "PENDING_RX" } });
    for (const o of waiting) {
      if (decision === "APPROVED") {
        await tx.order.update({ where: { id: o.id }, data: { status: "NEW" } });
      } else {
        await restock(tx, o.id);
        await tx.order.update({ where: { id: o.id }, data: { status: "CANCELLED" } });
      }
    }
    return { affectedOrders: waiting.length };
  });
}
