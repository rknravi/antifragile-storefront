"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { raysPath } from "@/lib/theme-paths";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { RaysHeroBackdrop, RaysHeroSceneFigure } from "@/components/rays/RaysHeroProductScene";

const ROTATE_MS = 5500;

export function RaysHeroSlideshow() {
  const slides = HERO_SLIDES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-rays-black text-rays-white">
      <RaysHeroBackdrop />

      <div className="relative z-10 mx-auto grid min-h-[85vh] w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-4 py-20 md:px-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Copy — uses full left half of grid; no narrow max-width */}
        <div className="relative z-10 min-w-0 lg:max-w-none lg:pr-6 xl:pr-10">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-rays-accent">{slide.step}</p>
          <h1
            key={slide.id}
            className="mt-4 text-balance font-rays text-4xl font-extrabold uppercase leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[2.85rem] xl:text-6xl"
          >
            {slide.title}
          </h1>
          <p key={`${slide.id}-sub`} className="mt-6 max-w-lg text-lg leading-relaxed text-rays-line">
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
                  key={s.id}
                  type="button"
                  aria-label={`Show ${s.title}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-1 transition-all ${i === index ? "w-12 bg-rays-accent" : "w-6 bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Figure — fixed frame; same footprint for every slide */}
        <div className="hidden min-h-[360px] min-w-0 items-center justify-center sm:min-h-[520px] lg:flex lg:min-h-[720px] lg:min-w-[600px] lg:justify-end">
          <RaysHeroSceneFigure
            src={slide.figureSrc}
            alt={slide.title}
            imageKey={slide.id}
            style={slide.figureStyle}
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full justify-center px-4 pb-10 lg:hidden">
        <RaysHeroSceneFigure
          src={slide.figureSrc}
          alt={slide.title}
          imageKey={slide.id}
          style={slide.figureStyle}
        />
      </div>
    </section>
  );
}
