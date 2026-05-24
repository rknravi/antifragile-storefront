import type { Product } from "@/lib/product-types";
import type { StoreTheme } from "@/lib/theme-paths";
import { ProductBadges } from "@/components/ProductBadges";
import { ProductCategoryPill } from "@/components/ProductCategoryPill";
import { Money } from "@/components/Money";
import { getProductPalette, productDisplayName, productShortLabel } from "@/lib/product-palette";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import { PdpActions } from "@/app/products/[slug]/PdpActions";
import { ProductTabs } from "./ProductTabs";
import { ProductSizeDisplay } from "./ProductSizeDisplay";
import { ProductShare } from "./ProductShare";
import { ProductRatingSummary } from "./ProductRatingSummary";

export function ProductInfoPanel({
  product,
  variant = "default",
  theme = "classic",
}: {
  product: Product;
  variant?: "default" | "rays";
  theme?: StoreTheme;
}) {
  const palette = getProductPalette(product);
  const onSale = product.salePrice < product.mrp;
  const rays = variant === "rays";
  const nav = themeNavPaths(theme);

  return (
    <div className="relative">
      <div
        className="absolute -left-4 top-0 hidden h-full w-1 rounded-full md:block"
        style={{ background: palette.gradient }}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <ProductCategoryPill category={product.category} />
        <ProductBadges badges={product.badges} accent={palette.primary} />
      </div>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <h1
          className={
            rays
              ? "font-rays text-3xl font-extrabold uppercase leading-tight text-rays-black md:text-4xl"
              : "font-display text-pdp-title md:text-pdp-title-lg"
          }
        >
          {productDisplayName(product.name)}
        </h1>
        <ProductRatingSummary slug={product.slug} accent={palette.primary} />
      </div>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.16em]" style={{ color: palette.primary }}>
        {productShortLabel(product)}
      </p>
      <p className="mt-5 text-lg leading-relaxed text-neutral-700">{product.shortDescription}</p>

      <div
        className="mt-6 inline-flex flex-wrap items-baseline gap-3 rounded-2xl px-5 py-4"
        style={{ backgroundColor: palette.light }}
      >
        <span className="font-display text-3xl font-semibold md:text-4xl" style={{ color: palette.primary }}>
          <Money amount={product.salePrice} />
        </span>
        {onSale && (
          <span className="text-lg text-neutral-400 line-through">
            <Money amount={product.mrp} />
          </span>
        )}
        <span className="w-full text-xs text-neutral-500 sm:w-auto">
          MRP incl. of all taxes ·{" "}
          <a
            href={nav.shippingPolicy}
            className={rays ? "font-semibold text-rays-accent underline" : "underline hover:text-neutral-700"}
          >
            Shipping
          </a>{" "}
          calculated at checkout
        </span>
      </div>

      <ProductSizeDisplay product={product} palette={palette} />
      <PdpActions product={product} palette={palette} theme={theme} cartHref={nav.cart} checkoutHref={nav.checkout} />
      <ProductShare product={product} accent={palette.primary} theme={theme} />
      <ProductTabs product={product} variant={rays ? "rays" : "default"} />
    </div>
  );
}
