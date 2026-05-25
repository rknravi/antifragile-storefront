"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { CouponField } from "@/components/commerce/CouponField";
import { OrderTotalsBreakdown } from "@/components/commerce/OrderTotalsBreakdown";
import { Money } from "@/components/Money";
import { ProductImage } from "@/components/ProductImage";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { getThemeFromPath } from "@/lib/theme-paths";
import { themeNavPaths, themeProductPath } from "@/lib/theme-nav-paths";
import { ProductShareBar } from "@/components/commerce/ProductShareBar";
import { ShareLinkBar } from "@/components/commerce/ShareLinkBar";
import { CartShippingPromoStrip } from "@/components/commerce/CartShippingPromoStrip";

export default function CartPage() {
  const pathname = usePathname();
  const theme = getThemeFromPath(pathname);
  const nav = themeNavPaths(theme);
  const {
    lines,
    setQuantity,
    removeLine,
    cartNote,
    setCartNote,
    giftWrap,
    setGiftWrap,
  } = useCart();
  const rays = theme === "rays";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Cart</h1>

      <CartShippingPromoStrip variant={rays ? "rays" : "classic"} shopHref={nav.shop} surface="page" />

      {lines.length === 0 ? (
        <p className="mt-6 text-neutral-600">
          <Link href={nav.shop} className="font-semibold text-brand-fresh underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {lines.map(({ product, quantity }) => {
              const unitPrice = product.salePrice ?? product.mrp;
              const lineTotal = unitPrice * quantity;
              const thumbSrc = productPrimaryImageSrc(product);

              return (
                <div
                  key={product.slug}
                  className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <Link
                    href={themeProductPath(theme, product.slug)}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                  >
                    {thumbSrc ? (
                      <ProductImage src={thumbSrc} alt={product.name} sizes="96px" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-100" />
                    )}
                  </Link>

                  <div className="flex-1">
                    <Link href={themeProductPath(theme, product.slug)} className="font-semibold hover:underline">
                      {product.name}
                    </Link>

                    {product.size ? (
                      <p className="text-sm text-neutral-500">{product.size}</p>
                    ) : null}

                    <ProductShareBar
                      product={product}
                      theme={theme}
                      variant={rays ? "compact" : "classic"}
                      label="Share"
                      className="mt-4"
                    />

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="text-sm text-neutral-600" htmlFor={`q-${product.slug}`}>
                        Qty
                      </label>

                      <input
                        id={`q-${product.slug}`}
                        type="number"
                        min={1}
                        max={99}
                        value={quantity}
                        onChange={(e) => setQuantity(product.slug, Number(e.target.value) || 1)}
                        className="w-20 rounded-lg border border-neutral-200 px-2 py-1 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => removeLine(product.slug)}
                        className="text-sm text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      <Money amount={lineTotal} />
                    </p>
                    <p className="text-xs text-neutral-500">
                      <Money amount={unitPrice} /> each
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              <strong>Routine bundle upgrade:</strong> add all three for complete care. Free shipping
              over ₹999 demo.
            </div>

            <label className="block text-sm font-medium text-neutral-800">
              Cart note
              <textarea
                value={cartNote}
                onChange={(e) => setCartNote(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="Gift message, delivery instructions…"
                className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
              Gift wrapping (+₹49)
            </label>
            <p className="text-xs text-neutral-500">
              In-store pickup: available at partner boutiques (demo — online shipping only).
            </p>
          </div>

          <aside className="h-fit rounded-2xl border border-black/5 bg-brand-sand p-6">
            <h2 className="text-lg font-semibold">Summary</h2>

            <CouponField variant={rays ? "rays" : "classic"} />
            <OrderTotalsBreakdown variant={rays ? "rays" : "classic"} className="mt-4" />

            <ShareLinkBar
              path={nav.shop}
              title="ANTIFRAGILE — Shop the ritual"
              text="Explore cleanse, treat, and seal bundles."
              variant={rays ? "rays" : "classic"}
              label="Share the collection"
              className="mt-6 border-t border-black/10 pt-6"
            />

            <Link
              href={nav.checkout}
              className="mt-6 flex w-full justify-center rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}