"use client";

import { useCallback, useEffect, useState } from "react";

type ReviewRow = {
  id: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export function ProductReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`);
      const j = (await r.json()) as { reviews?: ReviewRow[] };
      setReviews(Array.isArray(j.reviews) ? j.reviews : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, rating, title, body, authorName }),
      });
      const j = (await r.json()) as { error?: string; ok?: boolean };
      if (!r.ok) {
        setMsg(j.error || "Could not submit review.");
        return;
      }
      setTitle("");
      setBody("");
      setAuthorName("");
      setRating(5);
      setMsg("Thanks — your review was posted.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl border-t border-black/5 px-4 py-12 md:px-6">
      <h2 className="font-display text-2xl text-neutral-900">Reviews</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Reviews are stored when <code className="rounded bg-neutral-100 px-1">DATABASE_URL</code> is configured.
      </p>

      <form onSubmit={submit} className="mt-8 max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-neutral-900">Write a review</p>
        <div>
          <label className="text-xs font-medium text-neutral-600">Rating</label>
          <select
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Title</label>
          <input
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Review</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            required
            minLength={10}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Your name</label>
          <input
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
            placeholder="First name or initials"
          />
        </div>
        {msg && <p className="text-sm text-neutral-700">{msg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit review"}
        </button>
      </form>

      <div className="mt-10 space-y-4">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-black/5 bg-brand-sand/50 p-5">
              <p className="text-sm font-semibold text-neutral-900">
                {r.title}{" "}
                <span className="font-normal text-amber-700">{"★".repeat(r.rating)}</span>
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {r.authorName} · {new Date(r.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-3 text-sm text-neutral-700">{r.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
