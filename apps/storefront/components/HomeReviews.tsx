import Link from "next/link";
import { getRecentReviews } from "@/lib/get-recent-reviews";

export async function HomeReviews() {
  const reviews = await getRecentReviews(6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h2 className="font-display text-3xl text-neutral-900">Customer reviews</h2>
      <p className="mt-2 text-sm text-neutral-600">
        From verified product pages
        {process.env.DATABASE_URL ? "" : " (sample quotes until DATABASE_URL is set)"}.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <blockquote
            key={r.id}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-amber-700">{"★".repeat(r.rating)}</p>
            <p className="mt-2 font-medium text-neutral-900">{r.title}</p>
            <p className="mt-2 line-clamp-3 text-sm text-neutral-700">{r.body}</p>
            <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
              <span>{r.authorName}</span>
              <Link
                href={`/products/${encodeURIComponent(r.productSlug)}`}
                className="text-brand-fresh underline"
              >
                View product
              </Link>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
