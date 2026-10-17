import { db } from "./db";
import { NEAR_EXPIRY_DAYS } from "./inventory";
import { vatFromGross } from "./pricing";

export type SalesRow = { date: string; orders: number; grossHalala: number; vatHalala: number; netHalala: number };

export function aggregateSales(orders: { createdAt: Date; totalHalala: number; vatHalala: number }[]): {
  rows: SalesRow[];
  totals: Omit<SalesRow, "date">;
} {
  const map = new Map<string, SalesRow>();
  for (const o of orders) {
    const date = new Date(o.createdAt.getTime() + 3 * 3600_000).toISOString().slice(0, 10);
    const row = map.get(date) ?? { date, orders: 0, grossHalala: 0, vatHalala: 0, netHalala: 0 };
    row.orders += 1;
    row.grossHalala += o.totalHalala;
    row.vatHalala += o.vatHalala;
    row.netHalala += o.totalHalala - o.vatHalala;
    map.set(date, row);
  }
  const rows = [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  const totals = rows.reduce(
    (t, r) => ({
      orders: t.orders + r.orders,
      grossHalala: t.grossHalala + r.grossHalala,
      vatHalala: t.vatHalala + r.vatHalala,
      netHalala: t.netHalala + r.netHalala,
    }),
    { orders: 0, grossHalala: 0, vatHalala: 0, netHalala: 0 },
  );
  return { rows, totals };
}

/** Sales report: all orders that were not cancelled, within an inclusive Riyadh date range. */
export async function salesReport(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00+03:00`);
  const to = new Date(`${toDate}T23:59:59.999+03:00`);
  const orders = await db.order.findMany({
    where: { status: { notIn: ["CANCELLED", "PENDING_RX"] }, createdAt: { gte: from, lte: to } },
    select: { createdAt: true, totalHalala: true, vatHalala: true },
  });
  const agg = aggregateSales(orders);
  const items = await db.orderItem.groupBy({
    by: ["name"],
    where: { order: { status: { notIn: ["CANCELLED", "PENDING_RX"] }, createdAt: { gte: from, lte: to } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  return { ...agg, topProducts: items.map((i) => ({ name: i.name, quantity: i._sum.quantity ?? 0 })) };
}

export async function inventoryAlerts() {
  const now = new Date();
  const horizon = new Date(now.getTime() + NEAR_EXPIRY_DAYS * 86_400_000);
  const products = await db.product.findMany({ where: { active: true }, include: { category: true }, orderBy: { name: "asc" } });
  return {
    lowStock: products.filter((p) => p.stock <= p.lowStockThreshold),
    nearExpiry: products.filter((p) => p.expiryDate && p.expiryDate >= now && p.expiryDate <= horizon),
    expired: products.filter((p) => p.expiryDate && p.expiryDate < now),
  };
}

export { vatFromGross };
