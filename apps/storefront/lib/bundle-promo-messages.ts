import type { Product } from "@/lib/product-types";
import { bundleShopHref } from "@/lib/site-nav";
import { ROUTINE_BUNDLES, getBundlePricing } from "@/lib/routine-bundles";

export type AnnouncementSlide = {
  id: string;
  text: string;
  href?: string;
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Rotating top-bar / PDP promo lines — includes ritual bundle savings when catalog is available. */
export function buildAnnouncementSlides(products: Product[], shopHref: string): AnnouncementSlide[] {
  const bundlePage = bundleShopHref(shopHref);
  const slides: AnnouncementSlide[] = [
    {
      id: "launch10",
      text: "Limited time — LAUNCH10 · 10% off at checkout",
    },
    {
      id: "ship",
      text: "Free shipping on orders ₹999+",
    },
  ];

  for (const meta of ROUTINE_BUNDLES) {
    const pricing = getBundlePricing(products, meta.id);
    if (!pricing || pricing.savings <= 0) continue;

    const shortTitle = meta.title.replace(/\s+bundle$/i, "");
    slides.push({
      id: meta.id,
      text: `${shortTitle} bundle — save ${formatInr(pricing.savings)} · ${formatInr(pricing.bundlePrice)} ritual set`,
      href: bundlePage,
    });
  }

  slides.push({
    id: "all-bundles",
    text: "Shop ritual bundles — cleanse · treat · seal · automatic savings in cart",
    href: bundlePage,
  });

  return slides;
}
