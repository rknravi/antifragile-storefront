"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { productDisplayName } from "@/lib/product-palette";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { ProductImage } from "@/components/ProductImage";
import { Money } from "@/components/Money";
import { themeProductPath } from "@/lib/theme-nav-paths";

type Props = {
  theme: "rays" | "classic";
};

export function CheckoutSummaryLines({ theme }: Props) {
  const { lines } = useCart();

  if (!lines.length) return null;

  return (
    <ul className="space-y-4">
      {lines.map(({ product, quantity }) => {
        const thumb = productPrimaryImageSrc(product);
        const lineTotal = product.salePrice * quantity;
        const href = themeProductPath(theme, product.slug);

        return (
          <li key={product.slug} className="flex gap-3">
            <Link href={href} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
              {thumb ? (
                <ProductImage src={thumb} alt="" sizes="64px" className="h-full w-full object-contain p-1.5" />
              ) : null}
              <span
                className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white"
                aria-label={`Quantity ${quantity}`}
              >
                {quantity}
              </span>
            </Link>
            <div className="min-w-0 flex-1 pt-0.5">
              <Link href={href} className="text-sm font-medium leading-snug hover:underline">
                {productDisplayName(product.name)}
              </Link>
              {product.size ? (
                <p className="mt-0.5 text-xs text-neutral-500">{product.size}</p>
              ) : null}
            </div>
            <div className="shrink-0 pt-0.5 text-sm font-medium tabular-nums">
              {lineTotal === 0 ? (
                <span className="uppercase tracking-wide text-neutral-600">Free</span>
              ) : (
                <Money amount={lineTotal} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
