export type { Product, ProductBadge } from "./product-types";

import type { Product } from "./product-types";

export function getProductBySlug(catalog: Product[], slug: string): Product | undefined {
  return catalog.find((p) => p.slug === slug && p.status === "active");
}

export function getRelatedProducts(catalog: Product[], slug: string, limit = 3): Product[] {
  return catalog.filter((p) => p.slug !== slug && p.status === "active").slice(0, limit);
}
