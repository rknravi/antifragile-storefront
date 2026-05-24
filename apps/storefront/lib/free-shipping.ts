import { FREE_SHIPPING_THRESHOLD_INR } from "@/lib/pricing";

export type FreeShippingProgress = {
  threshold: number;
  /** Cart value counted toward free shipping (after bundle/coupon discounts). */
  qualifyingTotal: number;
  remaining: number;
  progress: number;
  qualified: boolean;
  isEmpty: boolean;
};

export function getFreeShippingProgress(
  qualifyingTotal: number,
  isEmpty: boolean
): FreeShippingProgress {
  const threshold = FREE_SHIPPING_THRESHOLD_INR;
  const amount = Math.max(0, qualifyingTotal);
  const qualified = !isEmpty && amount >= threshold;
  const remaining = qualified ? 0 : Math.max(0, threshold - amount);
  const progress = isEmpty ? 0 : Math.min(100, Math.round((amount / threshold) * 100));

  return {
    threshold,
    qualifyingTotal: amount,
    remaining,
    progress,
    qualified,
    isEmpty,
  };
}
