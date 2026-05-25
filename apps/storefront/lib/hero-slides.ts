import { raysPath } from "@/lib/theme-paths";
import { bundleShopHref } from "@/lib/site-nav";

export type HeroSlide = {
  id: string;
  /** Right-column figure from /public/images/hero/ */
  figureSrc: string;
  figureStyle: "pack" | "scene";
  step: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
};

const shop = raysPath("/shop");
const H = "/images/hero";

/** Matches Antifragile-Pics/antifragile-hero-*.png — run npm run import:hero to sync. */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "full-ritual",
    figureSrc: `${H}/antifragile-hero-cleanser-moisturizer-serum.png`,
    figureStyle: "scene",
    step: "Full ritual",
    title: "Cleanse · treat · seal",
    sub: "Premium skincare for stronger skin — the complete ANTIFRAGILE trio.",
    cta: "Shop the ritual",
    href: bundleShopHref(shop),
  },
  {
    id: "cleanse-seal",
    figureSrc: `${H}/antifragile-hero-cleanser-moisturizer.png`,
    figureStyle: "scene",
    step: "Cleanse & seal",
    title: "Morning essentials",
    sub: "Soft Refresh gel cleanser + Airy Whip moisturizer — start the day resilient.",
    cta: "View bundle",
    href: bundleShopHref(shop),
  },
  {
    id: "cleanse-treat",
    figureSrc: `${H}/antifragile-hero-cleanser-serum.png`,
    figureStyle: "scene",
    step: "Cleanse & treat",
    title: "Evening reset",
    sub: "Cleanse away the day, then layer Pre-Shift renewal serum.",
    cta: "View bundle",
    href: bundleShopHref(shop),
  },
  {
    id: "treat-seal",
    figureSrc: `${H}/antifragile-hero-serum-moisturizer.png`,
    figureStyle: "scene",
    step: "Treat & seal",
    title: "Layer & lock in",
    sub: "Pre-Shift renewal serum + Airy Whip moisturizer to lock in hydration.",
    cta: "View bundle",
    href: bundleShopHref(shop),
  },
  {
    id: "renewal-serum",
    figureSrc: `${H}/antifragile-hero-renewal-serum.png`,
    figureStyle: "scene",
    step: "Treat",
    title: "Pre-Shift renewal serum",
    sub: "Night-forward renewal for smoother, more even-looking skin.",
    cta: "Shop serum",
    href: raysPath("/products/pre-shift-renewal-serum"),
  },
  {
    id: "cream-moisturizer",
    figureSrc: `${H}/antifragile-hero-cream-moisturizer.png`,
    figureStyle: "scene",
    step: "Seal",
    title: "Airy Whip silk cream",
    sub: "Featherlight hydration with barrier-friendly silk cream comfort.",
    cta: "Shop moisturizer",
    href: raysPath("/products/airy-whip-silk-cream-moisturizer"),
  },
  {
    id: "gel-cleanser",
    figureSrc: `${H}/antifragile-hero-gel-cleanser.png`,
    figureStyle: "scene",
    step: "Cleanse",
    title: "Soft Refresh gel cleanser",
    sub: "A gentle daily gel cleanse for refreshed, resilient skin.",
    cta: "Shop cleanser",
    href: raysPath("/products/soft-refresh-gel-cleanser"),
  },
];
