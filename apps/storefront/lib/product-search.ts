import type { Product } from "@/lib/product-types";
import { getRoutineTrio } from "@/lib/routine-products";

import {
  getBundleProducts,
  type RoutineBundleId,
} from "@/lib/routine-bundles";

function matchBundleId(query: string): RoutineBundleId | null {
  const t = query.trim().toLowerCase();
  if (/\b(cleanse\s*[&·]\s*seal|cleanse\s+and\s+seal|day\s+bundle|day\s+routine|daily\s+routine|morning\s+bundle)\b/.test(t)) {
    return "cleanse-seal-bundle";
  }
  if (/\b(cleanse\s*[&·]\s*treat|cleanse\s+and\s+treat|night\s+bundle|night\s+routine|evening\s+bundle)\b/.test(t)) {
    return "cleanse-treat-bundle";
  }
  if (/\b(treat\s*[&·]\s*seal|treat\s+and\s+seal|treat\s+seal)\b/.test(t)) return "treat-seal-bundle";
  if (/\b(full\s+ritual|daily\s+bundle|full\s+bundle|complete\s+bundle|all\s+three)\b/.test(t)) {
    return "full-ritual-bundle";
  }
  return null;
}

/** Full AM + PM system — all three SKUs. */
export function isDailyRoutineSearchQuery(query: string): boolean {
  const t = query.trim().toLowerCase();
  if (!t) return false;
  if (matchBundleId(t)) return false;
  if (t === "routine" || t === "routines") return true;
  if (/\bfull\s+routine\b/.test(t)) return true;
  if (/\bcomplete\s+routine\b/.test(t)) return true;
  if (/\broutine\s+bundle\b/.test(t)) return true;
  if (/\bresilience\s+routine\b/.test(t)) return true;
  if (/\bshop\s+(the\s+)?routine\b/.test(t)) return true;
  return false;
}

/** AM stack — cleanse + seal (no renewal serum). */
export function isMorningRoutineSearchQuery(query: string): boolean {
  const t = query.trim().toLowerCase();
  if (!t) return false;
  if (/\b(morning|am)\s+routine\b/.test(t)) return true;
  // "Day routine" is easy to confuse with "daily"; treat as morning when explicit.
  if (/\bday\s+routine\b/.test(t)) return true;
  return false;
}

/** PM stack — cleanse · treat · seal. */
export function isNightRoutineSearchQuery(query: string): boolean {
  const t = query.trim().toLowerCase();
  if (!t) return false;
  return /\b(night|pm|evening)\s+routine\b/.test(t);
}

function routineTrioList(active: Product[]): Product[] {
  const trio = getRoutineTrio(active);
  return [trio.cleanser, trio.serum, trio.moisturizer].filter((p): p is Product => p != null);
}

function morningRoutineList(active: Product[]): Product[] {
  return getBundleProducts(active, "cleanse-seal-bundle");
}

function nightRoutineList(active: Product[]): Product[] {
  return getBundleProducts(active, "cleanse-treat-bundle");
}

/** Popular chips and one-word category searches — avoid cross-matching pairing copy. */
const CATEGORY_SEARCH: Record<string, Product["category"]> = {
  cleanser: "Cleanser",
  cleanse: "Cleanser",
  serum: "Serum",
  moisturizer: "Moisturizer",
  moisturiser: "Moisturizer",
};

function productsForCategoryQuery(term: string, active: Product[]): Product[] | null {
  const cat = CATEGORY_SEARCH[term.trim().toLowerCase()];
  if (!cat) return null;
  return active.filter((p) => p.category === cat);
}

function productSearchHaystack(p: Product): string {
  return [
    p.name,
    p.category,
    p.sku,
    p.shortDescription,
    p.longDescription,
    p.texture,
    p.howItWorks,
    ...p.skinConcerns,
    ...p.skinTypes,
    ...p.usageTime,
    ...p.badges,
    ...p.benefits,
    ...p.ingredients,
  ]
    .join(" ")
    .toLowerCase();
}

function productMatchesTokens(p: Product, tokens: string[]): boolean {
  const hay = productSearchHaystack(p);
  return tokens.every((token) => hay.includes(token));
}

/** Search active catalog products; routine queries return all three core SKUs. */
export function searchCatalogProducts(products: Product[], query: string): Product[] {
  const active = products.filter((p) => p.status === "active");
  const term = query.trim();
  if (!term) return active;

  if (isMorningRoutineSearchQuery(term)) {
    return morningRoutineList(active);
  }
  if (isNightRoutineSearchQuery(term)) {
    return nightRoutineList(active);
  }
  const bundleId = matchBundleId(term);
  if (bundleId) {
    const bundleProducts = getBundleProducts(active, bundleId);
    if (bundleProducts.length) return bundleProducts;
  }

  if (isDailyRoutineSearchQuery(term)) {
    return routineTrioList(active);
  }

  const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return active;

  if (tokens.length === 1) {
    const byCategory = productsForCategoryQuery(tokens[0], active);
    if (byCategory?.length) return byCategory;
  }

  return active.filter((p) => productMatchesTokens(p, tokens));
}
