import type { Metadata } from "next";
import { formatNumber, formatSar, riyadhDate } from "@/lib/format";
import { VAT_RATE_PERCENT } from "@/lib/pricing";
import { salesReport } from "@/lib/reports";

export const metadata: Metadata = { title: "تقرير المبيعات" };
export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function shift(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const today = riyadhDate();
  const to = sp.to && DATE_RE.test(sp.to) ? sp.to : today;
  const from = sp.from && DATE_RE.test(sp.from) ? sp.from : shift(to, -29);
  const report = await salesReport(from, to);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-extrabold">تقرير المبيعات</h1>
      <form method="get" className="card flex flex-wrap items-end gap-3 p-4">
        <div>
          <label htmlFor="r-from" className="label">من تاريخ</label>
          <input id="r-from" name="from" type="date" dir="ltr" className="field" defaultValue={from} required />
        </div>
        <div>
          <label htmlFor="r-to" className="label">إلى تاريخ</label>
          <input id="r-to" name="to" type="date" dir="ltr" className="field" defaultValue={to} required />
        </div>
        <button type="submit" className="btn btn-primary">عرض التقرير</button>
      </form>

      <p className="hint">يشمل الطلبات غير الملغاة فقط. الأسعار شاملة ضريبة القيمة المضافة {VAT_RATE_PERCENT}%، والضريبة محسوبة من الإجمالي.</p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li className="card p-4"><p className="hint">عدد الطلبات</p><p className="text-xl font-extrabold">{formatNumber(report.totals.orders)}</p></li>
        <li className="card p-4"><p className="hint">الصافي قبل الضريبة</p><p className="text-xl font-extrabold">{formatSar(report.totals.netHalala)}</p></li>
        <li className="card p-4"><p className="hint">ضريبة القيمة المضافة {VAT_RATE_PERCENT}%</p><p className="text-xl font-extrabold">{formatSar(report.totals.vatHalala)}</p></li>
        <li className="card p-4"><p className="hint">الإجمالي شامل الضريبة</p><p className="text-xl font-extrabold">{formatSar(report.totals.grossHalala)}</p></li>
      </ul>

      {report.rows.length === 0 ? (
        <p className="card p-6 text-center text-muted">لا توجد مبيعات في هذه الفترة.</p>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <caption className="sr-only">المبيعات اليومية</caption>
            <thead>
              <tr><th scope="col">التاريخ</th><th scope="col">الطلبات</th><th scope="col">الصافي</th><th scope="col">الضريبة 15%</th><th scope="col">الإجمالي</th></tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.date}>
                  <td dir="ltr" className="text-end">{r.date}</td>
                  <td>{r.orders}</td>
                  <td>{formatSar(r.netHalala)}</td>
                  <td>{formatSar(r.vatHalala)}</td>
                  <td className="font-semibold">{formatSar(r.grossHalala)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="p-3">المجموع</td><td>{report.totals.orders}</td><td>{formatSar(report.totals.netHalala)}</td><td>{formatSar(report.totals.vatHalala)}</td><td>{formatSar(report.totals.grossHalala)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {report.topProducts.length > 0 ? (
        <section className="card p-4" aria-labelledby="top-h">
          <h2 id="top-h" className="text-lg font-bold">الأكثر مبيعًا</h2>
          <ol className="mt-2 list-decimal ps-6">
            {report.topProducts.map((p) => <li key={p.name}>{p.name} — {p.quantity} قطعة</li>)}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
