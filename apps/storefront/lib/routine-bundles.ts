import type { Product } from "@/lib/product-types";
import { getRoutineTrio } from "@/lib/routine-products";

/**
 * Bundle lineup aligned with Cleanse · Treat · Seal:
 * - Cleanse & seal — AM (cleanser + moisturizer)
 * - Cleanse & treat — PM start (cleanser + serum)
 * - Treat & seal — layer duo (serum + moisturizer)
 * - Full ritual — all three
 */
export type RoutineBundleId =
  | "cleanse-seal-bundle"
  | "cleanse-treat-bundle"
  | "treat-seal-bundle"
  | "full-ritual-bundle";

export type RoutineBundleMeta = {
  id: RoutineBundleId;
  title: string;
  subtitle: string;
  imageSrc: string;
  categories: Array<"Cleanser" | "Serum" | "Moisturizer">;
  /** Promotional bundle total (INR). */
  bundlePrice: number;
};

export type RoutineBundlePricing = {
  items: Product[];
  compareAt: number;
  bundlePrice: number;
  savings: number;
};

export const ROUTINE_BUNDLES: RoutineBundleMeta[] = [
  {
    id: "cleanse-seal-bundle",
    title: "Cleanse & seal bundle",
    subtitle: "Morning essentials — Soft Refresh cleanser + Airy Whip moisturizer.",
    imageSrc: "/images/antifragile-cleanse-seal-bundle.png",
    categories: ["Cleanser", "Moisturizer"],
    bundlePrice: 1800,
  },
  {
    id: "cleanse-treat-bundle",
    title: "Cleanse & treat bundle",
    subtitle: "Evening reset — cleanse, then Pre-Shift renewal serum.",
    imageSrc: "/images/antifragile-cleanse-treat-bundle.png",
    categories: ["Cleanser", "Serum"],
    bundlePrice: 2000,
  },
  {
    id: "treat-seal-bundle",
    title: "Treat & seal bundle",
    subtitle: "Pre-Shift serum + Airy Whip moisturizer to lock in hydration.",
    imageSrc: "/bundles/treat-seal-bundle.svg",
    categories: ["Serum", "Moisturizer"],
    bundlePrice: 2425,
  },
  {
    id: "full-ritual-bundle",
    title: "Full ritual bundle",
    subtitle: "Complete resilience trio — cleanse, treat, and seal.",
    imageSrc: "/images/antifragile-full-ritual-bundle.png",
    categories: ["Cleanser", "Serum", "Moisturizer"],
    bundlePrice: 3100,
  },
];

export function getRoutineBundleMeta(id: RoutineBundleId): RoutineBundleMeta | undefined {
  return ROUTINE_BUNDLES.find((b) => b.id === id);
}

export function getBundleProducts(products: Product[], bundleId: RoutineBundleId): Product[] {
  const trio = getRoutineTrio(products);
  const byCategory = {
    Cleanser: trio.cleanser,
    Serum: trio.serum,
    Moisturizer: trio.moisturizer,
  } as const;
  const meta = getRoutineBundleMeta(bundleId);
  if (!meta) return [];
  return meta.categories.map((c) => byCategory[c]).filter((p): p is Product => p != null);
}

/** Sum of individual sale prices (compare-at for bundle cards). */
export function bundleCompareAt(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.salePrice, 0);
}

/** @deprecated Use bundleCompareAt */
export function bundleSubtotal(products: Product[]): number {
  return bundleCompareAt(products);
}

export function getBundlePricing(
  products: Product[],
  bundleId: RoutineBundleId
): RoutineBundlePricing | null {
  const meta = getRoutineBundleMeta(bundleId);
  const items = getBundleProducts(products, bundleId);
  if (!meta || items.length === 0) return null;

  const compareAt = bundleCompareAt(items);
  const bundlePrice = meta.bundlePrice;
  const savings = Math.max(0, compareAt - bundlePrice);

  return { items, compareAt, bundlePrice, savings };
}
