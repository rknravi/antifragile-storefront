"use client";

import { useCallback, useEffect } from "react";

type ControlStyle = "brand" | "neutral";

type Props = {
  open: boolean;
  onClose: () => void;
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  alt: string;
  /** Orange controls on bundles; frosted neutral on PDP. */
  controlStyle?: ControlStyle;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6"
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

function controlClasses(style: ControlStyle) {
  if (style === "neutral") {
    return {
      nav: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rays-line/80 bg-white/90 text-rays-black shadow-lg backdrop-blur-sm transition hover:border-rays-black/25 hover:bg-white md:h-14 md:w-14",
      dotActive: "h-2.5 w-2.5 bg-rays-black",
      dotIdle: "h-2 w-2 bg-rays-black/25 hover:bg-rays-black/40",
    };
  }
  return {
    nav: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rays-accent text-rays-white shadow-lg transition hover:bg-rays-black md:h-14 md:w-14",
    dotActive: "h-2.5 w-2.5 bg-rays-accent",
    dotIdle: "h-2 w-2 bg-rays-accent/30 hover:bg-rays-accent/50",
  };
}

/**
 * Full-screen image viewer — prev/next, close, dot pager.
 */
export function GalleryLightbox({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  alt,
  controlStyle = "brand",
}: Props) {
  const slides = images.filter(Boolean);
  const count = slides.length;
  const safeIndex = count > 0 ? ((index % count) + count) % count : 0;
  const src = slides[safeIndex];
  const ui = controlClasses(controlStyle);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count < 2) return;
      onIndexChange((safeIndex + dir + count) % count);
    },
    [count, onIndexChange, safeIndex],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, go]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-rays-cream/95 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — expanded view`}
      onClick={onClose}
    >
      <div className="relative flex min-h-0 flex-1 flex-col" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 z-20 md:right-8 md:top-8 ${ui.nav}`}
          aria-label="Close"
        >
          <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-3 py-16 sm:gap-6 sm:px-8">
          {count > 1 && (
            <button type="button" onClick={() => go(-1)} className={ui.nav} aria-label="Previous image">
              <Chevron direction="left" />
            </button>
          )}

          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              decoding="async"
              draggable={false}
              className="max-h-[min(85vh,920px)] max-w-[min(96vw,1200px)] object-contain object-center"
            />
          </div>

          {count > 1 && (
            <button type="button" onClick={() => go(1)} className={ui.nav} aria-label="Next image">
              <Chevron direction="right" />
            </button>
          )}
        </div>

        {count > 1 && (
          <div className="relative z-20 flex justify-center gap-2 pb-8 pt-2" role="tablist" aria-label="Gallery pages">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={`Image ${i + 1} of ${count}`}
                onClick={() => onIndexChange(i)}
                className={`rounded-full transition ${i === safeIndex ? ui.dotActive : ui.dotIdle}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
