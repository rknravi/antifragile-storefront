import Link from "next/link";
import type { BlogPost } from "@/lib/content-types";
import { blogPostImage, blogPostImageAlt } from "@/lib/blog-images";
import { EditorialImage } from "@/components/rays/EditorialImage";

export function RaysBlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-rays-white py-14 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <h2 className="font-rays text-2xl font-extrabold uppercase text-rays-accent md:text-3xl">More articles</h2>
        <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:max-w-4xl">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block">
                <EditorialImage
                  src={blogPostImage(p)}
                  alt={blogPostImageAlt(p)}
                  aspect="aspect-[5/4]"
                  className="transition duration-300 group-hover:border-rays-accent/40"
                />
                <p className="mt-4 text-xs text-rays-gray">{p.date}</p>
                <h3 className="mt-2 font-rays text-lg font-bold uppercase leading-snug text-rays-black group-hover:text-rays-accent">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-rays-gray">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
