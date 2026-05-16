import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getPost } from "@/lib/blog-posts";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
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
  const post = getPost(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <article className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Skin Journal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-8 leading-8 text-slate-700">
          {post.body.map((paragraph: string) => (
            <p key={paragraph} className="mb-5 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
