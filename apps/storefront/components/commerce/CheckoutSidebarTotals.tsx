"use client";

import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";

type Props = {
  variant?: "rays" | "classic";
};

export function CheckoutSidebarTotals({ variant = "classic" }: Props) {
  const {
    lines,
    subtotal,
    bundleDiscount,
    couponDiscount,
    estimatedTax,
    shippingEstimate,
    giftWrapFee,
    giftWrap,
    total,
  } = useCart();

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const muted = variant === "rays" ? "text-rays-gray" : "text-neutral-600";

  return (
    <div className="space-y-2 border-t border-black/10 pt-4 text-sm">
      <div className="flex justify-between gap-4">
        <span className={muted}>
          Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <Money amount={subtotal} />
      </div>
      {bundleDiscount > 0 ? (
        <div className="flex justify-between gap-4 text-emerald-800">
          <span>Bundle savings</span>
          <span>
            −<Money amount={bundleDiscount} />
          </span>
        </div>
      ) : null}
      {couponDiscount > 0 ? (
        <div className="flex justify-between gap-4 text-emerald-800">
          <span>Promo discount</span>
          <span>
            −<Money amount={couponDiscount} />
          </span>
        </div>
      ) : null}
      {estimatedTax > 0 ? (
        <div className="flex justify-between gap-4">
          <span className={muted}>Tax estimate</span>
          <Money amount={estimatedTax} />
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <span className={`${muted} flex items-center gap-1`}>
          Shipping
        </span>
        {shippingEstimate === 0 ? (
          <span className="font-semibold text-emerald-800">FREE</span>
        ) : (
          <Money amount={shippingEstimate} />
        )}
      </div>
      {giftWrap ? (
        <div className="flex justify-between gap-4">
          <span className={muted}>Gift wrap</span>
          <Money amount={giftWrapFee} />
        </div>
      ) : null}
      <div className="flex justify-between gap-4 border-t border-black/10 pt-3 text-base font-semibold text-neutral-900">
        <span>Total</span>
        <span>
          <span className="mr-1 text-xs font-normal text-neutral-500">INR</span>
          <Money amount={total} />
        </span>
      </div>
    </div>
  );
}
