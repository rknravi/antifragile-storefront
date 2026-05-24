"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getCheckoutUpsellProducts } from "@/lib/checkout-upsell";
import { getFreeShippingProgress } from "@/lib/free-shipping";
import { productDisplayName } from "@/lib/product-palette";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { ProductImage } from "@/components/ProductImage";
import { Money } from "@/components/Money";
import { themeProductPath } from "@/lib/theme-nav-paths";

type Props = {
  theme: "rays" | "classic";
  /** Drawer: compact under free-shipping bar; checkout: section with top border */
  layout?: "drawer" | "checkout";
  title?: string;
  /** Hide list once free shipping is unlocked */
  hideWhenQualified?: boolean;
};

export function CartUpsellSuggestions({
  theme,
  layout = "drawer",
  title,
  hideWhenQualified = true,
}: Props) {
  const { catalog, lines, addItem, subtotal, discount } = useCart();
  const rays = theme === "rays";
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  const cartSlugs = useMemo(() => new Set(lines.map((l) => l.product.slug)), [lines]);
  const qualifyingTotal = Math.max(0, subtotal - discount);

  const suggestions = useMemo(
    () => getCheckoutUpsellProducts(catalog, cartSlugs, qualifyingTotal, 3),
    [catalog, cartSlugs, qualifyingTotal]
  );

  const shipping = useMemo(
    () => getFreeShippingProgress(qualifyingTotal, lines.length === 0),
    [qualifyingTotal, lines.length]
  );

  if (!suggestions.length) return null;
  if (hideWhenQualified && shipping.qualified) return null;

  const heading =
    title ??
    (shipping.qualified
      ? "Complete your ritual"
      : layout === "drawer"
        ? "Add to unlock free shipping"
        : "Just one more thing");

  const handleAdd = (slug: string, product: (typeof suggestions)[0]) => {
    addItem(product, 1, { openDrawer: true });
    setAddedSlug(slug);
    window.setTimeout(() => setAddedSlug(null), 2000);
  };

  const addBtnClass =
    layout === "drawer"
      ? rays
        ? "shrink-0 border-2 border-rays-black bg-rays-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-rays-black hover:bg-rays-black hover:text-rays-accent"
        : "shrink-0 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-amber-200"
      : rays
        ? "shrink-0 rounded-full border-2 border-rays-black bg-rays-accent px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-rays-black transition hover:bg-rays-black hover:text-rays-accent"
        : "shrink-0 rounded-full bg-amber-100 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-200";

  const sectionClass =
    layout === "checkout"
      ? `border-t pt-6 ${rays ? "border-rays-line" : "border-black/10"}`
      : `mt-4 border-t pt-4 ${rays ? "border-rays-white/25" : "border-black/10"}`;

  return (
    <section className={sectionClass} aria-label={heading}>
      <h3
        className={`font-bold ${
          layout === "drawer"
            ? rays
              ? "font-rays text-[11px] uppercase tracking-widest text-rays-white"
              : "text-xs font-semibold uppercase tracking-wider text-neutral-800"
            : rays
              ? "font-rays text-base uppercase tracking-wide"
              : "text-base text-neutral-900"
        }`}
      >
        {heading}
      </h3>
      {!shipping.qualified && shipping.remaining > 0 ? (
        <p
          className={`mt-1 ${
            layout === "drawer" && rays
              ? "text-[10px] normal-case tracking-normal text-rays-white/85"
              : `text-xs ${rays ? "text-rays-gray" : "text-neutral-600"}`
          }`}
        >
          Tap <span className="font-bold">Add</span> —{" "}
          <Money amount={shipping.remaining} /> more qualifies for{" "}
          <span className="font-bold">FREE</span> shipping
        </p>
      ) : null}

      <ul className={`mt-3 space-y-3 ${layout === "drawer" ? "" : "mt-4 space-y-4"}`}>
        {suggestions.map((product) => {
          const thumb = productPrimaryImageSrc(product);
          const justAdded = addedSlug === product.slug;
          const productHref = themeProductPath(theme, product.slug);
          const rowBg =
            layout === "drawer" && rays ? "rounded-lg bg-rays-white/10 p-2" : "";

          return (
            <li key={product.slug} className={`flex gap-2.5 ${rowBg}`}>
              <Link
                href={productHref}
                className={`relative h-14 w-12 shrink-0 overflow-hidden ${
                  rays ? "rounded-md bg-white/90" : "rounded-md bg-neutral-100"
                }`}
              >
                {thumb ? (
                  <ProductImage src={thumb} alt="" sizes="48px" className="h-full w-full object-contain p-0.5" />
                ) : null}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={productHref}
                  className={`text-xs font-semibold leading-snug hover:underline ${
                    layout === "drawer" && rays ? "text-rays-white" : ""
                  }`}
                >
                  {productDisplayName(product.name)}
                </Link>
                {product.size ? (
                  <p
                    className={`text-[10px] ${
                      layout === "drawer" && rays ? "text-rays-white/70" : "text-neutral-500"
                    }`}
                  >
                    {product.size}
                  </p>
                ) : null}
                <p
                  className={`mt-0.5 text-xs font-semibold tabular-nums ${
                    layout === "drawer" && rays ? "text-rays-white" : ""
                  }`}
                >
                  <Money amount={product.salePrice} />
                </p>
              </div>

              <button
                type="button"
                disabled={justAdded || product.inventoryQuantity < 1}
                onClick={() => handleAdd(product.slug, product)}
                className={`${addBtnClass} self-center disabled:opacity-60`}
              >
                {justAdded ? "Added" : "Add"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
