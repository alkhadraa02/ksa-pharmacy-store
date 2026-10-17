import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";
import { ShopShell } from "@/components/shop-shell";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} | صيدلية إلكترونية في السعودية` },
  description: "اطلب أدويتك وفيتامينات الأم والطفل ومنتجات العناية بالبشرة والأجهزة الطبية مع توصيل سريع، ورفع آمن للوصفة الطبية واستشارة صيدلاني.",
  alternates: { canonical: "/" },
  openGraph: { title: `${SITE_NAME} | صيدلية إلكترونية`, description: SITE_TAGLINE, url: "/", type: "website", locale: "ar_SA" },
};

const STEPS = [
  { n: "1", title: "اختر منتجاتك", text: "ابحث بالاسم أو المادة الفعالة وصفِّ حسب الشكل الدوائي." },
  { n: "2", title: "ارفع الوصفة عند الحاجة", text: "الأدوية بوصفة طبية تُراجع من الصيدلاني قبل التجهيز." },
  { n: "3", title: "حدد موعد التوصيل", text: "اختر اليوم والفترة التي تناسبك وادفع عند الاستلام." },
];

async function HomeContent() {
  const [categories, featured] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: { where: { active: true } } } } } }),
    db.product.findMany({ where: { active: true, stock: { gt: 0 }, requiresPrescription: false }, orderBy: { name: "asc" }, take: 8, include: { category: true } }),
  ]);

  return (
    <div className="grid gap-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Pharmacy", name: SITE_NAME, url: SITE_URL, description: SITE_TAGLINE, areaServed: { "@type": "Country", name: "المملكة العربية السعودية" } }} />

      <section className="card grid gap-5 bg-brand-soft p-6 md:grid-cols-[1.4fr_1fr] md:items-center md:p-10" aria-labelledby="hero-title">
        <div className="grid gap-4">
          <h1 id="hero-title" className="text-3xl font-extrabold leading-tight text-brand-strong md:text-4xl">
            صيدليتك في جيبك، ودواؤك يصلك حيث أنت
          </h1>
          <p className="max-w-prose text-lg text-muted">{SITE_TAGLINE}. أدوية، فيتامينات، منتجات الأم والطفل، العناية بالبشرة وأجهزة القياس المنزلية.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-primary">
              تسوّق الآن
            </Link>
            <Link href="/prescription" className="btn btn-outline">
              ارفع وصفتك
            </Link>
          </div>
        </div>
        <ul className="grid gap-2 text-sm font-semibold" aria-label="مميزات الخدمة">
          <li className="card p-3">✅ صيادلة مرخّصون يراجعون كل وصفة</li>
          <li className="card p-3">🚚 توصيل مجاني للطلبات من 200 ر.س</li>
          <li className="card p-3">💵 الدفع عند الاستلام</li>
          <li className="card p-3">🔒 الوصفات تُحفظ بسرية تامة</li>
        </ul>
      </section>

      <section aria-labelledby="cats-title">
        <h2 id="cats-title" className="mb-4 text-2xl font-bold">
          تسوّق حسب القسم
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/category/${c.slug}`} className="card grid min-h-32 place-items-center gap-1 p-4 text-center hover:border-brand">
                <span className="text-3xl" aria-hidden="true">
                  {c.icon}
                </span>
                <span className="font-bold">{c.name}</span>
                <span className="hint">{c._count.products} منتج</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="featured-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="featured-title" className="text-2xl font-bold">
            منتجات مختارة
          </h2>
          <Link href="/products" className="font-semibold text-brand-strong hover:underline">
            عرض الكل
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <li key={p.id} className="min-w-0">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="mb-4 text-2xl font-bold">
          كيف يعمل الطلب؟
        </h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="card flex gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold text-on-brand" aria-hidden="true">
                {s.n}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold">{s.title}</h3>
                <p className="hint mt-1">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-6" aria-labelledby="consult-title">
        <div>
          <h2 id="consult-title" className="text-xl font-bold">
            عندك سؤال عن دواء؟
          </h2>
          <p className="hint mt-1">أرسل استفسارك وسيتواصل معك صيدلاني مرخّص.</p>
        </div>
        <Link href="/consultation" className="btn btn-primary">
          اطلب استشارة صيدلاني
        </Link>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <ShopShell>
      <HomeContent />
    </ShopShell>
  );
}
