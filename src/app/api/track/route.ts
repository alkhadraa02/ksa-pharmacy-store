import { z } from "zod";
import { readJson } from "@/lib/guard";
import { clientIp, json, rateLimit, TOO_MANY } from "@/lib/http";
import { trackOrder } from "@/lib/orders";
import { firstIssue, phoneSchema } from "@/lib/validation";

const schema = z.object({ number: z.string("رقم الطلب مطلوب").trim().min(5, "رقم الطلب غير صحيح").max(40), phone: phoneSchema });

export async function POST(req: Request) {
  if (!rateLimit(`track:${clientIp(req)}`, 15, 10 * 60_000)) return json({ error: TOO_MANY }, 429);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  const order = await trackOrder(parsed.data.number, parsed.data.phone);
  if (!order) return json({ error: "لم نجد طلبًا بهذه البيانات. تأكد من رقم الطلب ورقم الجوال" }, 404);
  return json({
    number: order.number,
    status: order.status,
    createdAt: order.createdAt,
    deliveryDate: order.deliveryDate,
    deliverySlot: order.deliverySlot,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalHalala: order.totalHalala,
    vatHalala: order.vatHalala,
    deliveryFeeHalala: order.deliveryFeeHalala,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPriceHalala: i.unitPriceHalala })),
    prescription: order.prescription ? { status: order.prescription.status, note: order.prescription.reviewNote } : null,
  });
}
