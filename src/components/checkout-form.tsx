"use client";

import Link from "next/link";
import { useState } from "react";
import { formatSar } from "@/lib/format";
import { useCart } from "./cart-provider";
import { PrescriptionUpload } from "./prescription-upload";
import { useQuote } from "./use-quote";

type Props = {
  days: { date: string; label: string }[];
  slots: { id: string; label: string }[];
  methods: { id: string; label: string }[];
  cities: string[];
};

export function CheckoutForm({ days, slots, methods, cities }: Props) {
  const { items, ready, clear } = useCart();
  const { quote, loading } = useQuote(items.map((i) => ({ productId: i.productId, quantity: i.quantity })), ready);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: cities[0] ?? "",
    address: "",
    notes: "",
    deliveryDate: days[0]?.date ?? "",
    deliverySlot: slots[0]?.id ?? "",
    paymentMethod: methods[0]?.id ?? "COD",
  });
  const [prescriptionId, setPrescriptionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{ number: string; status: string; phone: string } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (placed) {
    return (
      <div className="card mx-auto max-w-xl p-6 text-center" role="status">
        <p className="text-4xl" aria-hidden="true">✅</p>
        <h2 className="mt-2 text-xl font-extrabold">تم استلام طلبك</h2>
        <p className="mt-2">رقم الطلب: <bdi dir="ltr" className="font-bold">{placed.number}</bdi></p>
        <p className="hint mt-1">
          {placed.status === "PENDING_RX" ? "سيراجع الصيدلاني الوصفة أولًا ثم نبدأ تجهيز الطلب." : "بدأنا تجهيز طلبك وسنوصله في الموعد المحدد."}
        </p>
        <Link href="/track" className="btn btn-primary mt-4">تتبع الطلب</Link>
      </div>
    );
  }

  if (!ready || (loading && !quote && items.length > 0)) return <p role="status" className="card p-6 text-muted">جارٍ التحميل…</p>;

  if (!quote || quote.lines.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-bold">سلتك فارغة</p>
        <Link href="/products" className="btn btn-primary mt-4">تصفح المنتجات</Link>
      </div>
    );
  }

  const needsRx = quote.needsPrescription;
  const unavailable = quote.lines.some((l) => !l.available);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (needsRx && !prescriptionId) {
      setError("ارفع الوصفة الطبية أولًا: السلة تحتوي أدوية تتطلب وصفة");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          prescriptionId: needsRx ? prescriptionId : undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "تعذّر إنشاء الطلب");
      clear();
      setPlaced({ number: body.number, status: body.status, phone: form.phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إنشاء الطلب");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit} className="grid gap-6" noValidate>
        {needsRx ? (
          <section className="card p-4" aria-labelledby="rx-h">
            <h2 id="rx-h" className="text-lg font-bold">الوصفة الطبية (مطلوبة)</h2>
            <p className="hint mb-3">طلبك يحتوي أدوية لا تُصرف إلا بوصفة. ارفع صورة الوصفة قبل إتمام الطلب.</p>
            <PrescriptionUpload defaultName={form.name} defaultPhone={form.phone} onUploaded={setPrescriptionId} />
          </section>
        ) : null}

        <section className="card grid gap-3 p-4 sm:grid-cols-2" aria-labelledby="addr-h">
          <h2 id="addr-h" className="text-lg font-bold sm:col-span-2">بيانات التوصيل</h2>
          <div>
            <label htmlFor="c-name" className="label">الاسم الكامل</label>
            <input id="c-name" className="field" value={form.name} onChange={set("name")} required maxLength={80} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="c-phone" className="label">رقم الجوال</label>
            <input id="c-phone" className="field" dir="ltr" inputMode="tel" value={form.phone} onChange={set("phone")} required placeholder="05xxxxxxxx" autoComplete="tel" />
          </div>
          <div>
            <label htmlFor="c-city" className="label">المدينة</label>
            <select id="c-city" className="field" value={form.city} onChange={set("city")}>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="c-address" className="label">العنوان التفصيلي</label>
            <input id="c-address" className="field" value={form.address} onChange={set("address")} required maxLength={300} autoComplete="street-address" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="c-notes" className="label">ملاحظات (اختياري)</label>
            <textarea id="c-notes" className="field" rows={2} value={form.notes} onChange={set("notes")} maxLength={300} />
          </div>
        </section>

        <section className="card grid gap-3 p-4 sm:grid-cols-2" aria-labelledby="slot-h">
          <h2 id="slot-h" className="text-lg font-bold sm:col-span-2">موعد التوصيل</h2>
          <div>
            <label htmlFor="c-date" className="label">اليوم</label>
            <select id="c-date" className="field" value={form.deliveryDate} onChange={set("deliveryDate")}>
              {days.map((d) => <option key={d.date} value={d.date}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="c-slot" className="label">الفترة</label>
            <select id="c-slot" className="field" value={form.deliverySlot} onChange={set("deliverySlot")}>
              {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </section>

        <fieldset className="card p-4">
          <legend className="px-1 text-lg font-bold">طريقة الدفع</legend>
          <div className="mt-2 grid gap-2">
            {methods.map((m) => (
              <label key={m.id} className="flex min-h-11 items-center gap-2">
                <input type="radio" name="paymentMethod" value={m.id} checked={form.paymentMethod === m.id} onChange={set("paymentMethod")} />
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>

        {error ? <p role="alert" className="alert alert-error">{error}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={busy || unavailable}>
          {busy ? "جارٍ إرسال الطلب…" : `تأكيد الطلب · ${formatSar(quote.totals.totalHalala)}`}
        </button>
        {unavailable ? <p className="alert alert-warn">بعض الأصناف غير متاحة، عدّل <Link href="/cart" className="underline">السلة</Link> أولًا.</p> : null}
      </form>

      <aside className="card h-fit p-4" aria-label="ملخص الطلب">
        <h2 className="text-lg font-bold">ملخص الطلب</h2>
        <ul className="mt-3 grid gap-1 text-sm">
          {quote.lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">{l.name} × {l.quantity}</span>
              <span className="shrink-0">{formatSar(l.priceHalala * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 grid gap-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt>التوصيل</dt><dd>{quote.totals.deliveryFeeHalala === 0 ? "مجاني" : formatSar(quote.totals.deliveryFeeHalala)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>الإجمالي</dt><dd>{formatSar(quote.totals.totalHalala)}</dd></div>
          <div className="hint flex justify-between"><dt>ضريبة القيمة المضافة 15%</dt><dd>{formatSar(quote.totals.vatHalala)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
