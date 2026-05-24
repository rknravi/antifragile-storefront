import type { Product } from "@/lib/product-types";
import { productPrimaryImageSrc } from "@/lib/product-images";

export type RoutineTrio = {
  cleanser?: Product;
  moisturizer?: Product;
  serum?: Product;
};

export type RoutinePlacement = {
  id: "cleanser" | "serum" | "moisturizer";
  label: string;
  product: Product;
  /** Product image anchor (% of scene) */
  imgTop: string;
  imgLeft: string;
  imgWidth: string;
  /** + hotspot (% of scene) */
  spotTop: string;
  spotLeft: string;
};

export function getRoutineTrio(products: Product[]): RoutineTrio {
  const active = products.filter((p) => p.status === "active");
  return {
    cleanser: active.find((p) => p.category === "Cleanser"),
    moisturizer: active.find((p) => p.category === "Moisturizer"),
    serum: active.find((p) => p.category === "Serum"),
  };
}

/** Product image for lookbook overlays and other composited scenes. */
export function productAssetSrc(product: Product): string {
  return productPrimaryImageSrc(product);
}

export function buildRoutinePlacements(trio: RoutineTrio): RoutinePlacement[] {
  const out: RoutinePlacement[] = [];
  if (trio.cleanser) {
    out.push({
      id: "cleanser",
      label: "Cleanser",
      product: trio.cleanser,
      imgTop: "62%",
      imgLeft: "26%",
      imgWidth: "min(32vw, 220px)",
      spotTop: "42%",
      spotLeft: "26%",
    });
  }
  if (trio.serum) {
    out.push({
      id: "serum",
      label: "Serum",
      product: trio.serum,
      imgTop: "58%",
      imgLeft: "50%",
      imgWidth: "min(30vw, 200px)",
      spotTop: "36%",
      spotLeft: "50%",
    });
  }
  if (trio.moisturizer) {
    out.push({
      id: "moisturizer",
      label: "Moisturizer",
      product: trio.moisturizer,
      imgTop: "64%",
      imgLeft: "74%",
      imgWidth: "min(32vw, 220px)",
      spotTop: "44%",
      spotLeft: "74%",
    });
  }
  return out;
}
