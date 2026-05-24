"use client";

import type { Product } from "@/lib/product-types";
import type { StoreTheme } from "@/lib/theme-paths";
import { ProductShareBar } from "@/components/commerce/ProductShareBar";

export function ProductShare({
  product,
  accent,
  theme = "rays",
}: {
  product: Product;
  accent?: string;
  theme?: StoreTheme;
}) {
  const rays = theme === "rays";

  return (
    <div className={rays ? "mt-10 border-t-2 border-rays-line pt-6" : "mt-10 border-t border-black/10 pt-6"}>
      <ProductShareBar
        product={product}
        theme={theme}
        variant={rays ? "rays" : "classic"}
        accent={accent}
        label="Share this product"
      />
    </div>
  );
}
