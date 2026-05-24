import type { Product } from "@/lib/product-types";

export const SHOP_SORT_OPTIONS = [
  { value: "featured", label: "featured" },
  { value: "name-asc", label: "name, a-z" },
  { value: "name-desc", label: "name, z-a" },
  { value: "price-asc", label: "price, low to high" },
  { value: "price-desc", label: "price, high to low" },
  { value: "newest", label: "newest first" },
] as const;

export type ShopSortKey = (typeof SHOP_SORT_OPTIONS)[number]["value"];

function featuredRank(p: Product): number {
  if (p.badges.includes("Bestseller")) return 3;
  if (p.badges.includes("New") || p.badges.includes("Launch Offer")) return 2;
  if (p.badges.includes("Bundle")) return 1;
  return 0;
}

function newestRank(p: Product): number {
  let score = 0;
  if (p.badges.includes("New")) score += 100;
  if (p.badges.includes("Launch Offer")) score += 80;
  const idNum = Number.parseInt(p.id.replace(/\D/g, ""), 10);
  if (Number.isFinite(idNum)) score += idNum;
  return score;
}

export function sortShopProducts(products: Product[], sort: ShopSortKey): Product[] {
  const list = [...products];
  switch (sort) {
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }));
    case "price-asc":
      return list.sort((a, b) => a.salePrice - b.salePrice || a.name.localeCompare(b.name));
    case "price-desc":
      return list.sort((a, b) => b.salePrice - a.salePrice || a.name.localeCompare(b.name));
    case "newest":
      return list.sort((a, b) => newestRank(b) - newestRank(a) || a.name.localeCompare(b.name));
    case "featured":
    default:
      return list.sort(
        (a, b) => featuredRank(b) - featuredRank(a) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
  }
}

export function shopSortLabel(key: ShopSortKey): string {
  return SHOP_SORT_OPTIONS.find((o) => o.value === key)?.label ?? key;
}
