"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { buildAnnouncementSlides } from "@/lib/bundle-promo-messages";
import { raysPath } from "@/lib/theme-paths";

export function PromoOfferBar({ accent }: { accent?: string }) {
  const { catalog } = useCart();
  const shopHref = raysPath("/shop");

  const slides = useMemo(() => {
    const active = catalog.filter((p) => p.status === "active");
    return buildAnnouncementSlides(active, shopHref);
  }, [catalog, shopHref]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];

  if (!slide) return null;

  const inner = <span key={slide.id}>{slide.text}</span>;

  return (
    <div
      className="border-b border-black/5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white md:text-[11px]"
      style={{ backgroundColor: accent ?? "#1E4A6E" }}
      role="region"
      aria-label="Current offers"
      aria-live="polite"
    >
      {slide.href ? (
        <Link href={slide.href} className="inline-block hover:underline">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}
