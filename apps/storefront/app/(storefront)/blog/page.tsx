import { RaysBlogFeatured } from "@/components/rays/RaysBlogFeatured";
import { RaysBlogGrid } from "@/components/rays/RaysBlogGrid";
import { RaysPageBreadcrumbs } from "@/components/rays/RaysPageBreadcrumbs";
import { getBlogPosts } from "@/lib/get-blog-posts";

export const metadata = {
  title: "Blog",
  description: "Skin journal and guides from ANTIFRAGILE.",
};

export default async function RaysBlogPage() {
  const posts = await getBlogPosts();
  const morePosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="bg-rays-white">
      <RaysPageBreadcrumbs trail={[{ label: "Blog" }]} />
      <RaysBlogFeatured posts={posts} />
      <RaysBlogGrid posts={morePosts} />
    </div>
  );
}
