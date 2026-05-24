"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/products";
import type { CategoryPalette } from "@/lib/product-palette";
import type { StoreTheme } from "@/lib/theme-paths";
import { getProductPalette } from "@/lib/product-palette";
import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";
import { StockUrgency } from "@/components/commerce/StockUrgency";

function QtyPill({
  qty,
  setQty,
  palette,
}: {
  qty: number;
  setQty: (n: number) => void;
  palette: CategoryPalette;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full border-2 bg-white"
      style={{ borderColor: palette.primary }}
    >
      <button
        type="button"
        className="px-4 py-3 text-lg leading-none"
        style={{ color: palette.primary }}
        onClick={() => setQty(Math.max(1, qty - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold" style={{ color: palette.primary }}>
        {qty}
      </span>
      <button
        type="button"
        className="px-4 py-3 text-lg leading-none"
        style={{ color: palette.primary }}
        onClick={() => setQty(Math.min(99, qty + 1))}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export function PdpActions({
  product,
  palette: paletteProp,
  theme = "classic",
  cartHref = "/cart",
  checkoutHref = "/checkout",
}: {
  product: Product;
  palette?: CategoryPalette;
  theme?: StoreTheme;
  cartHref?: string;
  checkoutHref?: string;
}) {
  const palette = paletteProp ?? getProductPalette(product);
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.inventoryQuantity <= 0;

  const add = () => {
    if (outOfStock) return;
    addItem(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  };

  const buyNow = () => {
    if (outOfStock) return;
    addItem(product, qty);
    router.push(checkoutHref);
  };

  return (
    <>
      <div className="mt-6 hidden flex-col gap-4 md:flex">
        <div className="flex flex-wrap items-center gap-3">
          <QtyPill qty={qty} setQty={setQty} palette={palette} />
          <button
            type="button"
            onClick={add}
            disabled={outOfStock}
            className="flex-1 rounded-full px-8 py-3.5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:opacity-50 sm:flex-none"
            style={{ backgroundColor: palette.primary, color: palette.textOn }}
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={buyNow}
            disabled={outOfStock}
            className="rounded-full border-2 bg-white px-8 py-3.5 text-sm font-semibold transition hover:bg-neutral-50 disabled:opacity-50"
            style={{ borderColor: palette.primary, color: palette.primary }}
          >
            Buy now
          </button>
        </div>
        <StockUrgency product={product} />
        {added ? (
          <p className="text-sm font-medium text-emerald-700">
            Added to cart.{" "}
            <Link href={cartHref} className="underline">
              View cart
            </Link>
          </p>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <StockUrgency product={product} />
          <div className="flex items-center justify-between gap-3">
            <QtyPill qty={qty} setQty={setQty} palette={palette} />
            <div className="text-right">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="text-lg font-semibold" style={{ color: palette.primary }}>
                <Money amount={product.salePrice * qty} />
              </p>
            </div>
          </div>
          {added ? (
            <p className="text-center text-xs font-medium text-emerald-700">
              Added to cart.{" "}
              <Link href={cartHref} className="underline">
                View cart
              </Link>
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={add}
              disabled={outOfStock}
              className="flex-1 rounded-full py-3 text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: palette.primary, color: palette.textOn }}
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={buyNow}
              disabled={outOfStock}
              className="flex-1 rounded-full border-2 py-3 text-sm font-semibold disabled:opacity-50"
              style={{ borderColor: palette.primary, color: palette.primary }}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
