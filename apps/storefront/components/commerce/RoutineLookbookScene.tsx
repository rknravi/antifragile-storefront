"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/product-types";
import { Money } from "@/components/Money";
import { productDisplayName } from "@/lib/product-palette";
import {
  buildRoutinePlacements,
  getRoutineTrio,
  productAssetSrc,
  type RoutinePlacement,
} from "@/lib/routine-products";
import { themeProductPath } from "@/lib/theme-nav-paths";
import type { StoreTheme } from "@/lib/theme-paths";

function Hotspot({
  placement,
  isOpen,
  onToggle,
  theme,
}: {
  placement: RoutinePlacement;
  isOpen: boolean;
  onToggle: () => void;
  theme: StoreTheme;
}) {
  const src = productAssetSrc(placement.product);
  const name = productDisplayName(placement.product.name);

  return (
    <div
      data-lookbook-hotspot
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ top: placement.spotTop, left: placement.spotLeft }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${placement.label}: ${name}`}
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-xl font-bold shadow-lg transition ${
          isOpen
            ? "scale-110 border-rays-white bg-rays-accent text-rays-white"
            : "border-rays-accent bg-rays-black text-rays-accent hover:scale-110 hover:bg-rays-accent hover:text-rays-white"
        }`}
      >
        {isOpen ? "×" : "+"}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={name}
          className="absolute left-1/2 top-[calc(100%+14px)] z-20 w-[min(240px,78vw)] -translate-x-1/2 rounded-2xl border-2 border-rays-accent bg-rays-white p-4 shadow-2xl"
        >
          <div className="pointer-events-none absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-rays-accent bg-rays-white" />

          {src && (
            <div className="flex justify-center rounded-xl bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="pack-shot-cutout max-h-36 w-auto object-contain"
                draggable={false}
              />
            </div>
          )}

          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-rays-accent">{placement.label}</p>
          <p className="mt-1 font-rays text-sm font-bold uppercase leading-snug text-rays-black">{name}</p>
          <p className="mt-2 text-sm font-bold text-rays-accent">
            <Money amount={placement.product.salePrice} />
          </p>
          <Link
            href={themeProductPath(theme, placement.product.slug)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-rays-accent px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-rays-white transition hover:opacity-90"
          >
            View product
          </Link>
        </div>
      )}
    </div>
  );
}

export function RoutineLookbookScene({
  products,
  backgroundSrc,
  theme = "rays",
  title,
  subtitle,
}: {
  products: Product[];
  backgroundSrc: string;
  theme?: StoreTheme;
  title: string;
  subtitle: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const placements = buildRoutinePlacements(getRoutineTrio(products));
  const [active, setActive] = useState<string | null>(null);

  const close = useCallback(() => setActive(null), []);

  const toggle = useCallback((id: string) => {
    setActive((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    if (!active) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-lookbook-hotspot]")) return;
      close();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [active, close]);

  return (
    <section className="bg-rays-black py-20 text-rays-white">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <h2 className="font-rays text-4xl font-extrabold uppercase md:text-5xl">{title}</h2>
        <p className="mt-2 max-w-lg text-rays-line">{subtitle}</p>

        <div
          ref={sceneRef}
          className="relative mt-10 aspect-[16/9] min-h-[300px] w-full overflow-visible border-2 border-rays-accent sm:overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={backgroundSrc}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
              aria-hidden
            />
          </div>

          {placements.map((p) => (
            <Hotspot
              key={p.id}
              placement={p}
              isOpen={active === p.id}
              onToggle={() => toggle(p.id)}
              theme={theme}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-rays-line md:text-left">
          Tap <span className="font-bold text-rays-accent">+</span> on each step to see the product. Press{" "}
          <span className="font-bold text-rays-accent">×</span> or click outside to close.
        </p>
      </div>
    </section>
  );
}
