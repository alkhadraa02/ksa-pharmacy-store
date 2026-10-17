import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { SAUDI_CITIES } from "@/lib/constants";
import { DELIVERY_SLOTS, getDeliveryDays } from "@/lib/delivery";
import { availablePaymentMethods } from "@/lib/payment";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أدخل بيانات التوصيل واختر موعدك وطريقة الدفع لإتمام طلبك من صيدلية الشفاء بكل سهولة.",
  alternates: { canonical: "/checkout" },
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">إتمام الطلب</h1>
      <CheckoutForm
        days={getDeliveryDays()}
        slots={DELIVERY_SLOTS.map((s) => ({ id: s.id, label: s.label }))}
        methods={availablePaymentMethods()}
        cities={[...SAUDI_CITIES]}
      />
    </>
  );
}
