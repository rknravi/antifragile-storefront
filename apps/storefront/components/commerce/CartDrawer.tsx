"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getThemeFromPath, themeShopPath } from "@/lib/theme-paths";
import { themeNavPaths, themeProductPath } from "@/lib/theme-nav-paths";
import { CouponField } from "@/components/commerce/CouponField";
import { OrderTotalsBreakdown } from "@/components/commerce/OrderTotalsBreakdown";
import { Money } from "@/components/Money";
import { ProductImage } from "@/components/ProductImage";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { ProductShareBar } from "@/components/commerce/ProductShareBar";
import { ShareLinkBar } from "@/components/commerce/ShareLinkBar";
import { FreeShippingProgress } from "@/components/commerce/FreeShippingProgress";
import { CartUpsellSuggestions } from "@/components/commerce/CartUpsellSuggestions";

export function CartDrawer() {
  const pathname = usePathname();
  const theme = getThemeFromPath(pathname);
  const rays = theme === "rays";
  const {
    cartOpen,
    closeCart,
    lines,
    setQuantity,
    removeLine,
    giftWrap,
    setGiftWrap,
    giftWrapFee,
    cartNote,
    setCartNote,
  } = useCart();

  const shopHref = themeShopPath(pathname);
  const nav = themeNavPaths(theme);

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/40 transition-opacity ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!cartOpen}
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={`fixed right-0 top-0 z-[71] flex h-full w-full max-w-md flex-col shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        } ${rays ? "bg-rays-white text-rays-black" : "bg-white"}`}
      >
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            rays ? "border-rays-line" : "border-black/5"
          }`}
        >
          <h2 className={rays ? "font-rays text-2xl uppercase" : "font-display text-xl"}>
            Your bag
          </h2>
          <button type="button" onClick={closeCart} className="text-sm uppercase tracking-widest text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </div>

        <div
          className={`border-b px-5 py-5 ${
            rays ? "border-rays-line bg-rays-accent text-rays-white" : "border-black/5 bg-neutral-50/80"
          }`}
        >
          <FreeShippingProgress
            variant={rays ? "rays" : "classic"}
            shopHref={shopHref}
            onShopClick={closeCart}
            align="left"
            onAccentBackground={rays}
          />
          <CartUpsellSuggestions theme={rays ? "rays" : "classic"} layout="drawer" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-sm text-neutral-600">
              <Link href={shopHref} className="font-semibold underline" onClick={closeCart}>
                Browse the collection
              </Link>{" "}
              to add items to your bag.
            </p>
          ) : (
            <ul className="space-y-4">
              {lines.map(({ product, quantity }) => {
                const thumb = productPrimaryImageSrc(product);
                return (
                  <li
                    key={product.slug}
                    className={`flex gap-3 border-b pb-4 ${
                      rays ? "border-rays-line" : "border-black/5"
                    }`}
                  >
                    <Link
                      href={themeProductPath(theme, product.slug)}
                      className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100"
                      onClick={closeCart}
                    >
                      {thumb && <ProductImage src={thumb} alt={product.name} sizes="64px" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={themeProductPath(theme, product.slug)}
                        className="text-sm font-medium hover:underline"
                        onClick={closeCart}
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-neutral-500">{product.size}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={quantity}
                          onChange={(e) => setQuantity(product.slug, Number(e.target.value) || 1)}
                          className="w-14 border px-1 py-0.5 text-sm"
                          aria-label="Quantity"
                        />
                        <button type="button" className="text-xs text-red-700" onClick={() => removeLine(product.slug)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <Money amount={product.salePrice * quantity} />
                  </li>
                );
              })}
            </ul>
          )}

          {lines.length > 0 && (
            <div className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Cart note
                <textarea
                  value={cartNote}
                  onChange={(e) => setCartNote(e.target.value.slice(0, 500))}
                  rows={2}
                  placeholder="Gift message or delivery instructions"
                  className={`mt-1 w-full border px-3 py-2 text-sm ${
                    rays ? "border-rays-line bg-white" : "rounded-lg border-neutral-200"
                  }`}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
                Gift wrapping (+<Money amount={49} />)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" disabled className="opacity-50" />
                In-store pickup (demo — online only)
              </label>
              <CouponField variant={rays ? "rays" : "classic"} compact />
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className={`border-t px-5 py-4 ${rays ? "border-rays-line" : "border-black/5"}`}>
            <OrderTotalsBreakdown variant={rays ? "rays" : "classic"} />
            {lines.length === 1 ? (
              <ProductShareBar
                product={lines[0].product}
                theme={theme}
                variant="compact"
                label="Share"
                className="mt-4 border-t border-black/5 pt-4"
              />
            ) : (
              <ShareLinkBar
                path={nav.shop}
                title="ANTIFRAGILE — Shop the ritual"
                text="Explore cleanse, treat, and seal."
                variant={rays ? "compact" : "classic"}
                label="Share shop"
                className="mt-4 border-t border-black/5 pt-4"
              />
            )}
            <Link
              href={nav.checkout}
              onClick={closeCart}
              className={`mt-4 flex w-full justify-center py-3 text-sm font-semibold ${
                rays
                  ? "bg-rays-black text-rays-accent uppercase tracking-widest hover:bg-rays-gray"
                  : "rounded-full bg-neutral-900 text-white"
              }`}
            >
              Checkout
            </Link>
            <Link href={nav.cart} onClick={closeCart} className="mt-2 block text-center text-xs text-neutral-500 underline">
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
