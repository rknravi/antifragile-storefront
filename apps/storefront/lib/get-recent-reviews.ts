import { prisma } from "@/lib/prisma";

export type HomeReview = {
  id: string;
  productSlug: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  createdAt: Date;
};

const FALLBACK_REVIEWS: HomeReview[] = [
  {
    id: "fallback-1",
    productSlug: "soft-refresh-gel-cleanser",
    rating: 5,
    title: "Finally a routine I can keep.",
    body: "Gentle cleanse without tightness—exactly what I wanted for daily use.",
    authorName: "A., Mumbai",
    createdAt: new Date(),
  },
  {
    id: "fallback-2",
    productSlug: "pre-shift-renewal-serum",
    rating: 5,
    title: "Serum + moisturizer is my holy grail.",
    body: "Layers well and skin feels smoother after a few weeks.",
    authorName: "R., Bengaluru",
    createdAt: new Date(),
  },
  {
    id: "fallback-3",
    productSlug: "airy-whip-silk-cream-moisturizer",
    rating: 5,
    title: "Gentle cleanser, no tight feeling.",
    body: "Light texture, works morning and night under SPF.",
    authorName: "S., Hyderabad",
    createdAt: new Date(),
  },
];

export async function getRecentReviews(limit = 6): Promise<HomeReview[]> {
  if (!process.env.DATABASE_URL) return FALLBACK_REVIEWS.slice(0, limit);
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        productSlug: true,
        rating: true,
        title: true,
        body: true,
        authorName: true,
        createdAt: true,
      },
    });
    if (reviews.length === 0) return FALLBACK_REVIEWS.slice(0, limit);
    return reviews;
  } catch {
    return FALLBACK_REVIEWS.slice(0, limit);
  }
}
