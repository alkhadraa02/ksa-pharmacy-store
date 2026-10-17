import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "سلة التسوق",
  description: "راجع منتجات سلتك وعدّل الكميات قبل إتمام الطلب من صيدلية الشفاء مع توصيل سريع.",
  alternates: { canonical: "/cart" },
  robots: { index: false },
};

export default function CartPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">سلة التسوق</h1>
      <CartView />
    </>
  );
}
