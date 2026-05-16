export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-barrier-care-matters",
    title: "Why barrier care matters in humid climates",
    excerpt: "Hydration is not heaviness—how to layer without suffocating skin.",
    date: "2026-05-01",
    body: [
      "Barrier-friendly routines prioritize comfort first. Start with a gentle cleanser, add targeted treatment at night, and seal with a moisturizer that feels wearable in heat.",
      "Introduce actives slowly—two to three nights per week—then scale as tolerance builds.",
    ],
  },
  {
    slug: "morning-vs-night-routine",
    title: "Morning vs night: what actually changes",
    excerpt: "SPF by day, renewal by night—simple guardrails for beginners.",
    date: "2026-04-18",
    body: [
      "Morning is about protection and prep: cleanse, hydrate, then SPF.",
      "Night is for renewal: cleanse, serum (as directed), then moisturizer.",
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
