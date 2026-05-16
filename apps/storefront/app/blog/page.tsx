import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata = {
  title: "Skin Journal",
  description: "Articles and guides from ANTIFRAGILE.",
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Skin Journal</h1>
      <p className="mt-3 text-neutral-600">Blog placeholder—connect Payload CMS collections in production.</p>
      <ul className="mt-10 space-y-6">
        {blogPosts.map((p) => (
          <li key={p.slug} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-xs text-neutral-500">{p.date}</p>
            <h2 className="mt-2 font-display text-2xl text-neutral-900">
              <Link href={`/blog/${p.slug}`} className="hover:underline">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-neutral-600">{p.excerpt}</p>
            <Link href={`/blog/${p.slug}`} className="mt-4 inline-block text-sm font-semibold text-brand-fresh hover:underline">
              Read more →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
