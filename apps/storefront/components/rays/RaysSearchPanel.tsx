"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ProductImage } from "@/components/ProductImage";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { themeProductPath } from "@/lib/theme-nav-paths";
import { Money } from "@/components/Money";
import { searchCatalogProducts } from "@/lib/product-search";
import { RAYS_POPULAR_SEARCHES } from "@/lib/brand-images";
import { raysPath } from "@/lib/theme-paths";

type Props = {
  variant?: "page" | "overlay";
  initialQuery?: string;
  onClose?: () => void;
};

export function RaysSearchPanel({ variant = "page", initialQuery = "", onClose }: Props) {
  const router = useRouter();
  const { catalog } = useCart();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (variant !== "overlay" || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [variant, onClose]);

  function syncUrl(next: string) {
    if (variant !== "page") return;
    const trimmed = next.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    router.replace(qs ? `${raysPath("/search")}?${qs}` : raysPath("/search"), { scroll: false });
  }

  function updateQuery(next: string) {
    setQ(next);
    syncUrl(next);
  }

  const popular = useMemo(
    () => catalog.filter((p) => p.status === "active").slice(0, 3),
    [catalog]
  );

  const results = useMemo(() => {
    const term = q.trim();
    if (!term) return popular;
    return searchCatalogProducts(catalog, term);
  }, [catalog, q, popular]);

  const shellClass =
    variant === "overlay"
      ? "fixed inset-0 z-[100] overflow-y-auto bg-rays-white"
      : "bg-rays-white pb-16";

  const innerClass =
    variant === "overlay"
      ? "mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10"
      : "mx-auto max-w-6xl px-4 md:px-8";

  return (
    <div className={shellClass}>
      <div className={innerClass}>
        {variant === "overlay" && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-light text-rays-accent hover:opacity-70"
            aria-label="Close search"
          >
            ×
          </button>
        ) : null}

        <div
          className={`relative border-b-2 border-rays-accent/30 pb-4 ${
            variant === "overlay" ? "mt-6" : "mt-2 pt-2"
          }`}
        >
          <label htmlFor="rays-search" className="sr-only">
            Search products
          </label>
          <input
            id="rays-search"
            type="search"
            autoFocus
            placeholder="SEARCH…"
            value={q}
            onChange={(e) => updateQuery(e.target.value)}
            className="w-full bg-transparent font-rays text-4xl font-extrabold uppercase tracking-tight text-rays-accent placeholder:text-rays-accent-light focus:outline-none md:text-6xl"
          />
          <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-rays-accent" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16 16" />
            </svg>
          </span>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rays-accent">Popular searches</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {RAYS_POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => updateQuery(tag)}
                  className="rounded-full border-2 border-rays-accent px-5 py-2 text-sm font-bold uppercase text-rays-accent transition hover:bg-rays-accent hover:text-rays-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rays-accent">
              {q.trim() ? "Results" : "Popular items"}
            </p>
            <ul className="mt-5 grid gap-6 sm:grid-cols-3">
              {results.slice(0, 6).map((p) => {
                const img = productPrimaryImageSrc(p);
                return (
                  <li key={p.id}>
                    <Link
                      href={themeProductPath("rays", p.slug)}
                      onClick={onClose}
                      className="group block"
                    >
                      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-rays-cream p-4">
                        {img && (
                          <ProductImage
                            src={img}
                            alt=""
                            sizes="200px"
                            layout="intrinsic"
                            className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="mt-3 text-xs font-bold uppercase leading-snug text-rays-accent">
                        {p.name.replace(/^ANTIFRAGILE\s*/i, "")}
                      </p>
                      <p className="mt-1 text-sm font-bold text-rays-accent">
                        <Money amount={p.salePrice} />
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {results.length === 0 && (
              <p className="mt-6 text-sm text-rays-gray">No products found. Try another term or browse the shop.</p>
            )}
            <Link
              href={raysPath("/shop")}
              onClick={onClose}
              className="mt-8 inline-block text-xs font-bold uppercase tracking-widest text-rays-accent underline"
            >
              Shop all
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
