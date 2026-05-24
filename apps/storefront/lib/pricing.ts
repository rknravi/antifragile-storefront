export type PricedLine = { salePrice: number; quantity: number };

/** Qualifying amount (after discounts, before tax/shipping) for complimentary shipping. */
export const FREE_SHIPPING_THRESHOLD_INR = 999;

export const STANDARD_SHIPPING_FEE_INR = 79;

/** Accepted promo codes (10% off subtotal). */
export const VALID_COUPON_CODES = ["LAUNCH10", "FIRST10"] as const;

export function normalizeCouponCode(code: string | null | undefined): string | null {
  const c = code?.trim().toUpperCase();
  if (!c) return null;
  return (VALID_COUPON_CODES as readonly string[]).includes(c) ? c : null;
}

export function isValidCouponCode(code: string): boolean {
  return normalizeCouponCode(code) !== null;
}

export function couponHint(): string {
  return VALID_COUPON_CODES.join(" or ");
}

export function computeOrderTotals(
  lines: PricedLine[],
  coupon: string | null,
  bundleDiscount = 0
) {
  const subtotal = lines.reduce((s, l) => s + l.salePrice * l.quantity, 0);
  const bundleSavings = Math.max(0, Math.min(bundleDiscount, subtotal));
  const afterBundle = subtotal - bundleSavings;

  let couponDiscount = 0;
  const normalized = normalizeCouponCode(coupon);
  if (normalized) {
    couponDiscount = Math.round(afterBundle * 0.1);
  }

  const discount = bundleSavings + couponDiscount;
  const afterDiscount = Math.max(0, subtotal - discount);
  const estimatedTax = Math.round(afterDiscount * 0.05);
  const shippingEstimate =
    afterDiscount >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;
  const total = afterDiscount + estimatedTax + shippingEstimate;

  return {
    subtotal,
    bundleDiscount: bundleSavings,
    couponDiscount,
    discount,
    afterDiscount,
    estimatedTax,
    shippingEstimate,
    total,
  };
}
