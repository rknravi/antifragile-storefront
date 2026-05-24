import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/content-types";
import { blogPostImage } from "@/lib/blog-images";

export function RaysBlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="bg-rays-white py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <h2 className="text-center font-rays text-3xl font-extrabold uppercase text-rays-accent md:text-5xl">
          All posts
        </h2>
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-rays-cream">
                  <Image
                    src={blogPostImage(p)}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <p className="mt-4 text-xs text-rays-gray">{p.date}</p>
                <h3 className="mt-2 font-rays text-lg font-bold uppercase leading-snug text-rays-accent group-hover:underline">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-rays-gray">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
