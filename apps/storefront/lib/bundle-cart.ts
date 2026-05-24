import type { Product } from "@/lib/product-types";
import {
  ROUTINE_BUNDLES,
  bundleCompareAt,
  getBundleProducts,
  type RoutineBundleId,
} from "@/lib/routine-bundles";

export type AppliedCartBundle = {
  id: RoutineBundleId;
  title: string;
  savings: number;
};

export type CartBundleResult = {
  applied: AppliedCartBundle[];
  totalSavings: number;
};

type CartQtyRow = { slug: string; quantity: number };

/**
 * Match complete ritual bundles in the cart (largest sets first, non-overlapping).
 * e.g. one of each SKU → Full ritual (−₹97), not three smaller bundles stacked.
 */
export function computeCartBundles(catalog: Product[], lines: CartQtyRow[]): CartBundleResult {
  const remaining = new Map<string, number>();
  for (const line of lines) {
    const q = Math.max(0, Math.floor(line.quantity));
    if (q > 0) remaining.set(line.slug, (remaining.get(line.slug) ?? 0) + q);
  }

  const bundleOrder = [...ROUTINE_BUNDLES].sort((a, b) => b.categories.length - a.categories.length);
  const applied: AppliedCartBundle[] = [];
  let totalSavings = 0;

  let progress = true;
  while (progress) {
    progress = false;
    for (const meta of bundleOrder) {
      const items = getBundleProducts(catalog, meta.id);
      if (items.length !== meta.categories.length) continue;

      const hasSet = items.every((p) => (remaining.get(p.slug) ?? 0) >= 1);
      if (!hasSet) continue;

      const savings = Math.max(0, bundleCompareAt(items) - meta.bundlePrice);
      for (const p of items) {
        remaining.set(p.slug, (remaining.get(p.slug) ?? 0) - 1);
      }
      applied.push({ id: meta.id, title: meta.title, savings });
      totalSavings += savings;
      progress = true;
      break;
    }
  }

  return { applied, totalSavings };
}
