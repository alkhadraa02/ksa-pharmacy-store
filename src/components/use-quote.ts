"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "./cart-provider";

export type Quote = {
  lines: {
    productId: string;
    slug: string;
    name: string;
    quantity: number;
    priceHalala: number;
    requiresPrescription: boolean;
    available: boolean;
    stock: number;
  }[];
  totals: { subtotalHalala: number; deliveryFeeHalala: number; totalHalala: number; vatHalala: number; netHalala: number };
  needsPrescription: boolean;
};

/** Fetches a server-side price quote whenever the cart contents change. */
export function useQuote(items: CartItem[], ready: boolean) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const key = JSON.stringify(items);

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) {
      setQuote(null);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: key, signal: ctrl.signal })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error ?? "تعذّر تحديث السلة");
        setQuote(body as Quote);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || "تعذّر تحديث السلة");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  return { quote, loading, error };
}
