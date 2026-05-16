export type ProductBadge = "New" | "Bestseller" | "Bundle" | "Launch Offer";

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  /** Site-relative path (e.g. `/products/slug.jpg`) or `https://` CDN URL */
  image?: string;
  /** Optional smaller image for grids/cart; defaults to `image` in UI */
  thumbnail?: string;
  category: "Cleanser" | "Moisturizer" | "Serum";
  shortDescription: string;
  longDescription: string;
  size: string;
  mrp: number;
  salePrice: number;
  currency: "INR";
  inventoryQuantity: number;
  skinTypes: string[];
  skinConcerns: string[];
  usageTime: ("Morning" | "Night" | "Both")[];
  ingredients: string[];
  howToUse: string[];
  warnings: string[];
  badges: ProductBadge[];
  benefits: string[];
  howItWorks: string;
  texture: string;
  routinePairing: { slug: string; label: string }[];
  seoTitle: string;
  seoDescription: string;
  status: "active" | "draft" | "archived";
};
