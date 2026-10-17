import type { Metadata } from "next";
import { PrescriptionUpload } from "@/components/prescription-upload";

export const metadata: Metadata = {
  title: "رفع وصفة طبية",
  description: "ارفع صورة وصفتك الطبية ليراجعها الصيدلاني ويجهز أدويتك قبل التوصيل إلى باب منزلك.",
  alternates: { canonical: "/prescription" },
  openGraph: { title: "رفع وصفة طبية", description: "ارفع وصفتك ليراجعها الصيدلاني ويجهز أدويتك." },
};

export default function PrescriptionPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-extrabold">رفع وصفة طبية</h1>
      <p className="hint mb-4 mt-1">يراجع الصيدلاني الوصفة، وبعد الموافقة يمكنك طلب الأدوية المرتبطة بها. تُحفظ الملفات بشكل خاص ولا تُعرض للعامة.</p>
      <div className="card p-4">
        <PrescriptionUpload />
      </div>
    </div>
  );
}
