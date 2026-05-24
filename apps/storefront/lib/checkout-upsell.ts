import type { Product } from "@/lib/product-types";
import { getFreeShippingProgress } from "@/lib/free-shipping";

const RITUAL_CATEGORIES = ["Cleanser", "Serum", "Moisturizer"] as const;

function featuredRank(p: Product): number {
  if (p.badges.includes("Bestseller")) return 3;
  if (p.badges.includes("New") || p.badges.includes("Launch Offer")) return 2;
  return 0;
}

/**
 * Products to suggest at checkout — excludes cart lines, prioritizes free-shipping gap
 * and missing ritual steps.
 */
export function getCheckoutUpsellProducts(
  catalog: Product[],
  cartSlugs: Set<string>,
  qualifyingTotal: number,
  limit = 3
): Product[] {
  const candidates = catalog.filter((p) => p.status === "active" && !cartSlugs.has(p.slug));
  if (!candidates.length) return [];

  const inCart = catalog.filter((p) => cartSlugs.has(p.slug));
  const categoriesInCart = new Set(inCart.map((p) => p.category));
  const missingRitual = RITUAL_CATEGORIES.filter((c) => !categoriesInCart.has(c));

  const { remaining, qualified } = getFreeShippingProgress(qualifyingTotal, inCart.length === 0);

  const scored = candidates.map((p) => {
    let score = featuredRank(p);

    if (missingRitual.includes(p.category as (typeof RITUAL_CATEGORIES)[number])) {
      score += 50;
    }

    if (!qualified && remaining > 0) {
      if (p.salePrice >= remaining && p.salePrice <= remaining + 200) {
        score += 40;
      } else if (p.salePrice <= remaining) {
        score += 25;
      } else {
        score += Math.max(0, 15 - Math.floor((p.salePrice - remaining) / 100));
      }
    }

    return { p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.p.salePrice - b.p.salePrice)
    .map((x) => x.p)
    .slice(0, limit);
}
