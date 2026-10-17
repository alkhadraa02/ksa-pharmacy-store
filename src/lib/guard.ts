import { cookies } from "next/headers";
import { SESSION_COOKIE, findSessionUser } from "./auth";
import { json } from "./http";

/** Rejects cross-site browser requests (state-changing routes). Requests without Origin (curl, tests) pass. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function requireAdminApi(req: Request): Promise<{ admin: { id: string; email: string } } | { error: Response }> {
  if (!sameOrigin(req)) return { error: json({ error: "طلب غير مسموح" }, 403) };
  const store = await cookies();
  const user = await findSessionUser(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "ADMIN") return { error: json({ error: "يلزم تسجيل الدخول" }, 401) };
  return { admin: { id: user.id, email: user.email } };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
