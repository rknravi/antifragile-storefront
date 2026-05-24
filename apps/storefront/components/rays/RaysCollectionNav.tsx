"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { raysPath } from "@/lib/theme-paths";

const collections = [
  { key: "All", href: raysPath("/shop"), mode: "all" as const },
  { key: "Bundles", href: raysPath("/shop?bundle=1"), mode: "bundle" as const },
  { key: "Cleanser", href: raysPath("/shop?category=Cleanser"), mode: "category" as const, category: "Cleanser" },
  { key: "Serum", href: raysPath("/shop?category=Serum"), mode: "category" as const, category: "Serum" },
  { key: "Moisturizer", href: raysPath("/shop?category=Moisturizer"), mode: "category" as const, category: "Moisturizer" },
];

/** Collection page navigation — Rays product discovery. */
export function RaysCollectionNav() {
  const searchParams = useSearchParams();
  const cat = searchParams.get("category");
  const bundleOnly = searchParams.get("bundle") === "1";

  return (
    <nav aria-label="Collections" className="flex flex-wrap gap-2 border-b-2 border-rays-black pb-4">
      {collections.map((c) => {
        const active =
          c.mode === "bundle"
            ? bundleOnly && !cat
            : c.mode === "all"
              ? !bundleOnly && !cat
              : !bundleOnly && cat === c.category;
        return (
          <Link
            key={c.key}
            href={c.href}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${
              active ? "bg-rays-black text-rays-accent" : "border-2 border-rays-black hover:bg-rays-surface"
            }`}
          >
            {c.key}
          </Link>
        );
      })}
    </nav>
  );
}
