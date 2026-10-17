import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession } from "@/lib/auth";
import { sameOrigin } from "@/lib/guard";
import { json } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);
  store.delete(SESSION_COOKIE);
  return json({ ok: true });
}
