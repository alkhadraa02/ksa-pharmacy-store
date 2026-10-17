import { db } from "@/lib/db";
import { readJson, sameOrigin } from "@/lib/guard";
import { clientIp, json, rateLimit, TOO_MANY } from "@/lib/http";
import { consultationSchema, firstIssue } from "@/lib/validation";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  if (!rateLimit(`consult:${clientIp(req)}`, 5, 10 * 60_000)) return json({ error: TOO_MANY }, 429);
  const parsed = consultationSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  const row = await db.consultation.create({ data: parsed.data });
  return json({ id: row.id }, 201);
}
