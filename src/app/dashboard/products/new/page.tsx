import type { Metadata } from "next";
import { EMPTY_PRODUCT, ProductForm } from "@/components/product-form";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "منتج جديد" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-extrabold">منتج جديد</h1>
      <ProductForm categories={categories} initial={EMPTY_PRODUCT} />
    </div>
  );
}
