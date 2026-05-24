"use client";

import type { Product } from "@/lib/product-types";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { productDisplayName } from "@/lib/product-palette";

function packSrc(product: Product): string {
  const primary = productPrimaryImageSrc(product);
  if (primary) return primary;
  return `/products/${product.slug}.svg`;
}

type Props = {
  products: Product[];
  /** Static merged asset from /public/bundles when products unavailable. */
  fallbackSrc?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeHeights = {
  sm: "h-36",
  md: "h-48",
  lg: "h-56 md:h-64",
};

/** Removes white pack-shot boxes on light UI (multiply against page/card white). */
const PACK_IMG_CLASS = "pack-shot-cutout w-auto max-w-full object-contain object-bottom";

/**
 * Side-by-side ANTIFRAGILE pack shots on a transparent canvas.
 * Parent should be white or light for multiply cutout; use .pack-shot-cutout--on-dark on black sections.
 */
export function RoutineBundleImage({ products, fallbackSrc, className = "", size = "md" }: Props) {
  const height = sizeHeights[size];

  if (!products.length && fallbackSrc) {
    return (
      <div className={`flex items-end justify-center bg-transparent px-2 py-2 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fallbackSrc} alt="" className={`pack-shot-cutout w-full object-contain ${height}`} />
      </div>
    );
  }

  if (!products.length) return null;

  const count = products.length;

  return (
    <div
      className={`flex items-end justify-center gap-1 bg-transparent px-2 py-2 sm:gap-3 sm:px-4 ${className}`}
      role="img"
      aria-label={products.map((p) => productDisplayName(p.name)).join(", ")}
    >
      {products.map((p) => (
        <div
          key={p.id}
          className={`flex flex-1 items-end justify-center bg-transparent ${
            count === 2 ? "max-w-[46%]" : count === 3 ? "max-w-[32%]" : "max-w-full"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={packSrc(p)}
            alt={productDisplayName(p.name)}
            className={`${PACK_IMG_CLASS} ${height}`}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
