/** All money is stored as integer halalas (1 SAR = 100 halalas). Prices are VAT-inclusive. */
export const VAT_RATE_PERCENT = 15;
export const DELIVERY_FEE_HALALA = 2500;
export const FREE_DELIVERY_THRESHOLD_HALALA = 20000;

/** VAT contained in a VAT-inclusive gross amount. */
export function vatFromGross(grossHalala: number): number {
  return Math.round((grossHalala * VAT_RATE_PERCENT) / (100 + VAT_RATE_PERCENT));
}

export type PricedLine = { priceHalala: number; quantity: number };

export type Totals = {
  subtotalHalala: number;
  deliveryFeeHalala: number;
  totalHalala: number;
  vatHalala: number;
  netHalala: number;
};

export function computeTotals(lines: PricedLine[]): Totals {
  const subtotalHalala = lines.reduce((s, l) => s + l.priceHalala * l.quantity, 0);
  const deliveryFeeHalala =
    subtotalHalala === 0 || subtotalHalala >= FREE_DELIVERY_THRESHOLD_HALALA ? 0 : DELIVERY_FEE_HALALA;
  const totalHalala = subtotalHalala + deliveryFeeHalala;
  const vatHalala = vatFromGross(totalHalala);
  return { subtotalHalala, deliveryFeeHalala, totalHalala, vatHalala, netHalala: totalHalala - vatHalala };
}
