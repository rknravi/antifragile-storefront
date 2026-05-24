import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-api-auth";
import { parseBlogPostsJson } from "@/lib/blog-parse";

const BLOG_PATH = path.join(process.cwd(), "data", "blog-posts.json");

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const raw = await readFile(BLOG_PATH, "utf8");
    return new NextResponse(raw, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Could not read blog posts." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (process.env.ALLOW_BLOG_WRITE === "false") {
    return NextResponse.json(
      { error: "Blog writes disabled (ALLOW_BLOG_WRITE=false)." },
      { status: 403 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  try {
    const parsed = parseBlogPostsJson(body);
    const text = JSON.stringify(parsed, null, 2);
    await writeFile(BLOG_PATH, text, "utf8");
    try {
      revalidateTag("blog", { expire: 0 });
      revalidatePath("/blog");
      for (const post of parsed) revalidatePath(`/blog/${post.slug}`);
    } catch {
      /* optional */
    }
    return NextResponse.json({ ok: true, count: parsed.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Validation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
