export type PricedLine = { salePrice: number; quantity: number };

export function computeOrderTotals(lines: PricedLine[], coupon: string | null) {
  const subtotal = lines.reduce((s, l) => s + l.salePrice * l.quantity, 0);
  let discount = 0;
  if (coupon) {
    const c = coupon.trim().toUpperCase();
    if (c === "LAUNCH10" || c === "FIRST10") discount = Math.round(subtotal * 0.1);
  }
  const afterDiscount = Math.max(0, subtotal - discount);
  const estimatedTax = Math.round(afterDiscount * 0.05);
  const shippingEstimate = afterDiscount >= 999 ? 0 : 79;
  const total = afterDiscount + estimatedTax + shippingEstimate;
  return { subtotal, discount, afterDiscount, estimatedTax, shippingEstimate, total };
}
