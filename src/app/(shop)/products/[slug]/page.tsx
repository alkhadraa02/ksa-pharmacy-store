import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { RxBadge } from "@/components/rx-badge";
import { SITE_URL } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatSar } from "@/lib/format";
import { isSellable } from "@/lib/inventory";
import { decodeSlug, metaDescription, shortTitle } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return db.product.findUnique({ where: { slug }, include: { category: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await load(decodeSlug((await params).slug));
  if (!product || !product.active) return { title: "المنتج غير موجود", robots: { index: false } };
  const base = [product.activeIngredient && product.activeIngredient !== "—" ? `المادة الفعالة ${product.activeIngredient}` : "", product.dosageForm, product.strength !== "—" ? product.strength : "", product.description]
    .filter(Boolean)
    .join(" · ");
  return {
    title: shortTitle(product.name),
    description: metaDescription(`${product.name}: ${base}`),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description: metaDescription(base), url: `/products/${product.slug}`, type: "website", locale: "ar_SA" },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await load(decodeSlug((await params).slug));
  if (!product || !product.active) notFound();
  const sellable = isSellable(product);
  const related = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    orderBy: { name: "asc" },
    include: { category: true },
  });
  const hasIngredient = product.activeIngredient && product.activeIngredient !== "—";

  const rows: [string, string][] = [
    ["المادة الفعالة", hasIngredient ? product.activeIngredient : "—"],
    ["الشكل الدوائي", product.dosageForm || "—"],
    ["التركيز / الحجم", product.strength || "—"],
    ["الماركة", product.brand || "—"],
    ["القسم", product.category.name],
  ];

  return (
    <article className="grid gap-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          category: product.category.name,
          url: `${SITE_URL}/products/${product.slug}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "SAR",
            price: (product.priceHalala / 100).toFixed(2),
            availability: sellable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }}
      />
      <nav aria-label="مسار التنقل" className="hint">
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link href="/" className="hover:underline">
              الرئيسية
            </Link>{" "}
            /
          </li>
          <li>
            <Link href={`/category/${product.category.slug}`} className="hover:underline">
              {product.category.name}
            </Link>{" "}
            /
          </li>
          <li aria-current="page" className="min-w-0 truncate">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className="card grid gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <RxBadge requiresPrescription={product.requiresPrescription} />
            {product.stock > 0 && product.stock <= product.lowStockThreshold ? <span className="badge badge-warn">كمية محدودة</span> : null}
          </div>
          <h1 className="text-2xl font-extrabold leading-snug md:text-3xl">{product.name}</h1>
          <p className="text-muted">{product.description}</p>
          <table className="table">
            <caption className="sr-only">مواصفات المنتج</caption>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-40">
                    {k}
                  </th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {product.requiresPrescription ? (
            <p className="alert alert-warn">
              هذا الدواء لا يُصرف إلا بوصفة طبية. سيُطلب منك رفع صورة الوصفة قبل إتمام الطلب، ويراجعها الصيدلاني قبل التجهيز.
            </p>
          ) : null}
        </div>

        <aside className="card grid h-fit gap-3 p-5" aria-label="الشراء">
          <p className="text-3xl font-extrabold text-brand-strong">{formatSar(product.priceHalala)}</p>
          <p className="hint">السعر شامل ضريبة القيمة المضافة 15%</p>
          {sellable ? (
            <>
              <p className="font-semibold text-ok">متوفر في المخزون</p>
              <AddToCartButton productId={product.id} maxQuantity={product.stock} withQuantity />
            </>
          ) : (
            <p className="alert alert-warn">غير متوفر حاليًا. تواصل مع الصيدلاني لمعرفة البديل.</p>
          )}
          <Link href="/consultation" className="btn btn-outline">
            اسأل الصيدلاني عن هذا المنتج
          </Link>
        </aside>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-title">
          <h2 id="related-title" className="mb-3 text-xl font-bold">
            منتجات مشابهة
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id} className="min-w-0">
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
