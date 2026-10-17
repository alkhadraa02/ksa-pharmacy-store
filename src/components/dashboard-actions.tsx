"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUS_LABEL, ORDER_TRANSITIONS, type OrderStatus } from "@/lib/status";

async function send(url: string, method: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data };
}

export function LogoutButton() {
  const router = useRouter();
  async function onClick() {
    await send("/api/auth/logout", "POST");
    router.push("/login");
    router.refresh();
  }
  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={onClick}>
      تسجيل الخروج
    </button>
  );
}

export function OrderStatusButtons({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = ORDER_TRANSITIONS[status as OrderStatus] ?? [];
  if (next.length === 0) return null;

  async function go(to: string) {
    if (to === "CANCELLED" && !window.confirm("إلغاء الطلب وإرجاع الكميات للمخزون؟")) return;
    setBusy(true);
    setError("");
    const res = await send(`/api/admin/orders/${orderId}`, "PATCH", { status: to });
    setBusy(false);
    if (!res.ok) setError(String(res.data.error ?? "تعذّر تحديث الطلب"));
    else router.refresh();
  }

  return (
    <div className="mt-2 grid gap-1">
      <div className="flex flex-wrap gap-1">
        {next.map((to) => (
          <button key={to} type="button" disabled={busy} onClick={() => go(to)} className={`btn btn-sm ${to === "CANCELLED" ? "btn-outline" : "btn-primary"}`}>
            {to === "CANCELLED" ? "إلغاء" : `← ${ORDER_STATUS_LABEL[to]}`}
          </button>
        ))}
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function ProductDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onClick() {
    if (!window.confirm(`حذف «${name}»؟ المنتجات المرتبطة بطلبات سابقة تُخفى بدل الحذف.`)) return;
    setBusy(true);
    const res = await send(`/api/admin/products/${id}`, "DELETE");
    setBusy(false);
    if (res.ok) router.refresh();
    else window.alert(String(res.data.error ?? "تعذّر الحذف"));
  }
  return (
    <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={onClick} aria-label={`حذف ${name}`}>
      حذف
    </button>
  );
}

export function PrescriptionReview({ id }: { id: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: "APPROVED" | "REJECTED") {
    setBusy(true);
    setError("");
    const res = await send(`/api/admin/prescriptions/${id}`, "POST", { decision, note });
    setBusy(false);
    if (!res.ok) setError(String(res.data.error ?? "تعذّر حفظ القرار"));
    else router.refresh();
  }

  return (
    <div className="grid gap-2">
      <div>
        <label htmlFor={`note-${id}`} className="label">ملاحظة للعميل (إلزامية عند الرفض)</label>
        <textarea id={`note-${id}`} className="field" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => decide("APPROVED")}>قبول الوصفة</button>
        <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => decide("REJECTED")}>رفض الوصفة</button>
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function ConsultationStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setBusy(true);
    await send(`/api/admin/consultations/${id}`, "PATCH", { status: e.target.value });
    setBusy(false);
    router.refresh();
  }
  return (
    <>
      <label htmlFor={`cs-${id}`} className="sr-only">حالة الاستشارة</label>
      <select id={`cs-${id}`} className="field w-36" defaultValue={status} onChange={onChange} disabled={busy}>
        <option value="NEW">جديد</option>
        <option value="CONTACTED">تم التواصل</option>
        <option value="CLOSED">مغلق</option>
      </select>
    </>
  );
}
