import { clientIp, json, rateLimit, TOO_MANY } from "@/lib/http";
import { readJson, sameOrigin } from "@/lib/guard";
import { OrderError, createOrder } from "@/lib/orders";
import { firstIssue, orderInputSchema } from "@/lib/validation";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  if (!rateLimit(`order:${clientIp(req)}`, 10, 10 * 60_000)) return json({ error: TOO_MANY }, 429);
  const parsed = orderInputSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  try {
    const order = await createOrder(parsed.data);
    return json({ number: order.number, status: order.status, totalHalala: order.totalHalala }, 201);
  } catch (e) {
    if (e instanceof OrderError) return json({ error: e.message }, e.status);
    console.error("order failed", e);
    return json({ error: "تعذّر إنشاء الطلب، حاول مرة أخرى" }, 500);
  }
}
