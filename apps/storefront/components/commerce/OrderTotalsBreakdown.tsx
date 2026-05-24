"use client";

import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";

type Props = {
  variant?: "classic" | "rays";
  className?: string;
};

export function OrderTotalsBreakdown({ variant = "rays", className = "" }: Props) {
  const {
    subtotal,
    bundleDiscount,
    couponDiscount,
    appliedBundles,
    estimatedTax,
    shippingEstimate,
    giftWrap,
    giftWrapFee,
    total,
  } = useCart();

  const row = variant === "rays" ? "flex justify-between text-sm gap-4" : "flex justify-between text-sm gap-4";
  const muted = variant === "rays" ? "text-rays-gray" : "text-neutral-600";
  const discountClass = variant === "rays" ? "text-rays-accent font-semibold" : "text-emerald-800";

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={row}>
        <span className={muted}>Subtotal</span>
        <Money amount={subtotal} />
      </div>
      {bundleDiscount > 0 && (
        <div className={row}>
          <span className={`${discountClass} text-left`}>
            Bundle discount
            {appliedBundles.length === 1 && (
              <span className="mt-0.5 block text-xs font-normal normal-case text-rays-gray">
                {appliedBundles[0].title}
              </span>
            )}
            {appliedBundles.length > 1 && (
              <span className="mt-0.5 block text-xs font-normal normal-case text-rays-gray">
                {appliedBundles.length} bundles applied
              </span>
            )}
          </span>
          <span className={discountClass}>
            −<Money amount={bundleDiscount} />
          </span>
        </div>
      )}
      {couponDiscount > 0 && (
        <div className={row}>
          <span className={discountClass}>Promo discount</span>
          <span className={discountClass}>
            −<Money amount={couponDiscount} />
          </span>
        </div>
      )}
      <div className={row}>
        <span className={muted}>Tax estimate</span>
        <Money amount={estimatedTax} />
      </div>
      <div className={row}>
        <span className={muted}>Shipping estimate</span>
        {shippingEstimate === 0 ? (
          <span className={variant === "rays" ? "font-bold text-rays-accent" : "font-medium text-emerald-800"}>
            FREE
          </span>
        ) : (
          <Money amount={shippingEstimate} />
        )}
      </div>
      {giftWrap && (
        <div className={row}>
          <span className={muted}>Gift wrap</span>
          <Money amount={giftWrapFee} />
        </div>
      )}
      <div
        className={`flex justify-between border-t pt-2 font-semibold ${
          variant === "rays" ? "border-rays-line text-rays-black" : "border-black/10 text-neutral-900"
        }`}
      >
        <span>Estimated total</span>
        <Money amount={total} />
      </div>
    </div>
  );
}
