import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-xl place-content-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-extrabold">الصفحة غير موجودة</h1>
      <p className="text-muted">ربما تغيّر الرابط أو لم يعد المنتج متاحًا.</p>
      <div className="flex justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          الرئيسية
        </Link>
        <Link href="/products" className="btn btn-outline">
          كل المنتجات
        </Link>
      </div>
    </main>
  );
}
