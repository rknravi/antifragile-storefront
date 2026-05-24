"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getRecentlyViewedSlugs, resolveRecentlyViewed } from "@/lib/recently-viewed";
import { RaysProductCard } from "./RaysProductCard";

export function RaysRecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const { catalog } = useCart();
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getRecentlyViewedSlugs().filter((s) => s !== excludeSlug));
  }, [excludeSlug]);

  const products = resolveRecentlyViewed(catalog, slugs).slice(0, 4);
  if (!products.length) return null;

  return (
    <section className="border-t-2 border-rays-black bg-rays-surface py-16">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <h2 className="font-rays text-3xl font-extrabold uppercase">Recently viewed</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <RaysProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
