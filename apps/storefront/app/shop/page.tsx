import { Suspense } from "react";
import ShopGrid from "./ShopGrid";
import { getActiveProducts } from "@/lib/get-catalog";

export const metadata = {
  title: "Shop",
  description: "Browse ANTIFRAGILE cleansers, moisturizers, and serums.",
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-neutral-500">Loading shop…</div>}>
      <ShopGrid products={products} />
    </Suspense>
  );
}
