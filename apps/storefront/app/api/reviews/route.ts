import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveProducts } from "@/lib/get-catalog";
import { computeReviewSummary } from "@/lib/review-stats";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug || slug.length > 120) {
    return NextResponse.json({ error: "Missing or invalid slug." }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ reviews: [], summary: null });
  }
  try {
    const reviews = await prisma.review.findMany({
      where: { productSlug: slug },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        authorName: true,
        createdAt: true,
      },
    });
    const summary = computeReviewSummary(reviews.map((r) => r.rating));
    return NextResponse.json({ reviews, summary });
  } catch {
    return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: { slug?: string; rating?: number; title?: string; body?: string; authorName?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const rating = Number(body.rating);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "Customer";

  if (!slug || slug.length > 120) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  }
  if (title.length < 2 || title.length > 120) {
    return NextResponse.json({ error: "Title must be 2–120 characters." }, { status: 400 });
  }
  if (text.length < 10 || text.length > 2000) {
    return NextResponse.json({ error: "Review must be 10–2000 characters." }, { status: 400 });
  }
  if (authorName.length > 80) {
    return NextResponse.json({ error: "Name too long." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Reviews require DATABASE_URL (PostgreSQL)." }, { status: 503 });
  }

  try {
    const catalog = await getActiveProducts();
    if (!catalog.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "Unknown product slug." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: { productSlug: slug, rating, title, body: text, authorName },
    });
    return NextResponse.json({ ok: true, id: review.id });
  } catch {
    return NextResponse.json({ error: "Could not save review." }, { status: 500 });
  }
}
