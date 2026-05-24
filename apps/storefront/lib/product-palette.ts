import type { Product } from "@/lib/product-types";

/** Colors derived from ANTIFRAGILE product art (cleanser blue, moisturizer aqua, serum violet). */
export type CategoryPalette = {
  primary: string;
  secondary: string;
  light: string;
  mist: string;
  gradient: string;
  gradientSoft: string;
  textOn: string;
  routineLabel: string;
};

export const CATEGORY_PALETTE: Record<Product["category"], CategoryPalette> = {
  Cleanser: {
    primary: "#1E4A6E",
    secondary: "#3A7CA5",
    light: "#E8F4F8",
    mist: "#D4EEF5",
    gradient: "linear-gradient(135deg, #1E4A6E 0%, #3A7CA5 100%)",
    gradientSoft: "linear-gradient(160deg, rgba(30,74,110,0.14) 0%, rgba(58,124,165,0.08) 100%)",
    textOn: "#FFFFFF",
    routineLabel: "Cleanse",
  },
  Moisturizer: {
    primary: "#5A9BA8",
    secondary: "#7EB8C4",
    light: "#EFF8FA",
    mist: "#D8EEF3",
    gradient: "linear-gradient(135deg, #5A9BA8 0%, #B8DDE6 100%)",
    gradientSoft: "linear-gradient(160deg, rgba(126,184,196,0.18) 0%, rgba(184,221,230,0.1) 100%)",
    textOn: "#1A3A42",
    routineLabel: "Seal",
  },
  Serum: {
    primary: "#5B4B8A",
    secondary: "#8B7CB8",
    light: "#F3F0F8",
    mist: "#E8E2F2",
    gradient: "linear-gradient(135deg, #5B4B8A 0%, #8B7CB8 100%)",
    gradientSoft: "linear-gradient(160deg, rgba(91,75,138,0.14) 0%, rgba(139,124,184,0.08) 100%)",
    textOn: "#FFFFFF",
    routineLabel: "Treat",
  },
};

export function getCategoryPalette(category: Product["category"]): CategoryPalette {
  return CATEGORY_PALETTE[category];
}

export function getProductPalette(product: Pick<Product, "category" | "slug">): CategoryPalette {
  return getCategoryPalette(product.category);
}

/** Strip brand prefix for cleaner product titles in cards. */
export function productDisplayName(name: string): string {
  return name.replace(/^ANTIFRAGILE\s*/i, "").trim() || name;
}

export function productShortLabel(product: Pick<Product, "category" | "size">): string {
  return `${getCategoryPalette(product.category).routineLabel} · ${product.size}`;
}
