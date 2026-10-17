import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    db.category.findMany({ select: { slug: true } }),
    db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const fixed = ["", "/products", "/prescription", "/consultation", "/track"].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const }));
  return [
    ...fixed,
    ...categories.map((c) => ({ url: `${SITE_URL}/category/${encodeURIComponent(c.slug)}`, changeFrequency: "weekly" as const })),
    ...products.map((p) => ({ url: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const })),
  ];
}
