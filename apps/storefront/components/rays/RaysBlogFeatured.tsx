"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { BlogPost } from "@/lib/content-types";
import { blogPostImage } from "@/lib/blog-images";
import { raysPath } from "@/lib/theme-paths";

export function RaysBlogFeatured({ posts }: { posts: BlogPost[] }) {
  const [idx, setIdx] = useState(0);
  const post = posts[idx];
  if (!post) return null;

  const img = blogPostImage(post);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24">
      <h2 className="text-center font-rays text-3xl font-extrabold uppercase text-rays-accent md:text-4xl">
        Featured posts
      </h2>
      <div className="relative mt-10 overflow-hidden rounded-3xl bg-rays-accent p-6 md:p-10">
        <span className="absolute right-6 top-6 text-sm font-bold text-rays-white/80 md:right-10 md:top-10">
          {idx + 1}/{posts.length}
        </span>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-square">
            <Image src={img} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
            <span className="absolute left-4 top-4 rounded-full bg-rays-accent px-3 py-1 text-[10px] font-bold uppercase text-rays-white ring-2 ring-rays-white">
              Featured
            </span>
          </div>
          <div className="text-rays-white">
            <span className="inline-block rounded-full bg-rays-black px-4 py-1 text-xs font-bold text-rays-white">
              Care
            </span>
            <h3 className="mt-6 font-rays text-2xl font-extrabold uppercase leading-tight md:text-3xl">{post.title}</h3>
            <p className="mt-4 font-display text-lg leading-relaxed text-rays-white/95">{post.excerpt}</p>
            <p className="mt-4 text-sm text-rays-white/80">
              By ANTIFRAGILE · {new Date(post.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-8 inline-flex rounded-full bg-rays-white px-8 py-3 text-sm font-bold uppercase text-rays-accent"
            >
              Read more
            </Link>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + posts.length) % posts.length)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rays-white text-rays-accent"
            aria-label="Previous post"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % posts.length)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rays-white text-rays-accent"
            aria-label="Next post"
          >
            →
          </button>
        </div>
      </div>
      <p className="mt-6 text-center">
        <Link href={raysPath("/")} className="text-xs font-bold uppercase tracking-widest text-rays-accent underline">
          Back to home
        </Link>
      </p>
    </section>
  );
}
