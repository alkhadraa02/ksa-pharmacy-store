import type { Metadata } from "next";
import { OrderStatusButtons } from "@/components/dashboard-actions";
import { db } from "@/lib/db";
import { slotLabel } from "@/lib/delivery";
import { formatDateTime, formatSar } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/status";

export const metadata: Metadata = { title: "الطلبات" };
export const dynamic = "force-dynamic";

export default async function OrdersBoardPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    include: { customer: true, items: true },
  });
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-extrabold">لوحة الطلبات</h1>
      {orders.length === 0 ? (
        <p className="card p-6 text-center text-muted">لا توجد طلبات بعد.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ORDER_STATUSES.map((status) => {
            const list = orders.filter((o) => o.status === status);
            return (
              <section key={status} aria-labelledby={`col-${status}`} className="min-w-0 rounded-xl border border-line bg-brand-soft p-3">
                <h2 id={`col-${status}`} className="mb-2 flex items-center justify-between font-bold">
                  {ORDER_STATUS_LABEL[status]}
                  <span className="badge badge-muted">{list.length}</span>
                </h2>
                <ul className="grid gap-2">
                  {list.length === 0 ? <li className="hint p-2">لا توجد طلبات</li> : null}
                  {list.map((o) => (
                    <li key={o.id} className="card min-w-0 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <bdi dir="ltr" className="truncate font-bold">{o.number}</bdi>
                        <span className="shrink-0 font-bold">{formatSar(o.totalHalala)}</span>
                      </div>
                      <p className="truncate">{o.customer.name} · {o.city}</p>
                      <p className="hint">{formatDateTime(o.createdAt)}</p>
                      <p className="hint">توصيل {o.deliveryDate} · {slotLabel(o.deliverySlot)}</p>
                      <p className="hint">{PAYMENT_METHOD_LABEL[o.paymentMethod]} — {PAYMENT_STATUS_LABEL[o.paymentStatus]}</p>
                      <ul className="mt-1 list-disc ps-5">
                        {o.items.map((i) => <li key={i.id}>{i.name} × {i.quantity}</li>)}
                      </ul>
                      <OrderStatusButtons orderId={o.id} status={o.status} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
