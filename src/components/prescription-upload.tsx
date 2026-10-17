"use client";

import { useState } from "react";

export function PrescriptionUpload({
  defaultName = "",
  defaultPhone = "",
  onUploaded,
  showContact = true,
}: {
  defaultName?: string;
  defaultPhone?: string;
  onUploaded?: (id: string) => void;
  showContact?: boolean;
}) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fileInput = e.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError("اختر ملف الوصفة");
      return;
    }
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("name", name);
    fd.set("phone", phone);
    fd.set("file", file);
    try {
      const r = await fetch("/api/prescriptions", { method: "POST", body: fd });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "تعذّر رفع الوصفة");
      setDoneId(body.id);
      onUploaded?.(body.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر رفع الوصفة");
    } finally {
      setBusy(false);
    }
  }

  if (doneId) {
    return (
      <div role="status" className="alert alert-ok">
        <p className="font-bold">تم رفع الوصفة بنجاح ✓</p>
        <p className="mt-1 text-sm">سيراجعها الصيدلاني قبل تجهيز طلبك. رقم الوصفة المرجعي: <bdi dir="ltr">{doneId.slice(-8)}</bdi></p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate>
      {showContact ? (
        <>
          <div>
            <label htmlFor="rx-name" className="label">الاسم</label>
            <input id="rx-name" className="field" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="rx-phone" className="label">رقم الجوال</label>
            <input id="rx-phone" className="field" dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="05xxxxxxxx" autoComplete="tel" />
          </div>
        </>
      ) : null}
      <div>
        <label htmlFor="rx-file" className="label">صورة أو ملف الوصفة (PDF / JPG / PNG / WebP حتى 5 ميجابايت)</label>
        <input id="rx-file" name="file" type="file" className="field" accept="application/pdf,image/jpeg,image/png,image/webp" required />
      </div>
      {error ? <p role="alert" className="alert alert-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "جارٍ الرفع…" : "رفع الوصفة"}</button>
    </form>
  );
}
