import { db } from "@/lib/db";
import { readJson, requireAdminApi } from "@/lib/guard";
import { json } from "@/lib/http";
import { firstIssue, productSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireAdminApi(req);
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const parsed = productSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  const d = parsed.data;
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return json({ error: "المنتج غير موجود" }, 404);
  if (!(await db.category.findUnique({ where: { id: d.categoryId } }))) return json({ error: "القسم غير موجود" }, 400);
  await db.product.update({
    where: { id },
    data: {
      name: d.name,
      brand: d.brand,
      description: d.description,
      activeIngredient: d.activeIngredient,
      dosageForm: d.dosageForm,
      strength: d.strength,
      requiresPrescription: d.requiresPrescription,
      active: d.active,
      priceHalala: Math.round(d.price * 100),
      stock: d.stock,
      lowStockThreshold: d.lowStockThreshold,
      expiryDate: d.expiryDate ? new Date(`${d.expiryDate}T00:00:00Z`) : null,
      categoryId: d.categoryId,
    },
  });
  return json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const auth = await requireAdminApi(req);
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const existing = await db.product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } });
  if (!existing) return json({ error: "المنتج غير موجود" }, 404);
  if (existing._count.orderItems > 0) {
    // Sold products keep their history: hide instead of deleting.
    await db.product.update({ where: { id }, data: { active: false } });
    return json({ ok: true, archived: true });
  }
  await db.product.delete({ where: { id } });
  return json({ ok: true, archived: false });
}
