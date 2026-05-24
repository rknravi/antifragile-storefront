"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { buildAnnouncementSlides } from "@/lib/bundle-promo-messages";
import { raysPath } from "@/lib/theme-paths";
import { bundleShopHref } from "@/lib/site-nav";

const ROTATE_MS = 5000;

type Props = {
  className?: string;
};

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export function RaysAnnouncementBar({ className = "" }: Props) {
  const { catalog } = useCart();
  const shopHref = raysPath("/shop");

  const slides = useMemo(() => {
    const active = catalog.filter((p) => p.status === "active");
    if (active.length > 0) return buildAnnouncementSlides(active, shopHref);
    return buildAnnouncementSlides([], shopHref).filter(
      (s) => !s.id.endsWith("-bundle") && s.id !== "all-bundles"
    );
  }, [catalog, shopHref]);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const count = slides.length;

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setIsPlaying(false);
    const onChange = () => {
      if (mq.matches) setIsPlaying(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isPlaying || count <= 1) return;
    const id = window.setInterval(goNext, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [isPlaying, count, goNext]);

  const slide = slides[index] ?? {
    id: "fallback",
    text: "LAUNCH10 · 10% off · Free ship ₹999+",
    href: bundleShopHref(shopHref),
  };

  const message = (
    <span className="inline-block transition-opacity duration-500" key={slide.id}>
      {slide.text}
    </span>
  );

  const controlBtnClass =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-rays-white transition hover:bg-rays-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rays-white";

  return (
    <div
      className={`bg-rays-accent py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-rays-white md:tracking-[0.2em] ${className}`}
      role="region"
      aria-label="Offers and bundle savings"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 px-4">
        {count > 1 ? (
          <>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                className={controlBtnClass}
                onClick={goPrev}
                aria-label="Previous offer"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                className={controlBtnClass}
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? "Pause offer rotation" : "Play offer rotation"}
                aria-pressed={isPlaying}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                className={controlBtnClass}
                onClick={goNext}
                aria-label="Next offer"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>

            <div className="min-w-0 flex-1 text-center">
              {slide.href ? (
                <Link
                  href={slide.href}
                  className="inline-block hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rays-white"
                >
                  {message}
                </Link>
              ) : (
                message
              )}
              {!isPlaying ? (
                <span className="mt-0.5 block text-[9px] font-semibold normal-case tracking-normal text-rays-white/70">
                  Offer {index + 1} of {count}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="min-w-0 text-center">
            {slide.href ? (
              <Link
                href={slide.href}
                className="inline-block hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rays-white"
              >
                {message}
              </Link>
            ) : (
              message
            )}
          </div>
        )}
      </div>
    </div>
  );
}
