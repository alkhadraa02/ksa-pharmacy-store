import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/dashboard-actions";
import { SITE_NAME } from "@/lib/constants";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: "%s | لوحة التحكم" },
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/dashboard", label: "نظرة عامة" },
  { href: "/dashboard/products", label: "المنتجات" },
  { href: "/dashboard/orders", label: "الطلبات" },
  { href: "/dashboard/prescriptions", label: "الوصفات" },
  { href: "/dashboard/customers", label: "العملاء" },
  { href: "/dashboard/consultations", label: "الاستشارات" },
  { href: "/dashboard/reports", label: "تقرير المبيعات" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2">
          <Link href="/dashboard" className="min-h-11 content-center text-lg font-extrabold text-brand-strong">
            {SITE_NAME} · الإدارة
          </Link>
          <div className="ms-auto flex min-w-0 items-center gap-2">
            <span className="hint hidden truncate sm:inline" dir="ltr">{admin.email}</span>
            <Link href="/" className="btn btn-outline btn-sm">المتجر</Link>
            <LogoutButton />
          </div>
        </div>
        <nav aria-label="أقسام لوحة التحكم" className="border-t border-line bg-brand-soft">
          <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1 text-sm font-semibold">
            {LINKS.map((l) => (
              <li key={l.href} className="shrink-0">
                <Link href={l.href} className="inline-flex min-h-10 items-center rounded-lg px-3 hover:bg-surface">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
    </>
  );
}
