"use client";

import { useState } from "react";
import { formatDateTime, formatSar } from "@/lib/format";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, RX_STATUS_LABEL } from "@/lib/status";

type Tracked = {
  number: string;
  status: string;
  createdAt: string;
  deliveryDate: string;
  deliverySlotLabel?: string;
  deliverySlot: string;
  paymentMethod: string;
  paymentStatus: string;
  totalHalala: number;
  vatHalala: number;
  deliveryFeeHalala: number;
  items: { name: string; quantity: number; unitPriceHalala: number }[];
  prescription: { status: string; note: string } | null;
};

const STEPS = ["NEW", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export function TrackForm({ slots }: { slots: { id: string; label: string }[] }) {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Tracked | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const r = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number, phone }) });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "تعذّر جلب الطلب");
      setOrder(body as Tracked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر جلب الطلب");
    } finally {
      setBusy(false);
    }
  }

  const stepIndex = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" noValidate>
        <div>
          <label htmlFor="t-number" className="label">رقم الطلب</label>
          <input id="t-number" className="field" dir="ltr" value={number} onChange={(e) => setNumber(e.target.value)} required placeholder="PH-261017-12345" />
        </div>
        <div>
          <label htmlFor="t-phone" className="label">رقم الجوال المستخدم في الطلب</label>
          <input id="t-phone" className="field" dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="05xxxxxxxx" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "جارٍ البحث…" : "تتبع"}</button>
      </form>

      {error ? <p role="alert" className="alert alert-error">{error}</p> : null}

      {order ? (
        <section className="card grid gap-4 p-4" aria-live="polite" aria-label="تفاصيل الطلب">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">طلب <bdi dir="ltr">{order.number}</bdi></h2>
            <span className="badge badge-info">{ORDER_STATUS_LABEL[order.status] ?? order.status}</span>
          </header>

          {order.status === "CANCELLED" ? (
            <p className="alert alert-error">تم إلغاء هذا الطلب.</p>
          ) : order.status === "PENDING_RX" ? (
            <p className="alert alert-warn">طلبك بانتظار مراجعة الوصفة الطبية من الصيدلاني.</p>
          ) : (
            <ol className="grid gap-2 sm:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s} className={`rounded-lg border p-2 text-center text-sm font-semibold ${i <= stepIndex ? "border-brand bg-brand-soft text-brand-strong" : "border-line text-muted"}`}>
                  {i <= stepIndex ? "✓ " : ""}{ORDER_STATUS_LABEL[s]}
                </li>
              ))}
            </ol>
          )}

          {order.prescription ? (
            <p className="text-sm">
              الوصفة: <strong>{RX_STATUS_LABEL[order.prescription.status] ?? order.prescription.status}</strong>
              {order.prescription.note ? ` — ${order.prescription.note}` : ""}
            </p>
          ) : null}

          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <div><dt className="hint inline">تاريخ الطلب: </dt><dd className="inline">{formatDateTime(order.createdAt)}</dd></div>
            <div><dt className="hint inline">موعد التوصيل: </dt><dd className="inline">{order.deliveryDate} · {slots.find((s) => s.id === order.deliverySlot)?.label ?? order.deliverySlot}</dd></div>
            <div><dt className="hint inline">الدفع: </dt><dd className="inline">{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod} ({PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus})</dd></div>
          </dl>

          <div className="table-wrap">
            <table className="table">
              <thead><tr><th scope="col">المنتج</th><th scope="col">الكمية</th><th scope="col">السعر</th></tr></thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.name}><td>{i.name}</td><td>{i.quantity}</td><td>{formatSar(i.unitPriceHalala * i.quantity)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-end text-base font-bold">الإجمالي: {formatSar(order.totalHalala)} <span className="hint">(شامل ضريبة {formatSar(order.vatHalala)})</span></p>
        </section>
      ) : null}
    </div>
  );
}
