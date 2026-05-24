"use client";

import type { Product } from "@/lib/product-types";

type UrgencyKind = "few_left" | "low_stock" | "selling_fast" | null;

function urgencyMessage(product: Product): { kind: UrgencyKind; text: string } | null {
  const qty = product.inventoryQuantity;
  const threshold = product.lowStockThreshold ?? 10;
  const isBestseller = product.badges?.includes("Bestseller");

  if (qty <= 0) {
    return { kind: "low_stock", text: "Out of stock — check back soon" };
  }
  if (qty <= 3) {
    return { kind: "few_left", text: "Only a few left — order soon" };
  }
  if (qty <= threshold) {
    return { kind: "low_stock", text: "Selling fast — limited stock left" };
  }
  if (isBestseller || product.badges?.includes("Launch Offer")) {
    return { kind: "selling_fast", text: "Popular right now — selling fast" };
  }
  return null;
}

export function StockUrgency({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "rays";
  accent?: string;
}) {
  const u = urgencyMessage(product);
  if (!u) return null;

  const dot =
    u.kind === "few_left" || u.kind === "low_stock" ? "bg-red-500" : "bg-amber-500";

  const classes =
    variant === "rays"
      ? "text-xs font-bold uppercase tracking-wide text-rays-accent"
      : "text-sm font-medium text-neutral-700";

  return (
    <p className={`mt-4 flex items-center gap-2 ${classes}`} role="status">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
      {u.text}
    </p>
  );
}

/** @deprecated Use StockUrgency on PDP only. */
export function StockCounter(props: Parameters<typeof StockUrgency>[0]) {
  return <StockUrgency {...props} />;
}
