"use client";

import Link from "next/link";
import { useState } from "react";
import type { BlogPost } from "@/lib/content-types";
import { blogPostImage, blogPostImageAlt } from "@/lib/blog-images";
import { EditorialImage } from "@/components/rays/EditorialImage";
import { raysPath } from "@/lib/theme-paths";

export function RaysBlogFeatured({ posts }: { posts: BlogPost[] }) {
  const [idx, setIdx] = useState(0);
  const post = posts[idx];
  if (!post) return null;

  const img = blogPostImage(post);
  const alt = blogPostImageAlt(post);

  return (
    <section className="border-b border-rays-line bg-rays-cream/40">
      <div className="mx-auto max-w-[1440px] px-4 py-14 md:px-8 md:py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-rays-gray">Skin Journal</p>
        <h2 className="mt-3 text-center font-rays text-3xl font-extrabold uppercase text-rays-accent md:text-4xl">
          Featured
        </h2>

        <div className="mt-10 overflow-hidden rounded-3xl border-2 border-rays-line bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <EditorialImage
              src={img}
              alt={alt}
              aspect="aspect-[4/3] md:aspect-[5/4]"
              className="rounded-none border-0"
              priority
            />
            <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12">
              <p className="text-xs text-rays-gray">
                {new Date(post.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h3 className="mt-3 font-rays text-2xl font-extrabold uppercase leading-tight text-rays-black md:text-3xl">
                {post.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-rays-gray">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-8 inline-flex w-fit rounded-full bg-rays-accent px-8 py-3 text-xs font-bold uppercase tracking-wider text-rays-white transition hover:bg-rays-black"
              >
                Read article
              </Link>
              {posts.length > 1 && (
                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIdx((i) => (i - 1 + posts.length) % posts.length)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-rays-line text-rays-accent transition hover:border-rays-accent"
                    aria-label="Previous featured post"
                  >
                    ←
                  </button>
                  <span className="text-xs font-semibold text-rays-gray">
                    {idx + 1} / {posts.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIdx((i) => (i + 1) % posts.length)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-rays-line text-rays-accent transition hover:border-rays-accent"
                    aria-label="Next featured post"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center">
          <Link
            href={raysPath("/")}
            className="text-xs font-bold uppercase tracking-widest text-rays-accent hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </section>
  );
}
