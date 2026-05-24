import type { Product } from "@/lib/product-types";
import type { CategoryPalette } from "@/lib/product-palette";

/** Single SKU size — always shown as selected (no multi-size picker). */
export function ProductSizeDisplay({
  product,
  palette,
}: {
  product: Product;
  palette: CategoryPalette;
}) {
  const label = product.size.trim();
  if (!label) return null;

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-neutral-800">Size</p>
      <div className="mt-2">
        <span
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: palette.primary, color: palette.textOn }}
          aria-current="true"
        >
          <span aria-hidden>✓</span>
          {label}
        </span>
      </div>
    </div>
  );
}
