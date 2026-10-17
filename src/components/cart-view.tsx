"use client";

import Link from "next/link";
import { formatSar } from "@/lib/format";
import { useCart } from "./cart-provider";
import { useQuote } from "./use-quote";

export function CartView() {
  const { items, ready, setQuantity, remove } = useCart();
  const { quote, loading, error } = useQuote(items.map((i) => ({ productId: i.productId, quantity: i.quantity })), ready);

  if (!ready || (loading && !quote && items.length > 0)) {
    return <p role="status" className="card p-6 text-muted">جارٍ تحميل السلة…</p>;
  }

  if (items.length === 0 || !quote || quote.lines.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-4xl" aria-hidden="true">🛒</p>
        <p className="mt-2 text-lg font-bold">سلتك فارغة</p>
        <p className="hint mt-1">تصفح الأقسام وأضف ما تحتاجه من منتجات.</p>
        <Link href="/products" className="btn btn-primary mt-4">تصفح المنتجات</Link>
      </div>
    );
  }

  const blocked = quote.lines.some((l) => !l.available);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <section aria-label="منتجات السلة" className="grid gap-3">
        {error ? <p role="alert" className="alert alert-error">{error}</p> : null}
        {quote.lines.map((l) => (
          <article key={l.productId} className="card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold">
                <Link href={`/products/${l.slug}`} className="hover:underline">{l.name}</Link>
              </h2>
              <p className="hint">{formatSar(l.priceHalala)} للوحدة</p>
              {l.requiresPrescription ? <span className="badge badge-rx mt-1">℞ يتطلب وصفة طبية</span> : null}
              {!l.available ? (
                <p role="alert" className="alert alert-warn mt-2">
                  {l.stock > 0 ? `المتاح من هذا المنتج ${l.stock} فقط، عدّل الكمية.` : "هذا المنتج غير متوفر حاليًا، أزله من السلة."}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={`q-${l.productId}`} className="sr-only">الكمية لـ {l.name}</label>
              <input
                id={`q-${l.productId}`}
                type="number"
                min={1}
                max={20}
                className="field w-20"
                value={l.quantity}
                onChange={(e) => setQuantity(l.productId, Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              />
              <p className="w-24 text-end font-bold">{formatSar(l.priceHalala * l.quantity)}</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => remove(l.productId)} aria-label={`إزالة ${l.name} من السلة`}>
                إزالة
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="card h-fit p-4" aria-label="ملخص الطلب">
        <h2 className="text-lg font-bold">ملخص الطلب</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between"><dt>المجموع</dt><dd>{formatSar(quote.totals.subtotalHalala)}</dd></div>
          <div className="flex justify-between">
            <dt>التوصيل</dt>
            <dd>{quote.totals.deliveryFeeHalala === 0 ? "مجاني" : formatSar(quote.totals.deliveryFeeHalala)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
            <dt>الإجمالي</dt><dd>{formatSar(quote.totals.totalHalala)}</dd>
          </div>
          <div className="hint flex justify-between"><dt>منها ضريبة القيمة المضافة 15%</dt><dd>{formatSar(quote.totals.vatHalala)}</dd></div>
        </dl>
        {quote.needsPrescription ? (
          <p className="alert alert-warn mt-3">يحتوي طلبك على دواء بوصفة طبية، سترفع الوصفة في الخطوة التالية.</p>
        ) : null}
        {blocked ? (
          <button type="button" className="btn btn-primary mt-4 w-full" disabled>أصلح الأصناف غير المتاحة</button>
        ) : (
          <Link href="/checkout" className="btn btn-primary mt-4 w-full">إتمام الطلب</Link>
        )}
      </aside>
    </div>
  );
}
