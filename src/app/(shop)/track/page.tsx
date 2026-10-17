import type { Metadata } from "next";
import { TrackForm } from "@/components/track-form";
import { DELIVERY_SLOTS } from "@/lib/delivery";

export const metadata: Metadata = {
  title: "تتبع الطلب",
  description: "تابع حالة طلبك من صيدلية الشفاء خطوة بخطوة باستخدام رقم الطلب ورقم الجوال المسجل.",
  alternates: { canonical: "/track" },
  openGraph: { title: "تتبع الطلب", description: "تابع حالة طلبك خطوة بخطوة." },
};

export default function TrackPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">تتبع الطلب</h1>
      <TrackForm slots={DELIVERY_SLOTS.map((s) => ({ id: s.id, label: s.label }))} />
    </>
  );
}
