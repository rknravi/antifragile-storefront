"use client";

import { useCallback, useEffect, useState } from "react";
import { StarRating } from "@/components/StarRating";
import { formatReviewAverage, type ReviewSummary } from "@/lib/review-stats";

export function ProductRatingSummary({
  slug,
  accent,
}: {
  slug: string;
  accent?: string;
}) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const r = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`);
      const j = (await r.json()) as { summary?: ReviewSummary | null };
      setSummary(j.summary ?? null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    void fetchSummary();
    const onUpdate = () => {
      void fetchSummary();
    };
    window.addEventListener("af-reviews-updated", onUpdate);
    return () => window.removeEventListener("af-reviews-updated", onUpdate);
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="h-8 w-28 animate-pulse rounded-full bg-black/5 sm:shrink-0" aria-hidden />
    );
  }

  if (!summary || summary.count === 0) {
    return (
      <a
        href="#product-reviews"
        className="text-sm text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline sm:shrink-0 sm:text-right"
      >
        No reviews yet — be the first
      </a>
    );
  }

  const label = formatReviewAverage(summary.average);

  return (
    <a
      href="#product-reviews"
      className="group flex flex-col items-start gap-1 sm:shrink-0 sm:items-end"
      aria-label={`${label} out of 5 stars, ${summary.count} reviews. Jump to reviews.`}
    >
      <span className="flex flex-wrap items-center gap-2">
        <StarRating value={summary.average} size="md" accent={accent} />
        <span className="text-base font-semibold tabular-nums text-neutral-900">
          {label}
          <span className="font-normal text-neutral-500">/5</span>
        </span>
      </span>
      <span className="text-xs text-neutral-500 group-hover:text-neutral-700">
        {summary.count} review{summary.count === 1 ? "" : "s"}
      </span>
    </a>
  );
}
