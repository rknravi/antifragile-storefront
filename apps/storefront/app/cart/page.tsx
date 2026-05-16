"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";
import { ProductImage } from "@/components/ProductImage";

export default function CartPage() {
  const {
    lines,
    setQuantity,
    removeLine,
    subtotal,
    coupon,
    setCoupon,
    discount,
    estimatedTax,
    shippingEstimate,
    total,
  } = useCart();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Cart</h1>

      {lines.length === 0 ? (
        <p className="mt-8 text-neutral-600">
          Your cart is empty.{" "}
          <Link href="/shop" className="font-semibold text-brand-fresh underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {lines.map(({ product, quantity }) => {
              const unitPrice = product.salePrice ?? product.mrp;
              const lineTotal = unitPrice * quantity;
              const thumbSrc = product.thumbnail ?? product.image;

              return (
                <div
                  key={product.slug}
                  className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                  >
                    {thumbSrc ? (
                      <ProductImage src={thumbSrc} alt={product.name} sizes="96px" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-100" />
                    )}
                  </Link>

                  <div className="flex-1">
                    <Link href={`/products/${product.slug}`} className="font-semibold hover:underline">
                      {product.name}
                    </Link>

                    {product.size ? (
                      <p className="text-sm text-neutral-500">{product.size}</p>
                    ) : null}

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
          </div>

          <aside className="h-fit rounded-2xl border border-black/5 bg-brand-sand p-6">
            <h2 className="text-lg font-semibold">Summary</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  <Money amount={subtotal} />
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="coupon" className="text-neutral-600">
                  Coupon
                </label>

                <div className="flex gap-2">
                  <input
                    id="coupon"
                    value={coupon ?? ""}
                    onChange={(e) => setCoupon(e.target.value || null)}
                    placeholder="LAUNCH10"
                    className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Discount</span>
                    <span>
                      −<Money amount={discount} />
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Tax estimate</span>
                <span>
                  <Money amount={estimatedTax} />
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Shipping estimate</span>
                <span>{shippingEstimate === 0 ? "FREE" : <Money amount={shippingEstimate} />}</span>
              </div>

              <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold">
                <span>Total</span>
                <span>
                  <Money amount={total} />
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
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