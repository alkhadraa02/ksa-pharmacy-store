"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const body = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setError(body.error ?? "تعذّر تسجيل الدخول");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-3 p-5" noValidate>
      <div>
        <label htmlFor="l-email" className="label">البريد الإلكتروني</label>
        <input id="l-email" className="field" dir="ltr" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="l-pass" className="label">كلمة المرور</label>
        <input id="l-pass" className="field" dir="ltr" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error ? <p role="alert" className="alert alert-error">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "جارٍ الدخول…" : "تسجيل الدخول"}</button>
    </form>
  );
}
