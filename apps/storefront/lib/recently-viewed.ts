"use client";

import type { Product } from "@/lib/product-types";

const KEY = "af_recently_viewed_v1";
const MAX = 8;

export function getRecentlyViewedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  const prev = getRecentlyViewedSlugs().filter((s) => s !== slug);
  localStorage.setItem(KEY, JSON.stringify([slug, ...prev].slice(0, MAX)));
}

export function resolveRecentlyViewed(catalog: Product[], slugs: string[]): Product[] {
  return slugs
    .map((slug) => catalog.find((p) => p.slug === slug && p.status === "active"))
    .filter((p): p is Product => Boolean(p));
}
