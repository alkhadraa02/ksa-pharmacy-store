"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function AddToCartButton({ productId, maxQuantity, withQuantity = false }: { productId: string; maxQuantity: number; withQuantity?: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const max = Math.max(1, Math.min(maxQuantity, 20));

  function onAdd() {
    add(productId, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {withQuantity ? (
        <div>
          <label htmlFor={`qty-${productId}`} className="sr-only">
            الكمية
          </label>
          <select id={`qty-${productId}`} className="field w-24" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <button type="button" className="btn btn-primary" onClick={onAdd}>
        أضف إلى السلة
      </button>
      <span role="status" className="text-sm font-semibold text-ok">
        {added ? "تمت الإضافة ✓" : ""}
      </span>
    </div>
  );
}
