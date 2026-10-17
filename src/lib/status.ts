export const ORDER_STATUSES = ["PENDING_RX", "NEW", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_RX: "بانتظار مراجعة الوصفة",
  NEW: "طلب جديد",
  PREPARING: "قيد التجهيز",
  OUT_FOR_DELIVERY: "خرج للتوصيل",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_RX: ["CANCELLED"],
  NEW: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: string, to: string): boolean {
  const allowed = ORDER_TRANSITIONS[from as OrderStatus];
  return !!allowed && allowed.includes(to as OrderStatus);
}

export const RX_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const RX_STATUS_LABEL: Record<string, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "مقبولة",
  REJECTED: "مرفوضة",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "الدفع عند الاستلام",
  MOCK: "دفع إلكتروني تجريبي",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: "غير مدفوع",
  PAID: "مدفوع",
};

export const CONSULTATION_STATUS_LABEL: Record<string, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  CLOSED: "مغلق",
};
