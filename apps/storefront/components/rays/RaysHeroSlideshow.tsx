"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/product-types";
import { raysPath } from "@/lib/theme-paths";
import { themeProductPath } from "@/lib/theme-nav-paths";
import { getRoutineTrio } from "@/lib/routine-products";
import {
  RaysHeroBackdrop,
  RaysHeroProductFigure,
} from "@/components/rays/RaysHeroProductScene";

type Slide = {
  step: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  product: Product;
};

const ROTATE_MS = 5500;

export function RaysHeroSlideshow({ products }: { products: Product[] }) {
  const slides = useMemo(() => {
    const trio = getRoutineTrio(products);
    const items: { step: string; product?: Product }[] = [
      { step: "Cleanse", product: trio.cleanser },
      { step: "Treat", product: trio.serum },
      { step: "Seal", product: trio.moisturizer },
    ];

    return items
      .filter((item): item is { step: string; product: Product } => item.product != null)
      .map(
        (item): Slide => ({
          step: item.step,
          title: item.product.name.replace(/^ANTIFRAGILE\s*/i, ""),
          sub: item.product.shortDescription,
          cta: "View product",
          href: themeProductPath("rays", item.product.slug),
          product: item.product,
        })
      );
  }, [products]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];

  if (!slide) {
    return (
      <section className="relative min-h-[85vh] overflow-hidden bg-rays-black text-rays-white">
        <RaysHeroBackdrop />
        <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-[1440px] flex-col justify-end px-4 pb-16 pt-24 md:px-8">
          <h1 className="max-w-2xl font-rays text-5xl font-extrabold uppercase md:text-7xl">Magnetic by design</h1>
          <Link
            href={raysPath("/shop")}
            className="mt-8 inline-flex bg-rays-accent px-8 py-4 text-xs font-bold uppercase text-white"
          >
            Shop the drop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-rays-black text-rays-white">
      <RaysHeroBackdrop />

      <div className="relative z-10 mx-auto grid min-h-[85vh] w-full max-w-[1440px] grid-cols-1 items-end gap-8 px-4 pb-16 pt-24 md:px-8 md:pb-24 lg:grid-cols-[minmax(0,1fr)_clamp(200px,32vw,380px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(220px,34vw,400px)]">
        {/* Copy — min-w-0 keeps long titles inside the left column */}
        <div className="min-w-0 pr-0 lg:pr-4">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-rays-accent">{slide.step}</p>
          <h1
            key={slide.product.id}
            className="mt-4 break-words font-rays text-4xl font-extrabold uppercase leading-[1.02] text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-7xl"
          >
            {slide.title}
          </h1>
          <p key={`${slide.product.id}-sub`} className="mt-6 max-w-md text-lg text-rays-line">
            {slide.sub}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={slide.href}
              className="inline-flex bg-rays-accent px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-rays-white hover:bg-white hover:text-rays-accent"
            >
              {slide.cta}
            </Link>
            <Link
              href={raysPath("/shop")}
              className="inline-flex border-2 border-white px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-rays-black"
            >
              All products
            </Link>
          </div>

          {slides.length > 1 && (
            <div className="mt-12 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.product.id}
                  type="button"
                  aria-label={`Show ${s.step}`}
                  onClick={() => setIndex(i)}
                  className={`h-1 transition-all ${i === index ? "w-12 bg-rays-accent" : "w-6 bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product — separate grid column; cannot overlap text */}
        <div className="hidden shrink-0 lg:flex lg:items-end lg:pb-2">
          <RaysHeroProductFigure product={slide.product} />
        </div>
      </div>

      {/* Product below copy on smaller screens */}
      <div className="relative z-10 flex justify-center px-4 pb-10 lg:hidden">
        <RaysHeroProductFigure product={slide.product} />
      </div>
    </section>
  );
}
