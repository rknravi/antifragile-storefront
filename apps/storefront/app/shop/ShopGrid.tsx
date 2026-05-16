"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart-context";

type SortKey = "newest" | "price-asc" | "price-desc" | "bestseller";

const categories = ["All", "Cleanser", "Moisturizer", "Serum"] as const;
const concerns = ["All", "Dryness", "Dullness", "Daily care", "Night routine", "Sensitive skin"] as const;
const usage = ["All", "Morning", "Night", "Both"] as const;

export default function ShopGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialConcern = searchParams.get("concern");
  const { addItem } = useCart();

  const [category, setCategory] = useState<string>("All");
  const [concern, setConcern] = useState<string>(
    initialConcern && concerns.includes(initialConcern as (typeof concerns)[number])
      ? initialConcern
      : "All"
  );
  const [usageFilter, setUsageFilter] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [drawer, setDrawer] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.status === "active");

    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (concern !== "All") {
      list = list.filter((p) =>
        p.skinConcerns.some((c) => c.toLowerCase().includes(concern.toLowerCase()))
      );
    }
    if (usageFilter !== "All") {
      list = list.filter((p) => {
        const u = p.usageTime;
        if (usageFilter === "Both") return u.includes("Morning") && u.includes("Night");
        return u.includes(usageFilter as "Morning" | "Night");
      });
    }

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.salePrice - b.salePrice);
    if (sort === "price-desc") sorted.sort((a, b) => b.salePrice - a.salePrice);
    if (sort === "bestseller") {
      sorted.sort((a, b) => {
        const score = (p: Product) => (p.badges.includes("Bestseller") ? 1 : 0);
        return score(b) - score(a);
      });
    }
    return sorted;
  }, [category, concern, usageFilter, sort, products]);

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                category === c
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Skin concern</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {concerns.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setConcern(c)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                concern === c
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Usage</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {usage.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setUsageFilter(c)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                usageFilter === c
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Sort</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="bestseller">Best sellers</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl text-neutral-900">Shop</h1>
          <p className="mt-2 text-neutral-600">/shop · Filter by category, concern, and usage.</p>
        </div>
        <button
          type="button"
          className="md:hidden rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold"
          onClick={() => setDrawer(true)}
        >
          Filters
        </button>
      </div>

      <div className="mt-10 flex gap-10">
        <aside className="hidden w-64 shrink-0 md:block">{FilterPanel}</aside>

        <div className="flex-1">
          <p className="text-sm text-neutral-500">{filtered.length} products</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} quickAdd={() => addItem(p, 1)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-10 text-neutral-600">No products match these filters.</p>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Filters</p>
              <button type="button" className="text-sm text-neutral-600" onClick={() => setDrawer(false)}>
                Done
              </button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
