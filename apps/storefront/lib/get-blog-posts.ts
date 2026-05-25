import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { BlogPost } from "./content-types";
import { parseBlogPostsJson } from "./blog-parse";

const BLOG_PATH = path.join(process.cwd(), "data", "blog-posts.json");

async function readBlogFromDisk(): Promise<BlogPost[]> {
  const raw = await readFile(BLOG_PATH, "utf8");
  return parseBlogPostsJson(JSON.parse(raw) as unknown);
}

async function fetchBlogFromUrl(url: string): Promise<BlogPost[]> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Blog URL returned ${res.status}`);
  return parseBlogPostsJson((await res.json()) as unknown);
}

const cachedDiskBlog = unstable_cache(
  async () => readBlogFromDisk(),
  ["af-blog-disk"],
  { revalidate: 30, tags: ["blog"] }
);

function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const remote = process.env.BLOG_JSON_URL;
  if (remote?.startsWith("https://")) {
    return sortByDateDesc(await fetchBlogFromUrl(remote));
  }
  return sortByDateDesc(await cachedDiskBlog());
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug);
}
