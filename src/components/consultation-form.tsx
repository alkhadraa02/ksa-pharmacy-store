"use client";

import { useState } from "react";

export function ConsultationForm({ topics }: { topics: readonly string[] }) {
  const [form, setForm] = useState({ name: "", phone: "", topic: topics[0] ?? "", message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "تعذّر إرسال الطلب");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال الطلب");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="alert alert-ok">
        <p className="font-bold">وصلنا طلبك ✓</p>
        <p className="mt-1 text-sm">سيتواصل معك أحد الصيادلة على رقم جوالك في أقرب وقت.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-3 p-4" noValidate>
      <div>
        <label htmlFor="k-name" className="label">الاسم</label>
        <input id="k-name" className="field" value={form.name} onChange={set("name")} required maxLength={80} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="k-phone" className="label">رقم الجوال</label>
        <input id="k-phone" className="field" dir="ltr" inputMode="tel" value={form.phone} onChange={set("phone")} required placeholder="05xxxxxxxx" autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="k-topic" className="label">موضوع الاستشارة</label>
        <select id="k-topic" className="field" value={form.topic} onChange={set("topic")}>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="k-msg" className="label">استفسارك</label>
        <textarea id="k-msg" className="field" rows={5} value={form.message} onChange={set("message")} required minLength={10} maxLength={1000} />
      </div>
      {error ? <p role="alert" className="alert alert-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "جارٍ الإرسال…" : "إرسال الاستشارة"}</button>
    </form>
  );
}
