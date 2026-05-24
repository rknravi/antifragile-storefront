"use client";

import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";

/** Sticky cart summary bar (mobile). */
export function StickyCartBar() {
  const { lines, total, openCart } = useCart();
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-black/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur md:hidden">
      <button
        type="button"
        onClick={openCart}
        className="flex w-full items-center justify-between rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
      >
        <span>
          View bag ({count})
        </span>
        <span>
          <Money amount={total} />
        </span>
      </button>
    </div>
  );
}
