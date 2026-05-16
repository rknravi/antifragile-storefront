"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";

export function PdpActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  };

  const buyNow = () => {
    addItem(product, qty);
    router.push("/checkout");
  };

  return (
    <>
      <div className="mt-6 hidden flex-wrap items-center gap-3 md:flex">
        <label className="text-sm text-neutral-600" htmlFor="qty">
          Qty
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
          className="w-20 rounded-xl border border-neutral-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={buyNow}
          className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-500"
        >
          Buy now
        </button>
        {added ? (
          <p className="w-full text-sm font-medium text-emerald-700">
            Added to cart. <Link href="/cart" className="underline">View cart</Link>
          </p>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-neutral-200 text-lg"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-neutral-200 text-lg"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="text-lg font-semibold">
                <Money amount={product.salePrice * qty} />
              </p>
            </div>
          </div>
          {added ? (
            <p className="text-center text-xs font-medium text-emerald-700">
              Added to cart. <Link href="/cart" className="underline">View cart</Link>
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={add}
              className="flex-1 rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="flex-1 rounded-full border border-neutral-300 py-2.5 text-sm font-semibold"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
