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

/**
 * Fixed frame for every hero slide — same width/height so rotation does not jump.
 * Sized to the largest desktop hero presentation (600×720).
 */
export const HERO_FIGURE_FRAME =
  "rays-hero-figure-frame flex h-[360px] w-[300px] shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-[520px] sm:w-[440px] lg:h-[720px] lg:w-[600px]";

const HERO_FIGURE_IMG = "h-full w-full object-contain object-center";

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
      <div className="absolute inset-0 bg-gradient-to-r from-rays-black/92 from-[28%] via-rays-black/60 via-[48%] to-rays-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-rays-black/65 via-transparent to-[#FFF6EE]/30" />
    </div>
  );
}

/** Right column — isolated from headline so long titles are never clipped. */
export function RaysHeroProductFigure({ product }: { product: Product }) {
  const src = heroProductSrc(product);
  return <RaysHeroSceneFigure src={src} alt={productDisplayName(product.name)} imageKey={product.id} />;
}

/** Hero slideshow figure — far right, separate from backdrop and copy column. */
export function RaysHeroSceneFigure({
  src,
  alt,
  imageKey,
  style = "scene",
}: {
  src: string;
  alt: string;
  imageKey: string;
  style?: "pack" | "scene";
}) {
  const imgClass = style === "pack" ? `${HERO_FIGURE_IMG} pack-shot-cutout--on-dark` : HERO_FIGURE_IMG;

  return (
    <div className="flex w-full items-center justify-center lg:justify-end">
      <div className={`${HERO_FIGURE_FRAME} rays-hero-product-in`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={imageKey}
          src={src}
          alt={alt}
          className={imgClass}
          draggable={false}
          decoding="async"
        />
      </div>
    </div>
  );
}
