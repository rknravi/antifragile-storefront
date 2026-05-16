import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductBadges } from "./ProductBadges";
import { ProductImage } from "./ProductImage";

function gradientForCategory(cat: Product["category"]) {
  if (cat === "Cleanser") return "from-[#1E4A6E] to-[#3A7CA5]";
  if (cat === "Moisturizer") return "from-[#7EB8C4] to-[#B8DDE6]";
  return "from-[#5B4B8A] to-[#8B7CB8]";
}

function formatPrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({
  product,
  quickAdd,
}: {
  product: Product;
  quickAdd?: () => void;
}) {
  const salePrice = formatPrice(product.salePrice);
  const mrp = formatPrice(product.mrp);
  const displayPrice = salePrice ?? mrp;
  const imgSrc = product.thumbnail ?? product.image;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {imgSrc ? (
          <ProductImage
            src={imgSrc}
            alt={product.name}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradientForCategory(product.category)}`}
          />
        )}

        <div className="absolute left-3 top-3 z-10">
          <ProductBadges badges={product.badges ?? []} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
          {product.category}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 transition group-hover:text-slate-700">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div className="flex items-end gap-2">
            {displayPrice ? (
              <span className="text-base font-semibold text-neutral-900">{displayPrice}</span>
            ) : null}

            {salePrice && mrp ? (
              <span className="pb-0.5 text-sm text-neutral-400 line-through">{mrp}</span>
            ) : null}
          </div>

          {quickAdd ? (
            <button
              type="button"
              onClick={quickAdd}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}