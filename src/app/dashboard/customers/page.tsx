import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDate, formatSar } from "@/lib/format";

export const metadata: Metadata = { title: "العملاء" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: { where: { status: { not: "CANCELLED" } }, select: { totalHalala: true, createdAt: true } } },
  });
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-extrabold">العملاء ({customers.length})</h1>
      {customers.length === 0 ? (
        <p className="card p-6 text-center text-muted">لا يوجد عملاء بعد. يظهر العميل هنا بعد أول طلب.</p>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th scope="col">الاسم</th><th scope="col">الجوال</th><th scope="col">المدينة</th><th scope="col">عدد الطلبات</th><th scope="col">إجمالي المشتريات</th><th scope="col">آخر طلب</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const total = c.orders.reduce((s, o) => s + o.totalHalala, 0);
                const last = c.orders.reduce<Date | null>((m, o) => (!m || o.createdAt > m ? o.createdAt : m), null);
                return (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.name}</td>
                    <td dir="ltr">{c.phone}</td>
                    <td>{c.city || "—"}</td>
                    <td>{c.orders.length}</td>
                    <td>{formatSar(total)}</td>
                    <td>{last ? formatDate(last) : "—"}</td>
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
