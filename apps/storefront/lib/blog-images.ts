import type { BlogPost } from "./content-types";

const H = "/images/hero";
const P = "/products";
const M = "/images/marketing";

/**
 * One image per post — heroes for ritual overview; lifestyle stills for single-SKU articles.
 * About page uses marketing collages only (`lib/about-images.ts`).
 */
const BLOG_IMAGE_BY_SLUG: Record<string, string> = {
  "why-barrier-care-matters": `${P}/antifragile-airy-veil-silk-cream-moisturizer-lifestyle-01.png`,
  "gentle-cleanser-basics": `${H}/antifragile-hero-gel-cleanser.png`,
  "renewal-serum-at-night": `${H}/antifragile-hero-renewal-serum.png`,
  "morning-vs-night-routine": `${H}/antifragile-hero-cleanser-moisturizer-serum.png`,
};

const BLOG_IMAGE_ALT: Record<string, string> = {
  "why-barrier-care-matters": "ANTIFRAGILE Airy Whip moisturizer — lifestyle",
  "gentle-cleanser-basics": "ANTIFRAGILE Soft Refresh gel cleanser",
  "renewal-serum-at-night": "ANTIFRAGILE Pre-Shift renewal serum",
  "morning-vs-night-routine": "ANTIFRAGILE full ritual — cleanse, treat, and seal",
};

const BLOG_FALLBACK = `${M}/antifragile-brand-campaign-01.png`;

export function blogPostImage(post: Pick<BlogPost, "slug">): string {
  return BLOG_IMAGE_BY_SLUG[post.slug] ?? BLOG_FALLBACK;
}

export function blogPostImageAlt(post: Pick<BlogPost, "slug" | "title">): string {
  return BLOG_IMAGE_ALT[post.slug] ?? post.title;
}
