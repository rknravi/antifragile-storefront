"use client";

import { useState } from "react";
import type { Product } from "@/lib/product-types";
import { ProductImage } from "@/components/ProductImage";
import { GalleryLightbox } from "@/components/commerce/GalleryLightbox";
import { getProductPalette } from "@/lib/product-palette";
import { productGalleryImages } from "@/lib/product-images";

function GalleryChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export function ProductGallery({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "rays";
}) {
  const images = productGalleryImages(product);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const palette = getProductPalette(product);
  const src = images[active];
  const rays = variant === "rays";
  const rounded = rays ? "rounded-2xl" : "rounded-3xl";
  const thumbMaxH = rays
    ? "md:max-h-[min(82vh,800px)]"
    : "md:max-h-[min(520px,70vh)]";
  /** Wide frame matches ANTIFRAGILE art (~16:10) so headlines stay visible with object-contain. */
  const mainFrame = rays
    ? "aspect-[16/10] w-full max-h-[min(78vh,760px)] sm:max-h-[min(82vh,800px)]"
    : "aspect-[4/5]";
  const mainPad = rays ? "p-1 sm:p-2" : "p-6 md:p-10";
  const mainFit = rays ? "object-contain object-center" : "object-contain";
  const imageSizes = rays ? "(min-width: 1024px) 58vw, (min-width: 768px) 55vw, 100vw" : "(min-width: 768px) 50vw, 100vw";

  const go = (dir: -1 | 1) => {
    if (images.length < 2) return;
    setActive((i) => (i + dir + images.length) % images.length);
  };

  /** PDP: neutral controls so photography leads; default theme keeps category tint. */
  const navBtnClass = rays
    ? "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-rays-line/80 bg-white/90 text-rays-black shadow-md backdrop-blur-sm transition hover:border-rays-black/25 hover:bg-white md:h-12 md:w-12"
    : "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-lg shadow-md transition hover:scale-105 md:h-12 md:w-12";

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
        <div
          className={`order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden ${thumbMaxH}`}
        >
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden md:h-20 md:w-20 ${rounded} border-2 bg-white ${
                i === active
                  ? rays
                    ? "border-rays-black/70 opacity-100 shadow-md ring-1 ring-rays-black/10"
                    : "opacity-100 shadow-md"
                  : "border-transparent opacity-60"
              }`}
              style={!rays && i === active ? { borderColor: palette.primary } : undefined}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
            >
              <ProductImage src={img} alt="" sizes="80px" className="object-contain object-center" />
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1 order-1 md:order-2">
        <div
          className={`relative overflow-hidden ${rounded} ${rays ? "bg-rays-cream" : "shadow-lg"} ${mainFrame}`}
          style={rays ? undefined : { background: palette.gradientSoft }}
        >
          <button
            type="button"
            className={`group relative flex h-full w-full cursor-zoom-in items-center justify-center overflow-hidden ${mainPad} focus:outline-none focus-visible:ring-2 focus-visible:ring-rays-accent focus-visible:ring-offset-2`}
            onClick={() => setLightboxOpen(true)}
            aria-label={`View ${product.name} full screen`}
          >
            <ProductImage
              src={src}
              alt={product.name}
              sizes={imageSizes}
              priority
              layout={rays ? "fill" : "intrinsic"}
              className={`pointer-events-none transition duration-300 ${mainFit}`}
            />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className={`${navBtnClass} left-3 md:left-4`}
                style={rays ? undefined : { backgroundColor: palette.primary, color: palette.textOn }}
                aria-label="Previous image"
              >
                <GalleryChevron direction="left" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className={`${navBtnClass} right-3 md:right-4`}
                style={rays ? undefined : { backgroundColor: palette.primary, color: palette.textOn }}
                aria-label="Next image"
              >
                <GalleryChevron direction="right" />
              </button>
            </>
          )}
        </div>

        <p className="mt-2 text-center text-xs text-rays-gray">
          Tap image to expand · {active + 1} / {images.length}
        </p>

        <GalleryLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={images}
          index={active}
          onIndexChange={setActive}
          alt={product.name}
          controlStyle={rays ? "neutral" : "brand"}
        />
      </div>
    </div>
  );
}
