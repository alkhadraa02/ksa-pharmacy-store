import type { Metadata } from "next";
import { ProductBrowser } from "@/components/product-browser";
import type { ProductFilters } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description: "تصفّح أدوية وفيتامينات ومنتجات الأم والطفل والعناية بالبشرة والأجهزة الطبية، وصفِّ حسب المادة الفعالة والشكل الدوائي ونوع الصرف.",
  alternates: { canonical: "/products" },
};

type Search = Record<string, string | string[] | undefined>;

export function pickFilters(sp: Search): ProductFilters {
  const one = (k: string) => {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s ? s.slice(0, 80) : undefined;
  };
  return { q: one("q"), category: one("category"), rx: one("rx"), form: one("form"), available: one("available"), sort: one("sort") };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = pickFilters(await searchParams);
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-extrabold">كل المنتجات</h1>
      <ProductBrowser basePath="/products" filters={filters} />
    </div>
  );
}
