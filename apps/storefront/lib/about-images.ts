/**
 * About page — marketing only (blog uses `/images/hero` model shots).
 * Two scenes: full ritual lineup + singles/duo collage (no second trio lineup).
 */
const M = "/images/marketing";

export const ABOUT_GALLERY = [
  {
    src: `${M}/antifragile-brand-campaign-01.png`,
    alt: "ANTIFRAGILE cleanser, moisturizer, and serum — full ritual",
    caption: "Cleanser · moisturizer · serum",
  },
  {
    src: `${M}/antifragile-ritual-collage-02.png`,
    alt: "ANTIFRAGILE singles and duo routine pairings",
    caption: "Singles & duo pairings",
  },
] as const;
