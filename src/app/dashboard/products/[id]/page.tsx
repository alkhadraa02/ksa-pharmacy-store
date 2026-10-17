import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { db } from "@/lib/db";
import { dateInputValue } from "@/lib/format";

export const metadata: Metadata = { title: "تعديل منتج" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-extrabold">تعديل: {product.name}</h1>
      <ProductForm
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name,
          brand: product.brand,
          description: product.description,
          activeIngredient: product.activeIngredient,
          dosageForm: product.dosageForm,
          strength: product.strength,
          categoryId: product.categoryId,
          requiresPrescription: product.requiresPrescription,
          active: product.active,
          price: (product.priceHalala / 100).toFixed(2),
          stock: String(product.stock),
          lowStockThreshold: String(product.lowStockThreshold),
          expiryDate: dateInputValue(product.expiryDate),
        }}
      />
    </div>
  );
}
