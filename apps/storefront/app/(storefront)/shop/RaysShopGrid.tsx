"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/product-types";
import { RaysProductCard } from "@/components/rays/RaysProductCard";
import { RaysCollectionNav } from "@/components/rays/RaysCollectionNav";
import { QuickViewModal } from "@/components/commerce/QuickViewModal";
import { useCart } from "@/lib/cart-context";
import { ShopProductHelp } from "@/components/shop/ShopProductHelp";
import { RaysBundleShowcase } from "@/components/rays/RaysBundleShowcase";
import { ShopSortDropdown } from "@/components/shop/ShopSortDropdown";
import { sortShopProducts, type ShopSortKey } from "@/lib/shop-sort";

const concerns = ["All", "Dryness", "Dullness", "Daily care", "Night routine", "Sensitive skin"] as const;

const SWATCHES: { label: string; color: string }[] = [
  { label: "All", color: "#0A0A0A" },
  { label: "Sensitive", color: "#E8DDD4" },
  { label: "Dry", color: "#7EB8C4" },
  { label: "Combination", color: "#5B4B8A" },
];

const PAGE = 6;

export default function RaysShopGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const { addItem, addBundle, catalog } = useCart();

  const initialCategory = searchParams.get("category");
  const bundleOnly = searchParams.get("bundle") === "1";
  const [concern, setConcern] = useState("All");
  const [skinSwatch, setSkinSwatch] = useState("All");
  const [sort, setSort] = useState<ShopSortKey>("featured");
  const [visible, setVisible] = useState(PAGE);
  const [qv, setQv] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = initialCategory && ["Cleanser", "Moisturizer", "Serum"].includes(initialCategory) ? initialCategory : "All";

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.status === "active");
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (concern !== "All") {
      list = list.filter((p) => p.skinConcerns.some((c) => c.toLowerCase().includes(concern.toLowerCase())));
    }
    if (skinSwatch !== "All") {
      list = list.filter((p) => p.skinTypes.some((t) => t.toLowerCase().includes(skinSwatch.toLowerCase())));
    }
    if (bundleOnly) {
      const sorted = [...list];
      sorted.sort((a, b) => {
        const order = { Cleanser: 0, Serum: 1, Moisturizer: 2 } as const;
        return (order[a.category] ?? 9) - (order[b.category] ?? 9);
      });
      return sorted;
    }
    return sortShopProducts(list, sort);
  }, [products, category, concern, skinSwatch, sort, bundleOnly]);

  useEffect(() => {
    setVisible(PAGE);
  }, [category, concern, skinSwatch, sort, bundleOnly]);

  const shown = filtered.slice(0, visible);
  const recommended = catalog.filter((p) => p.status === "active" && !shown.some((s) => s.slug === p.slug)).slice(0, 3);

  return (
    <div className="mt-8">
      <h1 className="font-rays text-5xl font-extrabold uppercase md:text-6xl">{bundleOnly ? "Bundles" : "Shop"}</h1>
      <p className="mt-4 max-w-xl text-rays-gray">
        {bundleOnly
          ? "Curated sets — cleanse & seal, cleanse & treat, treat & seal, and full ritual."
          : "Filtering, swatches, quick view, load more, and cross-sell—Rays product discovery parity."}
      </p>

      <div className="mt-10">
        <RaysCollectionNav />
      </div>

      {bundleOnly && (
        <RaysBundleShowcase products={products} onAddBundle={addBundle} />
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-rays-gray">{filtered.length} products</p>
        <div className="flex flex-wrap items-center gap-4">
          {!bundleOnly && <ShopSortDropdown value={sort} onChange={setSort} />}
          <button type="button" className="text-xs font-bold uppercase lg:hidden" onClick={() => setFiltersOpen(true)}>
            Filters
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-10">
        <aside className="hidden w-52 shrink-0 space-y-8 lg:block">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">Concern</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {concerns.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConcern(c)}
                  className={`border-2 px-3 py-1 text-xs font-bold uppercase ${
                    concern === c ? "border-rays-black bg-rays-black text-rays-accent" : "border-rays-line"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">Skin type</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SWATCHES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSkinSwatch(s.label)}
                  className={`flex items-center gap-2 border-2 px-3 py-1 text-xs font-bold uppercase ${
                    skinSwatch === s.label ? "border-rays-black bg-rays-black text-rays-accent" : "border-rays-line"
                  }`}
                >
                  {s.label !== "All" && <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {!bundleOnly && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">Sort</p>
              <div className="mt-3">
                <ShopSortDropdown value={sort} onChange={setSort} menuAlign="left" />
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1">
          {bundleOnly && (
            <h2 className="mb-8 font-rays text-2xl font-extrabold uppercase">Individual products</h2>
          )}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <RaysProductCard key={p.id} product={p} quickAdd={() => addItem(p, 1)} onQuickView={() => setQv(p)} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisible((n) => n + PAGE)}
                className="border-2 border-rays-black bg-rays-accent px-12 py-4 text-xs font-bold uppercase tracking-widest"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>

      {recommended.length > 0 && (
        <section className="mt-20 border-t-2 border-rays-black pt-16">
          <h2 className="font-rays text-3xl font-extrabold uppercase">You may also like</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {recommended.map((p) => (
              <RaysProductCard
                key={p.id}
                product={p}
                quickAdd={() => addItem(p, 1)}
                onQuickView={() => setQv(p)}
              />
            ))}
          </div>
        </section>
      )}

      <QuickViewModal product={qv} onClose={() => setQv(null)} />

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-rays-white p-6">
            <p className="font-rays text-2xl font-bold uppercase">Filters</p>
            {!bundleOnly && (
              <div className="mt-6 border-t border-rays-line pt-6">
                <ShopSortDropdown value={sort} onChange={setSort} />
              </div>
            )}
            <button type="button" className="mt-6 text-xs font-bold uppercase" onClick={() => setFiltersOpen(false)}>
              Apply
            </button>
          </div>
        </div>
      )}

      <ShopProductHelp variant="rays" />
    </div>
  );
}
