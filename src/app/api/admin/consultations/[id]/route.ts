import { z } from "zod";
import { db } from "@/lib/db";
import { readJson, requireAdminApi } from "@/lib/guard";
import { json } from "@/lib/http";
import { firstIssue } from "@/lib/validation";

const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "CLOSED"], "حالة غير صحيحة") });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(req);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  const { id } = await ctx.params;
  const res = await db.consultation.updateMany({ where: { id }, data: { status: parsed.data.status } });
  if (res.count === 0) return json({ error: "الطلب غير موجود" }, 404);
  return json({ ok: true });
}
