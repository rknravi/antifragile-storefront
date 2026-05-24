/** Local ANTIFRAGILE imagery under /public — no third-party stock URLs. */

/** Product-free beach/light texture for hero & lookbook (legacy rays-media hero). */
export const HERO_ATMOSPHERE_SRC =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80&auto=format&fit=crop";

export const BRAND_IMAGES = {
  cleanseSealBundle: "/images/antifragile-cleanse-seal-bundle.png",
  cleanseTreatBundle: "/images/antifragile-cleanse-treat-bundle.png",
  fullRitualBundle: "/images/antifragile-full-ritual-bundle.png",
  cleanser: "/products/antifragile-soft-refresh-gel-cleanser.png",
  serum: "/products/antifragile-pre-shift-renewal-serum.png",
  moisturizer: "/products/antifragile-airy-veil-silk-cream-moisturizer.png",
} as const;

/** Section imagery (hero, blog, collections, about, press). */
export const brandMarketing = {
  heroAtmosphere: HERO_ATMOSPHERE_SRC,
  press: BRAND_IMAGES.fullRitualBundle,
  collectionSun: BRAND_IMAGES.cleanser,
  collectionTreat: BRAND_IMAGES.fullRitualBundle,
  blogFeatured: BRAND_IMAGES.fullRitualBundle,
  blog1: BRAND_IMAGES.fullRitualBundle,
  blog2: BRAND_IMAGES.fullRitualBundle,
  about1: BRAND_IMAGES.cleanser,
  about2: BRAND_IMAGES.serum,
  about3: BRAND_IMAGES.moisturizer,
  about4: BRAND_IMAGES.fullRitualBundle,
  about5: BRAND_IMAGES.fullRitualBundle,
  about6: BRAND_IMAGES.moisturizer,
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
