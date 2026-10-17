import type { Metadata } from "next";
import { ConsultationStatusSelect } from "@/components/dashboard-actions";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "الاستشارات" };
export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const rows = await db.consultation.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-extrabold">طلبات الاستشارة ({rows.length})</h1>
      {rows.length === 0 ? <p className="card p-6 text-center text-muted">لا توجد طلبات استشارة.</p> : (
        <ul className="grid gap-3">
          {rows.map((c) => (
            <li key={c.id} className="card grid gap-2 p-4 md:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <p className="font-bold">{c.name} <span className="badge badge-info ms-2">{c.topic}</span></p>
                <p className="hint" dir="ltr">{c.phone}</p>
                <p className="mt-1 whitespace-pre-wrap break-words">{c.message}</p>
                <p className="hint mt-1">{formatDateTime(c.createdAt)}</p>
              </div>
              <ConsultationStatusSelect id={c.id} status={c.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
