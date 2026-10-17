import { db } from "@/lib/db";
import { readJson, requireAdminApi } from "@/lib/guard";
import { json } from "@/lib/http";
import { firstIssue, productSchema, slugify } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireAdminApi(req);
  if ("error" in auth) return auth.error;
  const parsed = productSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: firstIssue(parsed.error) }, 400);
  const d = parsed.data;
  if (!(await db.category.findUnique({ where: { id: d.categoryId } }))) return json({ error: "القسم غير موجود" }, 400);

  let slug = slugify(d.name);
  if (await db.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  const product = await db.product.create({
    data: {
      slug,
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
  return json({ id: product.id }, 201);
}
