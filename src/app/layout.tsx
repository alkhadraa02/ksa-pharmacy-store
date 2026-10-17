import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | صيدلية إلكترونية في السعودية`, template: `%s | ${SITE_NAME}` },
  description: "اطلب أدويتك وفيتامينات الأم والطفل ومنتجات العناية بالبشرة والأجهزة الطبية من صيدلية إلكترونية موثوقة مع توصيل سريع داخل المملكة.",
  openGraph: { type: "website", locale: "ar_SA", siteName: SITE_NAME },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b6b61",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a href="#main" className="skip-link">
          تخطَّ إلى المحتوى
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
