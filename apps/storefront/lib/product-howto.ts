import type { Product } from "./product-types";
import { isHowToImageSrc } from "./product-images";

/** Application stills for the dedicated How to use section (not the main gallery). */
export function productHowToImages(product: Product): string[] {
  if (product.howToImages?.length) return product.howToImages;
  return (product.gallery ?? []).filter((src) => isHowToImageSrc(src));
}

export function productHasHowToSection(product: Product): boolean {
  return productHowToImages(product).length > 0 || Boolean(product.videoUrl?.trim().startsWith("https://"));
}
