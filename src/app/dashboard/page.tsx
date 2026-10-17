import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatNumber, formatSar } from "@/lib/format";
import { daysUntil } from "@/lib/inventory";
import { inventoryAlerts, salesReport } from "@/lib/reports";
import { riyadhDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const today = riyadhDate();
  const monthStart = `${today.slice(0, 8)}01`;
  const [alerts, sales, pendingRx, newOrders, productCount, newConsults] = await Promise.all([
    inventoryAlerts(),
    salesReport(monthStart, today),
    db.prescription.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: { in: ["NEW", "PENDING_RX"] } } }),
    db.product.count(),
    db.consultation.count({ where: { status: "NEW" } }),
  ]);

  const stats = [
    { label: "مبيعات الشهر (شامل الضريبة)", value: formatSar(sales.totals.grossHalala), href: "/dashboard/reports" },
    { label: "طلبات تنتظر المعالجة", value: formatNumber(newOrders), href: "/dashboard/orders" },
    { label: "وصفات قيد المراجعة", value: formatNumber(pendingRx), href: "/dashboard/prescriptions" },
    { label: "استشارات جديدة", value: formatNumber(newConsults), href: "/dashboard/consultations" },
    { label: "عدد المنتجات", value: formatNumber(productCount), href: "/dashboard/products" },
  ];

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-extrabold">نظرة عامة</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label} className="card p-4">
            <Link href={s.href} className="block hover:text-brand-strong">
              <p className="hint">{s.label}</p>
              <p className="mt-1 text-xl font-extrabold">{s.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-4" aria-labelledby="low-h">
          <h2 id="low-h" className="text-lg font-bold">تنبيه: مخزون منخفض ({alerts.lowStock.length})</h2>
          {alerts.lowStock.length === 0 ? <p className="hint mt-2">لا توجد منتجات منخفضة المخزون.</p> : (
            <ul className="mt-2 grid gap-1 text-sm">
              {alerts.lowStock.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <Link href={`/dashboard/products/${p.id}`} className="min-w-0 truncate underline">{p.name}</Link>
                  <span className={`badge shrink-0 ${p.stock === 0 ? "badge-rx" : "badge-warn"}`}>{p.stock === 0 ? "نفد" : `${p.stock} متبقي`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-4" aria-labelledby="near-h">
          <h2 id="near-h" className="text-lg font-bold">تنبيه: قريبة الانتهاء ({alerts.nearExpiry.length})</h2>
          {alerts.nearExpiry.length === 0 ? <p className="hint mt-2">لا توجد منتجات قريبة الانتهاء.</p> : (
            <ul className="mt-2 grid gap-1 text-sm">
              {alerts.nearExpiry.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <Link href={`/dashboard/products/${p.id}`} className="min-w-0 truncate underline">{p.name}</Link>
                  <span className="badge badge-warn shrink-0">{p.expiryDate ? `${daysUntil(p.expiryDate)} يومًا` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-4" aria-labelledby="exp-h">
          <h2 id="exp-h" className="text-lg font-bold">منتهية الصلاحية ({alerts.expired.length})</h2>
          {alerts.expired.length === 0 ? <p className="hint mt-2">لا توجد منتجات منتهية.</p> : (
            <ul className="mt-2 grid gap-1 text-sm">
              {alerts.expired.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <Link href={`/dashboard/products/${p.id}`} className="min-w-0 truncate underline">{p.name}</Link>
                  <span className="badge badge-rx shrink-0">{p.expiryDate ? formatDate(p.expiryDate) : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
