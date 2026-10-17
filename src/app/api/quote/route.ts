import { json } from "@/lib/http";
import { readJson } from "@/lib/guard";
import { quoteCart } from "@/lib/orders";
import { firstIssue, quoteSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const parsed = quoteSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  const quote = await quoteCart(parsed.data.items);
  return json(quote);
}
