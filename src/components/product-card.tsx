import Link from "next/link";
import { formatSar } from "@/lib/format";
import { isSellable } from "@/lib/inventory";
import { AddToCartButton } from "./add-to-cart-button";
import { RxBadge } from "./rx-badge";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  requiresPrescription: boolean;
  priceHalala: number;
  stock: number;
  active: boolean;
  expiryDate: Date | null;
  category?: { name: string };
};

export function ProductCard({ product }: { product: CardProduct }) {
  const sellable = isSellable(product);
  return (
    <article className="card flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <RxBadge requiresPrescription={product.requiresPrescription} />
        {product.category ? <span className="hint truncate">{product.category.name}</span> : null}
      </div>
      <h3 className="min-w-0 text-base font-bold leading-snug">
        <Link href={`/products/${product.slug}`} className="hover:text-brand-strong hover:underline">
          {product.name}
        </Link>
      </h3>
      <dl className="hint grid gap-0.5">
        {product.brand ? (
          <div className="flex gap-1">
            <dt>الماركة:</dt>
            <dd className="truncate">{product.brand}</dd>
          </div>
        ) : null}
        {product.activeIngredient && product.activeIngredient !== "—" ? (
          <div className="flex gap-1">
            <dt>المادة الفعالة:</dt>
            <dd className="truncate">{product.activeIngredient}</dd>
          </div>
        ) : null}
        <div className="flex gap-1">
          <dt>الشكل:</dt>
          <dd className="truncate">
            {product.dosageForm}
            {product.strength && product.strength !== "—" ? ` · ${product.strength}` : ""}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-lg font-bold text-brand-strong">{formatSar(product.priceHalala)}</p>
        {sellable ? <AddToCartButton productId={product.id} maxQuantity={product.stock} /> : <span className="badge badge-warn">غير متوفر حاليًا</span>}
      </div>
    </article>
  );
}
