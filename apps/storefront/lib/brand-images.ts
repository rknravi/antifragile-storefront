import { BUNDLE_HERO } from "@/lib/routine-bundles";

/** Local ANTIFRAGILE imagery under /public — no third-party stock URLs. */

/** Product-free beach/light texture for hero & lookbook (legacy rays-media hero). */
export const HERO_ATMOSPHERE_SRC =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80&auto=format&fit=crop";

export const BRAND_IMAGES = {
  /** Bundle heroes — aligned with `BUNDLE_HERO` / homepage slides. */
  cleanseSealBundle: BUNDLE_HERO.cleanseSeal,
  cleanseTreatBundle: BUNDLE_HERO.cleanseTreat,
  treatSealBundle: BUNDLE_HERO.treatSeal,
  fullRitualBundle: BUNDLE_HERO.fullRitual,
  cleanser: "/products/antifragile-soft-refresh-gel-cleanser.png",
  serum: "/products/antifragile-pre-shift-renewal-serum.png",
  moisturizer: "/products/antifragile-airy-veil-silk-cream-moisturizer.png",
} as const;

const M = "/images/marketing";

/** Section imagery (hero, blog, collections, about, press). */
export const brandMarketing = {
  heroAtmosphere: HERO_ATMOSPHERE_SRC,
  press: `${M}/antifragile-brand-campaign-01.png`,
  collectionSun: `${M}/antifragile-ritual-lineup-01.png`,
  collectionTreat: `${M}/antifragile-ritual-collage-01.png`,
  blogFeatured: `${M}/antifragile-brand-campaign-01.png`,
} as const;

export const RAYS_POPULAR_SEARCHES = [
  "Cleanser",
  "Serum",
  "Moisturizer",
  "Morning routine",
  "Night routine",
  "Cleanse & seal",
  "Cleanse & treat",
  "Treat & seal",
  "Full ritual",
] as const;
