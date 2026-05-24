"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/product-types";
import { ProductImage } from "@/components/ProductImage";
import { ProductBadges } from "@/components/ProductBadges";
import { ProductCategoryPill } from "@/components/ProductCategoryPill";
import { getProductPalette, productDisplayName } from "@/lib/product-palette";
import { productCardImageSrc } from "@/lib/product-images";
import { themeProductPath } from "@/lib/theme-nav-paths";

function formatPrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function RaysProductCard({
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
  const display = productCardImageSrc(product, hover);
  const sale = formatPrice(product.salePrice);
  const mrp = formatPrice(product.mrp);
  const productHref = themeProductPath("rays", product.slug);

  return (
    <article
      className="group flex h-full flex-col"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl"
        style={{ background: palette.gradientSoft }}
      >
        <Link href={productHref} className="absolute inset-0 flex items-center justify-center p-5">
          {display && (
            <ProductImage
              src={display}
              alt={product.name}
              sizes="33vw"
              layout="intrinsic"
              className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
            />
          )}
        </Link>
        <div className="absolute left-0 top-0 z-10 flex min-h-[4.25rem] flex-col gap-2 p-2">
          <ProductCategoryPill category={product.category} className="!text-[10px]" />
          <ProductBadges badges={product.badges} accent={palette.primary} />
        </div>
        {onQuickView && (
          <button
            type="button"
            onClick={onQuickView}
            className="absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase opacity-0 transition group-hover:opacity-100"
            style={{ backgroundColor: palette.primary, color: palette.textOn }}
          >
            Quick view
          </button>
        )}
      </div>
      <div
        className="mt-4 flex flex-1 flex-col border-t-2 pt-4"
        style={{ borderColor: `${palette.primary}33` }}
      >
        <Link href={productHref} className="block">
          <h3
            className="mt-1 line-clamp-2 min-h-[2.75rem] font-rays text-lg font-bold uppercase leading-tight"
            style={{ color: palette.primary }}
          >
            {productDisplayName(product.name)}
          </h3>
        </Link>
        <div className="mt-2 flex min-h-[1.25rem] flex-wrap items-baseline gap-2 text-sm font-semibold">
          {sale && <span style={{ color: palette.primary }}>{sale}</span>}
          {sale && mrp && <span className="text-rays-gray line-through">{mrp}</span>}
        </div>
        {quickAdd && (
          <button
            type="button"
            onClick={quickAdd}
            className="mt-auto w-full border-2 border-rays-black bg-rays-accent py-2.5 pt-4 text-xs font-bold uppercase tracking-widest text-rays-white transition hover:bg-rays-black hover:text-rays-accent"
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}
