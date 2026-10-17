import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-brand-strong">{SITE_NAME}</p>
          <p className="hint mt-2">
            الأدوية المصنفة بوصفة طبية لا تُصرف إلا بعد مراجعة الصيدلاني للوصفة. المعلومات في الموقع للتثقيف ولا تغني عن استشارة الطبيب.
          </p>
        </div>
        <nav aria-label="روابط مهمة">
          <p className="font-bold">روابط</p>
          <ul className="mt-2 grid gap-1">
            <li>
              <Link href="/products" className="hover:underline">
                كل المنتجات
              </Link>
            </li>
            <li>
              <Link href="/consultation" className="hover:underline">
                استشارة صيدلاني
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:underline">
                تتبع الطلب
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                دخول الإدارة
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="font-bold">التوصيل والدفع</p>
          <ul className="hint mt-2 grid gap-1">
            <li>توصيل خلال 1–4 أيام بمواعيد تختارها</li>
            <li>توصيل مجاني للطلبات من 200 ر.س</li>
            <li>الدفع عند الاستلام</li>
            <li>الأسعار شاملة ضريبة القيمة المضافة 15%</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
