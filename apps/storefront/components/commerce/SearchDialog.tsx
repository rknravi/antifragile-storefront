"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getThemeFromPath } from "@/lib/theme-paths";
import { themeProductPath } from "@/lib/theme-nav-paths";
import { ProductImage } from "@/components/ProductImage";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { Money } from "@/components/Money";
import { searchCatalogProducts } from "@/lib/product-search";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { catalog } = useCart();
  const pathname = usePathname();
  const theme = getThemeFromPath(pathname);
  const rays = theme === "rays";
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = q.trim();
    if (!term) return catalog.filter((p) => p.status === "active").slice(0, 6);
    return searchCatalogProducts(catalog, term);
  }, [catalog, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close search" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Search products"
        className="relative mx-auto mt-16 max-w-2xl px-4"
      >
        <div
          className={
            rays
              ? "border-2 border-rays-black bg-rays-white p-4 shadow-2xl"
              : "rounded-2xl bg-white p-4 shadow-2xl"
          }
        >
          <input
            type="search"
            autoFocus
            placeholder="Search products, concerns, categories…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`w-full border px-4 py-3 text-base outline-none ${
              rays
                ? "border-rays-line bg-white focus:border-rays-black"
                : "rounded-xl border-neutral-200 focus:ring-2 focus:ring-brand-fresh"
            }`}
          />
          <ul className="mt-4 max-h-[50vh] overflow-y-auto">
            {results.map((p) => (
              <li key={p.id} className="border-t border-black/5 first:border-0">
                <Link
                  href={themeProductPath(theme, p.slug)}
                  className="flex items-center gap-4 py-3 hover:bg-black/[0.02]"
                  onClick={onClose}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-neutral-100">
                    {productPrimaryImageSrc(p) && (
                      <ProductImage src={productPrimaryImageSrc(p)} alt="" sizes="56px" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-neutral-500">{p.category}</p>
                  </div>
                  <Money amount={p.salePrice} />
                </Link>
              </li>
            ))}
            {results.length === 0 && (
              <li className="py-8 text-center text-sm text-neutral-500">No products found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
