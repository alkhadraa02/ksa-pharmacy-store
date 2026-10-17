import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { CartLink } from "./cart-link";

const NAV = [
  { href: "/products", label: "كل المنتجات" },
  { href: "/prescription", label: "رفع وصفة" },
  { href: "/consultation", label: "استشارة صيدلاني" },
  { href: "/track", label: "تتبع الطلب" },
];

export function SiteHeader({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-xl font-extrabold text-brand-strong">
          <span aria-hidden="true">⚕️</span>
          {SITE_NAME}
        </Link>
        <form action="/products" method="get" role="search" className="order-last flex w-full min-w-0 gap-2 md:order-none md:max-w-md md:flex-1">
          <label htmlFor="header-search" className="sr-only">
            ابحث عن دواء أو مادة فعالة
          </label>
          <input id="header-search" name="q" type="search" className="field min-w-0" placeholder="ابحث عن دواء أو مادة فعالة" maxLength={80} />
          <button type="submit" className="btn btn-primary shrink-0">
            بحث
          </button>
        </form>
        <div className="ms-auto flex items-center gap-2">
          <CartLink />
        </div>
      </div>
      <nav aria-label="التنقل الرئيسي" className="border-t border-line bg-brand-soft">
        <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-1 px-4 py-1 text-sm font-semibold">
          {categories.map((c) => (
            <li key={c.slug} className="min-w-0">
              <Link href={`/category/${c.slug}`} className="inline-flex min-h-10 items-center rounded-lg px-3 hover:bg-surface">
                {c.name}
              </Link>
            </li>
          ))}
          <li className="hidden shrink-0 self-center text-line md:block" aria-hidden="true">
            |
          </li>
          {NAV.map((n) => (
            <li key={n.href} className="min-w-0">
              <Link href={n.href} className="inline-flex min-h-10 items-center rounded-lg px-3 text-brand-strong hover:bg-surface">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
