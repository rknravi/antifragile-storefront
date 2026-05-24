"use client";

import { raysPath } from "@/lib/theme-paths";
import { ShareLinkBar } from "@/components/commerce/ShareLinkBar";

export function BlogPostShare({
  slug,
  title,
  excerpt,
}: {
  slug: string;
  title: string;
  excerpt: string;
}) {
  return (
    <ShareLinkBar
      path={raysPath(`/blog/${slug}`)}
      title={title}
      text={excerpt}
      variant="rays"
      label="Share this article"
      className="mt-10 border-t-2 border-rays-line pt-8"
    />
  );
}
