import type { Metadata } from "next";
import { AdminPortalNav } from "@/components/admin/AdminPortalNav";
import { BlogContentEditor } from "@/components/admin/BlogContentEditor";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

export default function AdminBlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-neutral-900">Blog</h1>
        <AdminPortalNav active="blog" />
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        Manage blog posts shown on <code className="rounded bg-neutral-100 px-1">/blog</code>. Stored in{" "}
        <code className="rounded bg-neutral-100 px-1">data/blog-posts.json</code>.
      </p>
      <BlogContentEditor />
    </div>
  );
}
