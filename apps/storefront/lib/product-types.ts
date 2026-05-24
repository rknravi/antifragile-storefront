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
  /** Extra PDP / gallery angles (high-res, zoom) */
  gallery?: string[];
  /** Second image shown on card hover (image rollover) */
  hoverImage?: string;
  /** Product usage / how-to video URL (mp4 or embed) */
  videoUrl?: string;
  videoPoster?: string;
  /** Before/after comparison slider */
  beforeAfter?: { before: string; after: string; label?: string };
  /** Show low-stock urgency below this count */
  lowStockThreshold?: number;
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
