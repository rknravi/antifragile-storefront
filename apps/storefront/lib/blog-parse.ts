import type { BlogPost } from "./content-types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseBody(value: unknown, slug: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${slug}: body must be a non-empty array of strings`);
  }
  return value.map((p, i) => {
    if (typeof p !== "string" || !p.trim()) {
      throw new Error(`${slug}: body[${i}] must be a non-empty string`);
    }
    return p.trim();
  });
}

function parsePost(value: unknown, index: number): BlogPost {
  if (!isRecord(value)) throw new Error(`Post at index ${index} must be an object`);
  const slug = value.slug;
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
    throw new Error(`Post ${index}: slug must be lowercase letters, numbers, and hyphens`);
  }
  const title = value.title;
  if (typeof title !== "string" || !title.trim()) {
    throw new Error(`${slug}: title is required`);
  }
  const excerpt = value.excerpt;
  if (typeof excerpt !== "string" || !excerpt.trim()) {
    throw new Error(`${slug}: excerpt is required`);
  }
  const date = value.date;
  if (typeof date !== "string" || !DATE_RE.test(date)) {
    throw new Error(`${slug}: date must be YYYY-MM-DD`);
  }
  const body = parseBody(value.body, slug);
  return {
    slug,
    title: title.trim(),
    excerpt: excerpt.trim(),
    date,
    body,
  };
}

export function parseBlogPostsJson(body: unknown): BlogPost[] {
  if (!Array.isArray(body)) throw new Error("Blog posts must be a JSON array");
  const slugs = new Set<string>();
  const posts = body.map((item, i) => {
    const post = parsePost(item, i);
    if (slugs.has(post.slug)) throw new Error(`Duplicate blog slug: ${post.slug}`);
    slugs.add(post.slug);
    return post;
  });
  return posts;
}
