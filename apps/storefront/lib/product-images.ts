import type { Product } from "@/lib/product-types";

const LOCAL_PRODUCT_PREFIX = "/products/";

/** Site-relative pack shots under /public/products (PNG, WebP, JPG, or legacy SVG placeholders). */
export function isLocalProductAsset(src: string | undefined): boolean {
  return !!src && src.startsWith(LOCAL_PRODUCT_PREFIX);
}

/** Legacy vector placeholders — prefer antifragile-*.png in catalog when available. */
export function isPlaceholderSvg(src: string | undefined): boolean {
  return !!src && isLocalProductAsset(src) && src.endsWith(".svg");
}

function localAssets(product: Product): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (url?: string) => {
    if (!url || !isLocalProductAsset(url) || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };
  push(product.image);
  push(product.thumbnail);
  product.gallery?.forEach(push);
  push(product.hoverImage);
  return out;
}

/** Pack shot for grids, cart, mega menu — always prefer ANTIFRAGILE /products assets. */
export function productPrimaryImageSrc(product: Product): string {
  const local = localAssets(product);
  if (local.length) return local[0];

  const remote = [product.image, product.thumbnail, product.hoverImage, ...(product.gallery ?? []), product.videoPoster];
  for (const c of remote) {
    if (c?.startsWith("https://")) return c;
  }
  return "";
}

/** Card hover: second local angle if present, else primary. */
export function productCardImageSrc(product: Product, hovered = false): string {
  const primary = productPrimaryImageSrc(product);
  if (!hovered) return primary;

  const local = localAssets(product);
  const alt = local.find((u) => u !== primary);
  if (alt) return alt;

  const hover = product.hoverImage;
  if (hover?.startsWith("https://") && hover !== primary) return hover;
  return primary;
}

/** PDP gallery: branded pack shots first; optional remote lifestyle last. */
export function productGalleryImages(product: Product): string[] {
  const seen = new Set<string>();
  const local: string[] = [];
  const remote: string[] = [];
  const push = (url?: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    if (isLocalProductAsset(url)) local.push(url);
    else remote.push(url);
  };
  push(product.image);
  push(product.thumbnail);
  product.gallery?.forEach(push);
  push(product.hoverImage);
  push(product.videoPoster);
  return [...local, ...remote];
}
