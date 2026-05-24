import type { Product } from "./product-types";
import { computeCartBundles } from "./bundle-cart";
import { computeOrderTotals } from "./pricing";

export type CheckoutItemInput = { slug: string; quantity: number };

export type ResolvedCheckout = {
  lines: { product: Product; quantity: number }[];
  subtotal: number;
  discount: number;
  estimatedTax: number;
  shippingEstimate: number;
  total: number;
};

export function resolveCheckoutFromCatalog(
  catalog: Product[],
  items: CheckoutItemInput[],
  coupon: string | null
): ResolvedCheckout {
  const lines: { product: Product; quantity: number }[] = [];
  for (const row of items) {
    const qty = Math.floor(Number(row.quantity));
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
      throw new Error("Invalid quantity.");
    }
    const product = catalog.find((p) => p.slug === row.slug && p.status === "active");
    if (!product) throw new Error(`Unknown or inactive product: ${row.slug}`);
    if (product.inventoryQuantity < qty) throw new Error(`Insufficient stock for ${product.slug}.`);
    lines.push({ product, quantity: qty });
  }
  if (!lines.length) throw new Error("Cart is empty.");
  const priced = lines.map((l) => ({ salePrice: l.product.salePrice, quantity: l.quantity }));
  const { totalSavings } = computeCartBundles(
    catalog,
    lines.map((l) => ({ slug: l.product.slug, quantity: l.quantity }))
  );
  const { subtotal, discount, estimatedTax, shippingEstimate, total } = computeOrderTotals(
    priced,
    coupon,
    totalSavings
  );
  return { lines, subtotal, discount, estimatedTax, shippingEstimate, total };
}
