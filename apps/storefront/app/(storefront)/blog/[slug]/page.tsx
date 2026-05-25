import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostShare } from "@/components/commerce/BlogPostShare";
import { EditorialImage } from "@/components/rays/EditorialImage";
import { RaysPageBreadcrumbs } from "@/components/rays/RaysPageBreadcrumbs";
import { blogPostImage, blogPostImageAlt } from "@/lib/blog-images";
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

  const img = blogPostImage(post);
  const alt = blogPostImageAlt(post);

  return (
    <article className="bg-rays-white pb-20">
      <RaysPageBreadcrumbs
        trail={[
          { label: "Blog", href: raysPath("/blog") },
          { label: post.title },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-rays-gray">Skin Journal</p>
        <h1 className="mt-4 font-rays text-3xl font-extrabold uppercase leading-tight tracking-tight text-rays-black md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-rays-gray">
          {new Date(post.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-rays-gray">{post.excerpt}</p>

        <EditorialImage src={img} alt={alt} aspect="aspect-[16/10]" className="mt-10" priority />

        <div className="prose-rays mt-12 space-y-6 border-t border-rays-line pt-10 text-base leading-8 text-rays-black">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <BlogPostShare slug={post.slug} title={post.title} excerpt={post.excerpt} />
      </div>
    </article>
  );
}
