import { z } from "zod";
import { readJson, requireAdminApi } from "@/lib/guard";
import { json } from "@/lib/http";
import { OrderError, reviewPrescription } from "@/lib/orders";
import { firstIssue } from "@/lib/validation";

const schema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"], "القرار غير صحيح"),
  note: z.string().trim().max(500, "الملاحظة طويلة جدًا").default(""),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(req);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  try {
    const res = await reviewPrescription((await ctx.params).id, parsed.data.decision, parsed.data.note, auth.admin.email);
    return json({ ok: true, ...res });
  } catch (e) {
    if (e instanceof OrderError) return json({ error: e.message }, e.status);
    throw e;
  }
}
