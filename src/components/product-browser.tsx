import Link from "next/link";
import { SORT_OPTIONS, listCategories, listDosageForms, listProducts, type ProductFilters } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export async function ProductBrowser({ basePath, filters, fixedCategory }: { basePath: string; filters: ProductFilters; fixedCategory?: string }) {
  const effective: ProductFilters = fixedCategory ? { ...filters, category: fixedCategory } : filters;
  const [products, categories, forms] = await Promise.all([listProducts(effective), listCategories(), listDosageForms()]);
  const hasFilters = Boolean(filters.q || filters.rx || filters.form || filters.available || (!fixedCategory && filters.category));

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <form action={basePath} method="get" className="card grid h-fit gap-3 p-4" aria-label="تصفية المنتجات">
        <h2 className="text-lg font-bold">بحث وتصفية</h2>
        <div>
          <label htmlFor="f-q" className="label">
            كلمة البحث
          </label>
          <input id="f-q" name="q" type="search" defaultValue={filters.q ?? ""} className="field" placeholder="اسم الدواء أو المادة الفعالة" maxLength={80} />
        </div>
        {!fixedCategory ? (
          <div>
            <label htmlFor="f-category" className="label">
              القسم
            </label>
            <select id="f-category" name="category" defaultValue={filters.category ?? ""} className="field">
              <option value="">كل الأقسام</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="f-rx" className="label">
            نوع الصرف
          </label>
          <select id="f-rx" name="rx" defaultValue={filters.rx ?? ""} className="field">
            <option value="">الكل</option>
            <option value="otc">بدون وصفة</option>
            <option value="rx">بوصفة طبية فقط</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-form" className="label">
            الشكل الدوائي
          </label>
          <select id="f-form" name="form" defaultValue={filters.form ?? ""} className="field">
            <option value="">كل الأشكال</option>
            {forms.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-sort" className="label">
            الترتيب
          </label>
          <select id="f-sort" name="sort" defaultValue={filters.sort ?? "name"} className="field">
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex min-h-8 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="available" value="1" defaultChecked={filters.available === "1"} className="size-5 accent-brand" />
          المتوفر فقط
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            تطبيق
          </button>
          {hasFilters ? (
            <Link href={basePath} className="btn btn-outline">
              مسح
            </Link>
          ) : null}
        </div>
      </form>

      <section aria-label="نتائج المنتجات" className="min-w-0">
        <p className="hint mb-3" role="status">
          {products.length === 0 ? "لا توجد نتائج" : `${products.length} منتج`}
        </p>
        {products.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-lg font-bold">لم نجد منتجات مطابقة</p>
            <p className="hint mt-2">جرّب كلمة بحث أخرى أو أزل بعض عوامل التصفية. يمكنك أيضًا سؤال الصيدلاني عن البديل المناسب.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href={basePath} className="btn btn-outline">
                عرض الكل
              </Link>
              <Link href="/consultation" className="btn btn-primary">
                اسأل الصيدلاني
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <li key={p.id} className="min-w-0">
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
