"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3 font-semibold text-brand-strong hover:bg-brand-soft"
      aria-label={ready && count > 0 ? `السلة، ${count} منتج` : "السلة"}
    >
      <span aria-hidden="true">🛒</span>
      <span>السلة</span>
      {ready && count > 0 ? (
        <span className="min-w-6 rounded-full bg-brand px-1.5 text-center text-xs leading-6 text-on-brand" aria-hidden="true">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
