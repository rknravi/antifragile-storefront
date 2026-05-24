"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Product } from "@/lib/product-types";
import { useCart } from "@/lib/cart-context";
import { ProductImage } from "@/components/ProductImage";
import { ProductBadges } from "@/components/ProductBadges";
import { Money } from "@/components/Money";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { usePathname } from "next/navigation";
import { getThemeFromPath } from "@/lib/theme-paths";
import { themeProductPath } from "@/lib/theme-nav-paths";
import { ProductShareBar } from "@/components/commerce/ProductShareBar";

export function QuickViewModal({
  product,
  onClose,
  variant = "default",
}: {
  product: Product | null;
  onClose: () => void;
  variant?: "default" | "rays";
}) {
  const { addItem } = useCart();
  const pathname = usePathname();
  const theme = variant === "rays" ? "rays" : getThemeFromPath(pathname);
  const rays = theme === "rays";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return null;

  const img = productPrimaryImageSrc(product);

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-label={`Quick view: ${product.name}`}
        className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto shadow-2xl ${
          rays ? "border-2 border-rays-black bg-rays-white" : "rounded-2xl bg-white"
        }`}
      >
        <button
          type="button"
          className="absolute right-4 top-4 z-10 text-2xl text-neutral-400 hover:text-neutral-800"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-neutral-100">
            {img && <ProductImage src={img} alt={product.name} sizes="50vw" priority />}
          </div>
          <div className="p-6 md:p-8">
            <ProductBadges badges={product.badges} />
            <h2
              className={`mt-3 ${
                rays ? "font-rays text-xl font-bold uppercase" : "font-display text-xl"
              }`}
            >
              {product.name}
            </h2>
            <p className="mt-3 text-sm text-neutral-600">{product.shortDescription}</p>
            <div className="mt-4 flex items-baseline gap-2">
              <Money amount={product.salePrice} />
              {product.salePrice < product.mrp && (
                <span className="text-sm text-neutral-400 line-through">
                  <Money amount={product.mrp} />
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => addItem(product, 1)}
                className={
                  rays
                    ? "bg-rays-accent px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
                    : "rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white"
                }
              >
                Quick buy
              </button>
              <Link
                href={themeProductPath(theme, product.slug)}
                className="py-2.5 text-sm font-medium underline"
                onClick={onClose}
              >
                Full details
              </Link>
            </div>
            <ProductShareBar
              product={product}
              theme={theme}
              variant={rays ? "compact" : "classic"}
              label="Share"
              className="mt-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
