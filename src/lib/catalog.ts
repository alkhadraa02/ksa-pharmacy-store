import type { Prisma } from "@prisma/client";
import { db } from "./db";

export type ProductFilters = {
  q?: string;
  category?: string;
  rx?: string;
  form?: string;
  available?: string;
  sort?: string;
};

export const SORT_OPTIONS = [
  { id: "name", label: "الاسم" },
  { id: "price-asc", label: "السعر: الأقل أولًا" },
  { id: "price-desc", label: "السعر: الأعلى أولًا" },
] as const;

export function buildProductWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true };
  const q = f.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
      { activeIngredient: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (f.category) where.category = { slug: f.category };
  if (f.rx === "rx") where.requiresPrescription = true;
  if (f.rx === "otc") where.requiresPrescription = false;
  if (f.form) where.dosageForm = f.form;
  if (f.available === "1") where.stock = { gt: 0 };
  return where;
}

export function buildProductOrder(sort?: string): Prisma.ProductOrderByWithRelationInput {
  if (sort === "price-asc") return { priceHalala: "asc" };
  if (sort === "price-desc") return { priceHalala: "desc" };
  return { name: "asc" };
}

export async function listProducts(f: ProductFilters) {
  return db.product.findMany({
    where: buildProductWhere(f),
    orderBy: buildProductOrder(f.sort),
    include: { category: true },
    take: 60,
  });
}

export async function listCategories() {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listDosageForms(): Promise<string[]> {
  const rows = await db.product.findMany({ where: { active: true, dosageForm: { not: "" } }, select: { dosageForm: true }, distinct: ["dosageForm"] });
  return rows.map((r) => r.dosageForm).sort((a, b) => a.localeCompare(b, "ar"));
}
