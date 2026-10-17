import type { Metadata } from "next";
import { PrescriptionReview } from "@/components/dashboard-actions";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { RX_STATUS_LABEL } from "@/lib/status";

export const metadata: Metadata = { title: "الوصفات الطبية" };
export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const all = await db.prescription.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { orders: { select: { number: true, status: true } } } });
  const pending = all.filter((r) => r.status === "PENDING");
  const reviewed = all.filter((r) => r.status !== "PENDING");

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-extrabold">مراجعة الوصفات الطبية</h1>

      <section aria-labelledby="pending-h" className="grid gap-3">
        <h2 id="pending-h" className="text-lg font-bold">بانتظار المراجعة ({pending.length})</h2>
        {pending.length === 0 ? <p className="card p-6 text-center text-muted">لا توجد وصفات بانتظار المراجعة.</p> : null}
        {pending.map((r) => (
          <article key={r.id} className="card grid gap-3 p-4 md:grid-cols-2">
            <div className="min-w-0">
              <p className="font-bold">{r.customerName}</p>
              <p className="hint" dir="ltr">{r.phone}</p>
              <p className="hint">رُفعت {formatDateTime(r.createdAt)}</p>
              <p className="mt-1 truncate text-sm">الملف: {r.originalName}</p>
              {r.filePath ? (
                <a href={`/api/admin/prescriptions/${r.id}/file`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm mt-2">فتح ملف الوصفة</a>
              ) : (
                <p className="hint mt-2">لا يوجد ملف (بيانات تجريبية)</p>
              )}
              {r.orders.length > 0 ? (
                <p className="mt-2 text-sm">
                  طلبات مرتبطة: {r.orders.map((o) => o.number).join("، ")}
                </p>
              ) : null}
            </div>
            <PrescriptionReview id={r.id} />
          </article>
        ))}
      </section>

      <section aria-labelledby="done-h" className="grid gap-3">
        <h2 id="done-h" className="text-lg font-bold">تمت مراجعتها ({reviewed.length})</h2>
        {reviewed.length === 0 ? <p className="hint">لا يوجد سجل بعد.</p> : (
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr><th scope="col">العميل</th><th scope="col">الجوال</th><th scope="col">القرار</th><th scope="col">الملاحظة</th><th scope="col">المراجع</th><th scope="col">التاريخ</th></tr>
              </thead>
              <tbody>
                {reviewed.map((r) => (
                  <tr key={r.id}>
                    <td>{r.customerName}</td>
                    <td dir="ltr">{r.phone}</td>
                    <td><span className={`badge ${r.status === "APPROVED" ? "badge-otc" : "badge-rx"}`}>{RX_STATUS_LABEL[r.status]}</span></td>
                    <td>{r.reviewNote || "—"}</td>
                    <td dir="ltr">{r.reviewedBy ?? "—"}</td>
                    <td>{r.reviewedAt ? formatDateTime(r.reviewedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
