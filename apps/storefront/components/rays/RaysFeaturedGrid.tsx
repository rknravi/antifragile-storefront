"use client";

import { useState } from "react";
import type { Product } from "@/lib/product-types";
import { RaysProductCard } from "./RaysProductCard";
import { QuickViewModal } from "@/components/commerce/QuickViewModal";
import { useCart } from "@/lib/cart-context";

export function RaysFeaturedGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const [qv, setQv] = useState<Product | null>(null);

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <RaysProductCard key={p.id} product={p} quickAdd={() => addItem(p, 1)} onQuickView={() => setQv(p)} />
        ))}
      </div>
      <QuickViewModal product={qv} onClose={() => setQv(null)} variant="rays" />
    </>
  );
}
