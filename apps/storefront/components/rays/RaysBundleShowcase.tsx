"use client";

import Link from "next/link";
import type { Product } from "@/lib/product-types";
import { Money } from "@/components/Money";
import { RoutineBundleImage } from "@/components/commerce/RoutineBundleImage";
import { ROUTINE_BUNDLES, getBundlePricing, type RoutineBundleId } from "@/lib/routine-bundles";
import { raysPath } from "@/lib/theme-paths";
import { themeProductPath } from "@/lib/theme-nav-paths";
import { ShareLinkBar } from "@/components/commerce/ShareLinkBar";

export function RaysBundleShowcase({
  products,
  onAddBundle,
}: {
  products: Product[];
  onAddBundle: (bundleId: RoutineBundleId) => void;
}) {
  return (
    <div className="mt-12 grid gap-8 sm:grid-cols-2">
      {ROUTINE_BUNDLES.map((bundle) => {
        const pricing = getBundlePricing(products, bundle.id);
        if (!pricing) return null;

        const { items, compareAt, bundlePrice, savings } = pricing;

        return (
          <article
            key={bundle.id}
            className="flex flex-col overflow-hidden rounded-3xl border-2 border-rays-black bg-rays-white shadow-[6px_6px_0_#0A0A0A]"
          >
            <RoutineBundleImage
              products={items}
              fallbackSrc={bundle.imageSrc}
              size="lg"
              className="rounded-none border-b-2 border-rays-black"
            />
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-rays-accent">Bundle</p>
              <h2 className="mt-1 font-rays text-2xl font-extrabold uppercase leading-tight">{bundle.title}</h2>
              <p className="mt-2 flex-1 text-sm text-rays-gray">{bundle.subtitle}</p>

              <ul className="mt-4 divide-y divide-rays-line/60 border-y border-rays-line/60">
                {items.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-3 py-3 first:pt-3 last:pb-3">
                    <Link
                      href={themeProductPath("rays", p.slug)}
                      className="min-w-0 text-xs font-semibold uppercase leading-snug text-rays-black underline decoration-rays-accent/40 hover:text-rays-accent"
                    >
                      {p.name.replace(/^ANTIFRAGILE\s*/i, "")}
                    </Link>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-rays-black">
                      <Money amount={p.salePrice} />
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl bg-rays-cream/80 px-4 py-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-base text-rays-gray line-through decoration-rays-gray/80">
                    <Money amount={compareAt} />
                  </span>
                  <span className="text-2xl font-bold text-rays-accent">
                    <Money amount={bundlePrice} />
                  </span>
                </div>
                {savings > 0 && (
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
                    <Money amount={savings} /> bundle discount
                  </p>
                )}
              </div>

              <ShareLinkBar
                path={`${raysPath("/shop")}?bundle=1`}
                title={bundle.title}
                text={bundle.subtitle}
                variant="compact"
                label="Share bundle"
                className="mt-5"
              />

              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => onAddBundle(bundle.id)}
                className="mt-6 w-full rounded-full bg-rays-accent px-4 py-3 text-xs font-bold uppercase tracking-widest text-rays-white transition hover:opacity-90 disabled:opacity-50"
              >
                Add bundle — <Money amount={bundlePrice} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
