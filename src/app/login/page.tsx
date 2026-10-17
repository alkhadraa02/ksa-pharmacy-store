import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "دخول لوحة التحكم",
  description: "تسجيل دخول مشرفي صيدلية الشفاء إلى لوحة إدارة المنتجات والطلبات والوصفات الطبية.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="main" className="mx-auto grid min-h-dvh w-full max-w-md content-center gap-4 px-4 py-10">
      <h1 className="text-center text-2xl font-extrabold text-brand-strong">{SITE_NAME} — لوحة التحكم</h1>
      <LoginForm />
      <p className="text-center text-sm">
        <Link href="/" className="underline">العودة إلى المتجر</Link>
      </p>
    </main>
  );
}
