import { cookies } from "next/headers";
import { DUMMY_HASH, SESSION_COOKIE, createSession, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { readJson, sameOrigin } from "@/lib/guard";
import { clientIp, json, rateLimit, TOO_MANY } from "@/lib/http";
import { firstIssue, loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  if (!rateLimit(`login:${clientIp(req)}`, 8, 10 * 60_000)) return json({ error: TOO_MANY }, 429);
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || user.role !== "ADMIN") return json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, 401);

  const { token, expiresAt } = await createSession(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  return json({ ok: true });
}
