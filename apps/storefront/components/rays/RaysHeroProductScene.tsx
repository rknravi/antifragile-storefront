"use client";

import Image from "next/image";
import type { Product } from "@/lib/product-types";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { productDisplayName } from "@/lib/product-palette";
import { brandMarketing } from "@/lib/brand-images";

/** Branded pack shot; SVG placeholder when PNG not on disk yet. */
export function heroProductSrc(product: Product): string {
  const primary = productPrimaryImageSrc(product);
  if (primary) return primary;
  return `/products/${product.slug}.svg`;
}

/** Knock out white pack-shot backgrounds so only the bottle/tube shows. */
const HERO_PRODUCT_IMG_CLASS =
  "pack-shot-cutout--on-dark max-h-[min(42vh,440px)] w-auto max-w-full object-contain object-bottom sm:max-h-[min(48vh,480px)] lg:max-h-[min(52vh,500px)]";

/** Scenic background only — product is laid out in the hero grid beside copy. */
export function RaysHeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#FFF6EE]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F2] via-[#FFE8D6] to-[#FFCFB0]" />
      <Image
        src={brandMarketing.heroAtmosphere}
        alt=""
        fill
        className="object-cover opacity-[0.4] mix-blend-multiply"
        sizes="100vw"
        priority
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-r from-rays-black/90 via-rays-black/55 to-rays-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-rays-black/65 via-transparent to-[#FFF6EE]/30" />
    </div>
  );
}

/** Right column — isolated from headline so long titles are never clipped. */
export function RaysHeroProductFigure({ product }: { product: Product }) {
  const src = heroProductSrc(product);
  return (
    <div className="flex w-full items-end justify-center lg:justify-end">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={product.id}
        src={src}
        alt={productDisplayName(product.name)}
        className={`${HERO_PRODUCT_IMG_CLASS} rays-hero-product-in`}
        draggable={false}
      />
    </div>
  );
}
