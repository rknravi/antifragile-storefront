"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { ProductBadges } from "./ProductBadges";
import { ProductImage } from "./ProductImage";
import { ProductCategoryPill } from "./ProductCategoryPill";
import { getProductPalette, productDisplayName } from "@/lib/product-palette";
import { productCardImageSrc } from "@/lib/product-images";

function formatPrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({
  product,
  quickAdd,
  onQuickView,
}: {
  product: Product;
  quickAdd?: () => void;
  onQuickView?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const palette = getProductPalette(product);
  const salePrice = formatPrice(product.salePrice);
  const mrp = formatPrice(product.mrp);
  const displayPrice = salePrice ?? mrp;
  const imgSrc = productCardImageSrc(product, hover);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_24px_rgba(30,74,110,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(30,74,110,0.12)]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ boxShadow: hover ? `0 16px 48px ${palette.primary}22` : undefined }}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ background: palette.gradientSoft }}
      >
        <Link href={`/products/${product.slug}`} className="absolute inset-0 flex items-center justify-center p-6">
          {imgSrc ? (
            <ProductImage
              src={imgSrc}
              alt={product.name}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="max-h-full w-auto object-contain transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: palette.gradient }} aria-hidden />
          )}
        </Link>
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          <ProductCategoryPill category={product.category} />
          <ProductBadges badges={product.badges ?? []} accent={palette.primary} />
        </div>
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickView();
            }}
            className="absolute bottom-3 left-3 right-3 z-10 translate-y-2 rounded-full py-2.5 text-xs font-semibold uppercase tracking-wider opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100"
            style={{ backgroundColor: palette.primary, color: palette.textOn }}
          >
            Quick view
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-product-title text-neutral-950 transition group-hover:opacity-80">
            {productDisplayName(product.name)}
          </h3>
        </Link>
        <p className="mt-1.5 text-[13px] font-medium text-neutral-500">{product.size}</p>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-600">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div className="flex items-baseline gap-2">
            {displayPrice ? (
              <span className="text-lg font-semibold" style={{ color: palette.primary }}>
                {displayPrice}
              </span>
            ) : null}
            {salePrice && mrp ? (
              <span className="text-sm text-neutral-400 line-through">{mrp}</span>
            ) : null}
          </div>
          {quickAdd ? (
            <button
              type="button"
              onClick={quickAdd}
              className="rounded-full px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: palette.primary, color: palette.textOn }}
            >
              Add
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
