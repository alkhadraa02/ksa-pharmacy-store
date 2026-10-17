import { z } from "zod";
import { readJson, requireAdminApi } from "@/lib/guard";
import { json } from "@/lib/http";
import { OrderError, updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/status";
import { firstIssue } from "@/lib/validation";

const schema = z.object({ status: z.enum(ORDER_STATUSES, "حالة غير صحيحة") });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(req);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  try {
    const order = await updateOrderStatus((await ctx.params).id, parsed.data.status);
    return json({ ok: true, status: order.status });
  } catch (e) {
    if (e instanceof OrderError) return json({ error: e.message }, e.status);
    throw e;
  }
}
