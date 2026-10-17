import type { Metadata } from "next";
import Link from "next/link";
import { ProductDeleteButton } from "@/components/dashboard-actions";
import { db } from "@/lib/db";
import { formatDate, formatSar } from "@/lib/format";
import { expiryState, isLowStock } from "@/lib/inventory";

export const metadata: Metadata = { title: "المنتجات" };
export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const products = await db.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">المنتجات ({products.length})</h1>
        <Link href="/dashboard/products/new" className="btn btn-primary">+ منتج جديد</Link>
      </div>
      {products.length === 0 ? (
        <p className="card p-6 text-center text-muted">لا توجد منتجات بعد. أضف أول منتج.</p>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">المنتج</th>
                <th scope="col">القسم</th>
                <th scope="col">النوع</th>
                <th scope="col">السعر</th>
                <th scope="col">المخزون</th>
                <th scope="col">الصلاحية</th>
                <th scope="col">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const ex = expiryState(p.expiryDate);
                return (
                  <tr key={p.id}>
                    <td className="min-w-48">
                      <span className="font-semibold">{p.name}</span>
                      {!p.active ? <span className="badge badge-muted ms-2">مخفي</span> : null}
                    </td>
                    <td>{p.category.name}</td>
                    <td>{p.requiresPrescription ? <span className="badge badge-rx">بوصفة</span> : <span className="badge badge-otc">بدون وصفة</span>}</td>
                    <td>{formatSar(p.priceHalala)}</td>
                    <td>
                      {p.stock}
                      {isLowStock(p.stock, p.lowStockThreshold) ? <span className="badge badge-warn ms-2">منخفض</span> : null}
                    </td>
                    <td>
                      {p.expiryDate ? formatDate(p.expiryDate) : "—"}
                      {ex === "near" ? <span className="badge badge-warn ms-2">قريب</span> : null}
                      {ex === "expired" ? <span className="badge badge-rx ms-2">منتهي</span> : null}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/products/${p.id}`} className="btn btn-outline btn-sm" aria-label={`تعديل ${p.name}`}>تعديل</Link>
                        <ProductDeleteButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
