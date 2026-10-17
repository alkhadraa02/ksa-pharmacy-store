"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ProductFormValues = {
  name: string;
  brand: string;
  description: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  categoryId: string;
  requiresPrescription: boolean;
  active: boolean;
  price: string;
  stock: string;
  lowStockThreshold: string;
  expiryDate: string;
};

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  brand: "",
  description: "",
  activeIngredient: "",
  dosageForm: "",
  strength: "",
  categoryId: "",
  requiresPrescription: false,
  active: true,
  price: "",
  stock: "0",
  lowStockThreshold: "10",
  expiryDate: "",
};

export function ProductForm({ categories, initial, productId }: { categories: { id: string; name: string }[]; initial: ProductFormValues; productId?: string }) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>({ ...initial, categoryId: initial.categoryId || categories[0]?.id || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const text = (k: keyof ProductFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((s) => ({ ...s, [k]: e.target.value }));
  const check = (k: "requiresPrescription" | "active") => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.checked }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      ...v,
      price: Number(v.price),
      stock: Number(v.stock),
      lowStockThreshold: Number(v.lowStockThreshold),
    };
    const r = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setError(body.error ?? "تعذّر حفظ المنتج");
      return;
    }
    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <label htmlFor="p-name" className="label">اسم المنتج</label>
        <input id="p-name" className="field" value={v.name} onChange={text("name")} required maxLength={120} />
      </div>
      <div>
        <label htmlFor="p-brand" className="label">الماركة</label>
        <input id="p-brand" className="field" value={v.brand} onChange={text("brand")} maxLength={80} />
      </div>
      <div>
        <label htmlFor="p-cat" className="label">القسم</label>
        <select id="p-cat" className="field" value={v.categoryId} onChange={text("categoryId")}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="p-ing" className="label">المادة الفعالة</label>
        <input id="p-ing" className="field" value={v.activeIngredient} onChange={text("activeIngredient")} maxLength={160} />
      </div>
      <div>
        <label htmlFor="p-form" className="label">الشكل الدوائي</label>
        <input id="p-form" className="field" value={v.dosageForm} onChange={text("dosageForm")} maxLength={60} placeholder="أقراص، كبسولات، شراب…" />
      </div>
      <div>
        <label htmlFor="p-str" className="label">التركيز / الحجم</label>
        <input id="p-str" className="field" value={v.strength} onChange={text("strength")} maxLength={60} />
      </div>
      <div>
        <label htmlFor="p-price" className="label">السعر (ر.س شامل الضريبة)</label>
        <input id="p-price" className="field" type="number" min="0.01" step="0.01" value={v.price} onChange={text("price")} required />
      </div>
      <div>
        <label htmlFor="p-stock" className="label">المخزون</label>
        <input id="p-stock" className="field" type="number" min="0" step="1" value={v.stock} onChange={text("stock")} required />
      </div>
      <div>
        <label htmlFor="p-low" className="label">حد التنبيه عند انخفاض المخزون</label>
        <input id="p-low" className="field" type="number" min="0" step="1" value={v.lowStockThreshold} onChange={text("lowStockThreshold")} />
      </div>
      <div>
        <label htmlFor="p-exp" className="label">تاريخ انتهاء الصلاحية</label>
        <input id="p-exp" className="field" type="date" dir="ltr" value={v.expiryDate} onChange={text("expiryDate")} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-desc" className="label">الوصف</label>
        <textarea id="p-desc" className="field" rows={3} value={v.description} onChange={text("description")} maxLength={2000} />
      </div>
      <div className="flex flex-wrap gap-6 sm:col-span-2">
        <label className="flex min-h-11 items-center gap-2 font-semibold">
          <input type="checkbox" checked={v.requiresPrescription} onChange={check("requiresPrescription")} /> يتطلب وصفة طبية
        </label>
        <label className="flex min-h-11 items-center gap-2 font-semibold">
          <input type="checkbox" checked={v.active} onChange={check("active")} /> ظاهر في المتجر
        </label>
      </div>
      {error ? <p role="alert" className="alert alert-error sm:col-span-2">{error}</p> : null}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ المنتج"}</button>
        <button type="button" className="btn btn-outline" onClick={() => router.push("/dashboard/products")}>إلغاء</button>
      </div>
    </form>
  );
}
