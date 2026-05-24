import type { Product } from "@/lib/product-types";
import { getCategoryPalette } from "@/lib/product-palette";

export function ProductCategoryPill({
  category,
  className = "",
}: {
  category: Product["category"];
  className?: string;
}) {
  const p = getCategoryPalette(category);
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${className}`}
      style={{ backgroundColor: p.primary, color: p.textOn }}
    >
      {p.routineLabel}
    </span>
  );
}
