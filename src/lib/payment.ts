import { randomBytes } from "node:crypto";

export type PaymentMethodId = "COD" | "MOCK";

export type PaymentRequest = {
  orderNumber: string;
  amountHalala: number;
  customerPhone: string;
};

export type PaymentResult = {
  ok: boolean;
  /** Payment state to store on the order. */
  status: "PAID" | "UNPAID";
  reference: string;
  error?: string;
};

/** Every payment integration implements this. No real gateway ships with the project. */
export interface PaymentProvider {
  readonly id: PaymentMethodId;
  readonly label: string;
  charge(request: PaymentRequest): Promise<PaymentResult>;
}

export const cashOnDeliveryProvider: PaymentProvider = {
  id: "COD",
  label: "الدفع عند الاستلام",
  async charge(request) {
    return { ok: true, status: "UNPAID", reference: `COD-${request.orderNumber}` };
  },
};

/** Demo provider: approves any positive amount instantly. For local demos and tests only. */
export const mockPaymentProvider: PaymentProvider = {
  id: "MOCK",
  label: "دفع إلكتروني تجريبي",
  async charge(request) {
    if (!Number.isInteger(request.amountHalala) || request.amountHalala <= 0) {
      return { ok: false, status: "UNPAID", reference: "", error: "مبلغ غير صالح للدفع" };
    }
    return { ok: true, status: "PAID", reference: `MOCK-${randomBytes(5).toString("hex").toUpperCase()}` };
  },
};

export function isMockPaymentEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.ENABLE_MOCK_PAYMENT === "1";
}

export function getPaymentProvider(method: string, env: Record<string, string | undefined> = process.env): PaymentProvider | null {
  if (method === "COD") return cashOnDeliveryProvider;
  if (method === "MOCK" && isMockPaymentEnabled(env)) return mockPaymentProvider;
  return null;
}

export function availablePaymentMethods(env: Record<string, string | undefined> = process.env): { id: PaymentMethodId; label: string }[] {
  const list: { id: PaymentMethodId; label: string }[] = [{ id: "COD", label: cashOnDeliveryProvider.label }];
  if (isMockPaymentEnabled(env)) list.push({ id: "MOCK", label: mockPaymentProvider.label });
  return list;
}
