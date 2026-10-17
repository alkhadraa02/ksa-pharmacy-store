import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listCategories } from "@/lib/catalog";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await listCategories();
  return (
    <>
      <SiteHeader categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
