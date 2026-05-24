import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogPostShare } from "@/components/commerce/BlogPostShare";
import { RaysPageBreadcrumbs } from "@/components/rays/RaysPageBreadcrumbs";
import { blogPostImage } from "@/lib/blog-images";
import { getBlogPost, getBlogPosts } from "@/lib/get-blog-posts";
import { raysPath } from "@/lib/theme-paths";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  return (
    <article className="bg-rays-white pb-16">
      <RaysPageBreadcrumbs
        trail={[
          { label: "Blog", href: raysPath("/blog") },
          { label: post.title },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 pt-4 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-rays-gray">Skin Journal</p>
        <h1 className="mt-4 font-rays text-4xl font-extrabold uppercase tracking-tight text-rays-black md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-rays-gray">{post.excerpt}</p>

        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border-2 border-rays-line">
          <Image
            src={blogPostImage(post)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 768px"
            priority
          />
        </div>

        <div className="mt-10 border-2 border-rays-line bg-rays-cream p-8 leading-8 text-rays-black">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="mb-5 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        <BlogPostShare slug={post.slug} title={post.title} excerpt={post.excerpt} />
      </div>
    </article>
  );
}
