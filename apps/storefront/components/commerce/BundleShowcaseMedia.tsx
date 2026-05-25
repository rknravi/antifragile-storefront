"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { GalleryLightbox } from "@/components/commerce/GalleryLightbox";

type Props = {
  images: string[];
  alt: string;
  className?: string;
  size?: "md" | "lg";
};

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

const frameClass = {
  md: "aspect-[16/10] w-full",
  lg: "aspect-[16/10] w-full",
};

const navBtnClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-rays-accent text-rays-white shadow-md transition hover:bg-rays-black md:h-12 md:w-12";

/**
 * Bundle hero + thumbnails. Native img keeps large lifestyle PNGs from stalling
 * the shop page with many parallel `/_next/image` jobs on first load.
 */
export function BundleShowcaseMedia({ images, alt, className = "", size = "lg" }: Props) {
  const slides = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const src = slides[active] ?? slides[0];

  const go = useCallback(
    (dir: -1 | 1) => {
      if (slides.length < 2) return;
      setActive((i) => (i + dir + slides.length) % slides.length);
    },
    [slides.length],
  );

  const stopNav = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openLightbox = (e: MouseEvent) => {
    stopNav(e);
    setLightboxOpen(true);
  };

  if (!src) return null;

  return (
    <div className={className}>
      <div
        className={`relative overflow-hidden bg-rays-cream ${frameClass[size]}`}
        role={slides.length > 1 ? "group" : undefined}
        aria-roledescription={slides.length > 1 ? "carousel" : undefined}
        aria-label={slides.length > 1 ? `${alt} image gallery` : alt}
      >
        <button
          type="button"
          onClick={openLightbox}
          className="group absolute inset-0 flex w-full cursor-zoom-in items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-rays-accent focus-visible:ring-offset-2"
          aria-label={`View ${alt} full screen`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            decoding="async"
            loading="eager"
            draggable={false}
            className="pointer-events-none absolute inset-0 m-auto h-full w-full max-h-full max-w-full object-contain object-center p-1 transition group-hover:opacity-[0.98] sm:p-2"
          />
        </button>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                stopNav(e);
                go(-1);
              }}
              className={`${navBtnClass} left-3 md:left-4`}
              aria-label="Previous bundle image"
            >
              <GalleryChevron direction="left" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                stopNav(e);
                go(1);
              }}
              className={`${navBtnClass} right-3 md:right-4`}
              aria-label="Next bundle image"
            >
              <GalleryChevron direction="right" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t-2 border-rays-black bg-rays-cream/40 p-3">
          {slides.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={(e) => {
                stopNav(e);
                setActive(i);
              }}
              className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white p-0.5 md:h-16 md:w-16 ${
                i === active ? "border-rays-accent opacity-100 shadow-md" : "border-rays-line/60 opacity-70"
              }`}
              aria-label={`View bundle image ${i + 1} of ${slides.length}`}
              aria-current={i === active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="max-h-full max-w-full object-contain object-center"
              />
            </button>
          ))}
        </div>
      )}

      <p className="border-t border-rays-line/50 bg-rays-cream/30 px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-rays-gray">
        Tap image to expand
      </p>

      <GalleryLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={slides}
        index={active}
        onIndexChange={setActive}
        alt={alt}
      />
    </div>
  );
}
