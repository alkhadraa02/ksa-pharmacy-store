import type { Metadata } from "next";
import { ConsultationForm } from "@/components/consultation-form";
import { CONSULTATION_TOPICS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "استشارة صيدلاني",
  description: "اطلب استشارة من صيدلاني مرخّص حول الأدوية والجرعات والتداخلات الدوائية وسيتواصل معك بسرعة.",
  alternates: { canonical: "/consultation" },
  openGraph: { title: "استشارة صيدلاني", description: "اطلب استشارة من صيدلاني مرخّص." },
};

export default function ConsultationPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-extrabold">استشارة صيدلاني</h1>
      <p className="hint mb-4 mt-1">اكتب استفسارك وسيتصل بك أحد الصيادلة. في الحالات الطارئة راجع أقرب مستشفى أو اتصل بالإسعاف 997.</p>
      <ConsultationForm topics={CONSULTATION_TOPICS} />
    </div>
  );
}
