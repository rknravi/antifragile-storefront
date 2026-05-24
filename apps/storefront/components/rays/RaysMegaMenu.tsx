"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/lib/product-types";
import { ProductImage } from "@/components/ProductImage";
import { Money } from "@/components/Money";
import { raysPath } from "@/lib/theme-paths";
import { bundleShopHref } from "@/lib/site-nav";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { themeProductPath } from "@/lib/theme-nav-paths";

const shopLinks = [
  { href: (s: string) => `${s}?category=Cleanser`, label: "Cleanse" },
  { href: (s: string) => `${s}?category=Serum`, label: "Treat" },
  { href: (s: string) => `${s}?category=Moisturizer`, label: "Seal" },
  { href: (s: string) => bundleShopHref(s), label: "Bundles" },
  { href: (s: string) => s, label: "Shop all" },
];

export function RaysMegaMenu({
  products,
  open,
  onClose,
}: {
  products: Product[];
  open: boolean;
  onClose: () => void;
}) {
  const shopHref = raysPath("/shop");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const featured = products.filter((p) => p.status === "active").slice(0, 6);
  const visible = 3;
  const maxIndex = Math.max(0, featured.length - visible);

  function scrollNext() {
    setIndex((i) => Math.min(i + 1, maxIndex));
    scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
  }

  if (!open) return null;

  return (
    <div
      className="absolute left-1/2 top-full z-50 mt-3 w-[min(920px,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-rays-line bg-rays-white p-6 shadow-[0_24px_48px_rgba(255,92,0,0.12)] md:p-8"
      onMouseLeave={onClose}
    >
      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        <div>
          <Link
            href={shopHref}
            onClick={onClose}
            className="font-rays text-2xl font-extrabold uppercase text-rays-accent hover:opacity-80"
          >
            Shop
          </Link>
          <ul className="mt-5 space-y-3">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href(shopHref)}
                  onClick={onClose}
                  className="font-display text-xl text-rays-accent transition hover:opacity-70"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-w-0">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featured.map((p) => {
              const img = productPrimaryImageSrc(p);
              return (
                <Link
                  key={p.id}
                  href={themeProductPath("rays", p.slug)}
                  onClick={onClose}
                  className="w-[min(240px,70vw)] shrink-0 rounded-2xl bg-rays-cream p-4 transition hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-rays-surface">
                    {img && <ProductImage src={img} alt="" sizes="240px" className="object-contain p-4" />}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase leading-snug text-rays-accent">
                    {p.name.replace(/^ANTIFRAGILE\s*/i, "")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-rays-accent">
                    <Money amount={p.salePrice} />
                  </p>
                </Link>
              );
            })}
          </div>
          {featured.length > visible && (
            <button
              type="button"
              onClick={scrollNext}
              disabled={index >= maxIndex}
              className="absolute right-8 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-rays-accent text-rays-white shadow-lg transition hover:scale-105 disabled:opacity-40 md:flex"
              aria-label="Next products"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
