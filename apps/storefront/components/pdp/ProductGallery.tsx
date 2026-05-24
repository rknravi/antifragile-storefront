"use client";

import { useState } from "react";
import type { Product } from "@/lib/product-types";
import { ProductImage } from "@/components/ProductImage";
import { getProductPalette } from "@/lib/product-palette";
import { productGalleryImages } from "@/lib/product-images";

export function ProductGallery({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "rays";
}) {
  const images = productGalleryImages(product);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const palette = getProductPalette(product);
  const src = images[active];
  const rounded = "rounded-3xl";

  const go = (dir: -1 | 1) => {
    if (images.length < 2) return;
    setActive((i) => (i + dir + images.length) % images.length);
  };

  if (!src) {
    return (
      <div
        className={`relative aspect-[4/5] ${rounded}`}
        style={{ background: palette.gradientSoft }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-5">
      {images.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:max-h-[min(520px,70vh)] md:flex-col md:overflow-y-auto md:overflow-x-hidden">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden md:h-20 md:w-20 ${rounded} border-2 bg-white/80 ${
                i === active ? "opacity-100 shadow-md" : "border-transparent opacity-60"
              }`}
              style={i === active ? { borderColor: palette.primary } : undefined}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
            >
              <ProductImage src={img} alt="" sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1 order-1 md:order-2">
        <button
          type="button"
          className="group relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-3xl p-6 shadow-lg md:p-10"
          style={{ background: palette.gradientSoft }}
          onClick={() => setZoom((z) => !z)}
          aria-label={zoom ? "Zoom out" : "Zoom in"}
        >
          <ProductImage
            src={src}
            alt={product.name}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            layout="intrinsic"
            className={`object-contain transition duration-300 ${
              zoom ? "scale-150" : "group-hover:scale-[1.03]"
            }`}
          />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-lg shadow-md transition hover:scale-105 md:left-4"
              style={{ backgroundColor: palette.primary, color: palette.textOn }}
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-lg shadow-md transition hover:scale-105 md:right-4"
              style={{ backgroundColor: palette.primary, color: palette.textOn }}
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}

        <p className="mt-2 text-center text-xs text-neutral-500">
          Tap image to zoom · {active + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}
