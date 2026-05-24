"use client";

import type { Product } from "@/lib/product-types";
import { RoutineLookbookScene } from "@/components/commerce/RoutineLookbookScene";
import { brandMarketing } from "@/lib/brand-images";

export function RaysLookbookHotspot({ products }: { products: Product[] }) {
  return (
    <RoutineLookbookScene
      products={products}
      backgroundSrc={brandMarketing.heroAtmosphere}
      theme="rays"
      title="Shop the routine"
      subtitle="Natural ritual setting — tap + on each step to explore cleanser, serum, and moisturizer."
    />
  );
}
