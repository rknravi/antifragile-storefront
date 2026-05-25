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
  /** Primary bundle artwork (lifestyle / lineup). */
  imageSrc: string;
  /** Extra angles for bundle page gallery. */
  gallery?: string[];
  categories: Array<"Cleanser" | "Serum" | "Moisturizer">;
  /** Promotional bundle total (INR). */
  bundlePrice: number;
};

/** Deduped hero + gallery paths for bundle cards and /shop?bundle=1. */
export function bundleGalleryImages(meta: RoutineBundleMeta): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (src?: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    out.push(src);
  };
  push(meta.imageSrc);
  meta.gallery?.forEach(push);
  return out;
}

export type RoutineBundlePricing = {
  items: Product[];
  compareAt: number;
  bundlePrice: number;
  savings: number;
};

const HERO = "/images/hero";

/** Model heroes — filenames match product pair (cleanser-moisturizer = Cleanse & seal, etc.). */
export const BUNDLE_HERO = {
  cleanseSeal: `${HERO}/antifragile-hero-cleanser-moisturizer.png`,
  cleanseTreat: `${HERO}/antifragile-hero-cleanser-serum.png`,
  treatSeal: `${HERO}/antifragile-hero-serum-moisturizer.png`,
  fullRitual: `${HERO}/antifragile-hero-cleanser-moisturizer-serum.png`,
} as const;

/** Hero + lifestyle gallery per bundle id slug (paths under `public/images/`). */
const BUNDLE_ART: Record<
  Exclude<RoutineBundleId, "full-ritual-bundle">,
  { hero: string; gallery: string[] }
> = {
  "cleanse-seal-bundle": {
    hero: BUNDLE_HERO.cleanseSeal,
    gallery: [
      "/images/antifragile-cleanse-seal-bundle-lifestyle-01.png",
      "/images/antifragile-cleanse-seal-bundle-lifestyle-03.png",
      "/images/antifragile-cleanse-seal-bundle-lifestyle-04.png",
    ],
  },
  "cleanse-treat-bundle": {
    hero: BUNDLE_HERO.cleanseTreat,
    gallery: [
      "/images/antifragile-cleanse-treat-bundle-lifestyle-01.png",
      "/images/antifragile-cleanse-treat-bundle-lifestyle-03.png",
    ],
  },
  "treat-seal-bundle": {
    hero: BUNDLE_HERO.treatSeal,
    gallery: [
      "/images/antifragile-treat-seal-bundle-lifestyle-01.png",
      "/images/antifragile-treat-seal-bundle-lifestyle-03.png",
    ],
  },
};

export const ROUTINE_BUNDLES: RoutineBundleMeta[] = [
  {
    id: "cleanse-seal-bundle",
    title: "Cleanse & seal bundle",
    subtitle: "Morning essentials — Soft Refresh cleanser + Airy Whip moisturizer.",
    imageSrc: BUNDLE_ART["cleanse-seal-bundle"].hero,
    gallery: [...BUNDLE_ART["cleanse-seal-bundle"].gallery],
    categories: ["Cleanser", "Moisturizer"],
    bundlePrice: 1800,
  },
  {
    id: "cleanse-treat-bundle",
    title: "Cleanse & treat bundle",
    subtitle: "Evening reset — cleanse, then Pre-Shift renewal serum.",
    imageSrc: BUNDLE_ART["cleanse-treat-bundle"].hero,
    gallery: [...BUNDLE_ART["cleanse-treat-bundle"].gallery],
    categories: ["Cleanser", "Serum"],
    bundlePrice: 2000,
  },
  {
    id: "treat-seal-bundle",
    title: "Treat & seal bundle",
    subtitle: "Pre-Shift serum + Airy Whip moisturizer to lock in hydration.",
    imageSrc: BUNDLE_ART["treat-seal-bundle"].hero,
    gallery: [...BUNDLE_ART["treat-seal-bundle"].gallery],
    categories: ["Serum", "Moisturizer"],
    bundlePrice: 2425,
  },
  {
    id: "full-ritual-bundle",
    title: "Full ritual bundle",
    subtitle: "Complete resilience trio — cleanse, treat, and seal.",
    imageSrc: BUNDLE_HERO.fullRitual,
    gallery: [
      "/images/antifragile-full-ritual-bundle-lifestyle-02.png",
      "/images/antifragile-full-ritual-bundle-lifestyle-03.png",
      "/images/antifragile-full-ritual-bundle-lineup-02.png",
    ],
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
