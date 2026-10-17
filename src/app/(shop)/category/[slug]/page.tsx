import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductBrowser } from "@/components/product-browser";
import { db } from "@/lib/db";
import { decodeSlug, metaDescription, shortTitle } from "@/lib/seo";
import type { ProductFilters } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return { title: "القسم غير موجود", robots: { index: false } };
  return {
    title: shortTitle(category.name),
    description: metaDescription(`${category.description}. تسوّق منتجات ${category.name} بأسعار شاملة الضريبة مع توصيل سريع.`),
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { title: category.name, url: `/category/${category.slug}`, locale: "ar_SA" },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = decodeSlug((await params).slug);
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();
  const sp = await searchParams;
  const one = (k: string) => {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s ? s.slice(0, 80) : undefined;
  };
  const filters: ProductFilters = { q: one("q"), rx: one("rx"), form: one("form"), available: one("available"), sort: one("sort") };

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="text-3xl font-extrabold">
          <span aria-hidden="true">{category.icon} </span>
          {category.name}
        </h1>
        <p className="hint mt-1">{category.description}</p>
      </header>
      <ProductBrowser basePath={`/category/${category.slug}`} filters={filters} fixedCategory={category.slug} />
    </div>
  );
}
