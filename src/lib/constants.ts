export const SITE_NAME = "صيدلية الشفاء";
export const SITE_TAGLINE = "صيدلية إلكترونية موثوقة بتوصيل سريع داخل المملكة";

export const CONSULTATION_TOPICS = [
  "استفسار عن دواء",
  "الجرعات وطريقة الاستخدام",
  "التداخلات الدوائية",
  "الحمل والرضاعة",
  "الأم والطفل",
  "العناية بالبشرة",
  "أخرى",
] as const;

export const SAUDI_CITIES = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الظهران",
  "الطائف",
  "بريدة",
  "تبوك",
  "أبها",
  "خميس مشيط",
  "حائل",
  "جازان",
  "نجران",
  "الأحساء",
] as const;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3113").replace(/\/$/, "");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
