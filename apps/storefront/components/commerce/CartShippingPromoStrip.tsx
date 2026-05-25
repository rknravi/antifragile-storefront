"use client";

import { useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { getFreeShippingProgress, showShippingPromoStrip } from "@/lib/free-shipping";
import { FreeShippingProgress } from "@/components/commerce/FreeShippingProgress";
import { CartUpsellSuggestions } from "@/components/commerce/CartUpsellSuggestions";

type Props = {
  variant: "rays" | "classic";
  shopHref: string;
  onShopClick?: () => void;
  upsellLayout?: "drawer" | "checkout";
  /** Drawer: full-width orange band; cart page: inside neutral card */
  surface?: "drawer" | "page";
};

/**
 * Free-shipping progress + upsells. Hidden after threshold is met so bag space goes to line items.
 */
export function CartShippingPromoStrip({
  variant,
  shopHref,
  onShopClick,
  upsellLayout = "drawer",
  surface = "drawer",
}: Props) {
  const { lines, subtotal, discount } = useCart();
  const rays = variant === "rays";

  const shipping = useMemo(() => {
    const qualifyingTotal = Math.max(0, subtotal - discount);
    return getFreeShippingProgress(qualifyingTotal, lines.length === 0);
  }, [lines.length, subtotal, discount]);

  if (!showShippingPromoStrip(shipping)) return null;

  const shell =
    surface === "drawer"
      ? rays
        ? "border-b border-rays-line bg-rays-accent px-5 py-5 text-rays-white"
        : "border-b border-black/5 bg-neutral-50/80 px-5 py-5"
      : rays
        ? "mt-8 rounded-2xl border border-rays-line bg-rays-white px-6 py-8"
        : "mt-8 rounded-2xl border border-black/5 bg-neutral-50 px-6 py-8";

  return (
    <div className={shell}>
      <FreeShippingProgress
        variant={variant}
        shopHref={shopHref}
        onShopClick={onShopClick}
        align="left"
        onAccentBackground={surface === "drawer" && rays}
      />
      <CartUpsellSuggestions theme={variant} layout={upsellLayout} />
    </div>
  );
}
