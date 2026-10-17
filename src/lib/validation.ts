import { z } from "zod";
import { CONSULTATION_TOPICS } from "./constants";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** Normalises Saudi mobile numbers to the local 05xxxxxxxx form. */
export function normalizePhone(input: string): string {
  let v = normalizeDigits(input).replace(/[\s\-().]/g, "");
  if (v.startsWith("+966")) v = "0" + v.slice(4);
  else if (v.startsWith("00966")) v = "0" + v.slice(5);
  else if (v.startsWith("966")) v = "0" + v.slice(3);
  else if (/^5\d{8}$/.test(v)) v = "0" + v;
  return v;
}

export const phoneSchema = z
  .string("رقم الجوال مطلوب")
  .trim()
  .transform(normalizePhone)
  .refine((v) => /^05\d{8}$/.test(v), "رقم الجوال غير صحيح (مثال: 0555555555)");

export const orderItemSchema = z.object({
  productId: z.string().min(1).max(60),
  quantity: z.number("الكمية غير صحيحة").int("الكمية غير صحيحة").min(1, "الكمية غير صحيحة").max(20, "الحد الأقصى 20 لكل صنف"),
});

export const orderInputSchema = z.object({
  name: z.string("الاسم مطلوب").trim().min(2, "الاسم قصير جدًا").max(80, "الاسم طويل جدًا"),
  phone: phoneSchema,
  city: z.string("المدينة مطلوبة").trim().min(2, "المدينة مطلوبة").max(60),
  address: z.string("العنوان مطلوب").trim().min(5, "اكتب عنوانًا تفصيليًا").max(300),
  notes: z.string().trim().max(300, "الملاحظات طويلة جدًا").default(""),
  deliveryDate: z.string("موعد التوصيل مطلوب").regex(/^\d{4}-\d{2}-\d{2}$/, "موعد التوصيل غير صحيح"),
  deliverySlot: z.string("فترة التوصيل مطلوبة").min(1).max(20),
  paymentMethod: z.enum(["COD", "MOCK"], "طريقة الدفع غير صحيحة"),
  prescriptionId: z.string().trim().max(60).optional(),
  items: z.array(orderItemSchema).min(1, "السلة فارغة").max(40, "عدد الأصناف كبير"),
});
export type OrderInput = z.infer<typeof orderInputSchema>;

export const quoteSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(40),
});

export const consultationSchema = z.object({
  name: z.string("الاسم مطلوب").trim().min(2, "الاسم قصير جدًا").max(80),
  phone: phoneSchema,
  topic: z.enum(CONSULTATION_TOPICS, "اختر موضوع الاستشارة"),
  message: z.string("اكتب استفسارك").trim().min(10, "اكتب استفسارك بوضوح (10 أحرف على الأقل)").max(1000, "الرسالة طويلة جدًا"),
});

export const prescriptionFieldsSchema = z.object({
  name: z.string("الاسم مطلوب").trim().min(2, "الاسم قصير جدًا").max(80),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: z.string("البريد الإلكتروني مطلوب").trim().toLowerCase().email("البريد الإلكتروني غير صحيح").max(120),
  password: z.string("كلمة المرور مطلوبة").min(1, "كلمة المرور مطلوبة").max(200),
});

export const productSchema = z.object({
  name: z.string("اسم المنتج مطلوب").trim().min(2, "اسم المنتج قصير").max(120),
  brand: z.string().trim().max(80).default(""),
  description: z.string().trim().max(2000).default(""),
  activeIngredient: z.string().trim().max(160).default(""),
  dosageForm: z.string().trim().max(60).default(""),
  strength: z.string().trim().max(60).default(""),
  categoryId: z.string("اختر القسم").min(1, "اختر القسم"),
  requiresPrescription: z.boolean(),
  active: z.boolean(),
  price: z.number("السعر غير صحيح").min(0.01, "السعر غير صحيح").max(100000, "السعر كبير جدًا"),
  stock: z.number("المخزون غير صحيح").int("المخزون غير صحيح").min(0, "المخزون غير صحيح").max(1_000_000),
  lowStockThreshold: z.number().int().min(0).max(100000),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ الصلاحية غير صحيح").or(z.literal("")),
});
export type ProductInput = z.infer<typeof productSchema>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "بيانات غير صحيحة";
}

export function slugify(input: string): string {
  const base = normalizeDigits(input)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, 80) || "product";
}
