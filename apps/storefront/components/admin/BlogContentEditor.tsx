"use client";

import { useCallback, useEffect, useState } from "react";
import type { BlogPost } from "@/lib/content-types";

function newPost(): BlogPost {
  const d = new Date().toISOString().slice(0, 10);
  return {
    slug: "new-post",
    title: "New post",
    excerpt: "Short summary for the blog index.",
    date: d,
    body: ["First paragraph."],
  };
}

export function BlogContentEditor() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<"ok" | "err">("ok");
  const [busy, setBusy] = useState(false);

  const flash = useCallback((message: string, tone: "ok" | "err" = "ok") => {
    setMsg(message);
    setMsgTone(tone);
  }, []);

  const load = useCallback(async () => {
    setMsg(null);
    const r = await fetch("/api/admin/blog");
    if (!r.ok) {
      flash("Could not load blog (unauthorized or server error).", "err");
      return;
    }
    const data = (await r.json()) as BlogPost[];
    setPosts(data);
    if (data[0]) setExpanded(data[0].slug);
    flash("Blog posts loaded.");
  }, [flash]);

  useEffect(() => {
    void load();
  }, [load]);

  function updatePost(index: number, patch: Partial<BlogPost>) {
    if (!posts) return;
    setPosts(posts.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function updateBodyParagraph(postIndex: number, paraIndex: number, value: string) {
    if (!posts) return;
    const post = posts[postIndex];
    const body = [...post.body];
    body[paraIndex] = value;
    updatePost(postIndex, { body });
  }

  function addBodyParagraph(postIndex: number) {
    if (!posts) return;
    const post = posts[postIndex];
    updatePost(postIndex, { body: [...post.body, ""] });
  }

  function removeBodyParagraph(postIndex: number, paraIndex: number) {
    if (!posts) return;
    const post = posts[postIndex];
    if (post.body.length <= 1) return;
    updatePost(postIndex, { body: post.body.filter((_, i) => i !== paraIndex) });
  }

  function addPost() {
    const post = newPost();
    setPosts((prev) => [...(prev ?? []), post]);
    setExpanded(post.slug);
  }

  function removePost(index: number) {
    if (!posts || posts.length <= 1) {
      flash("Keep at least one blog post.", "err");
      return;
    }
    setPosts(posts.filter((_, i) => i !== index));
  }

  async function save() {
    if (!posts) return;
    setBusy(true);
    setMsg(null);
    try {
      const cleaned = posts.map((p) => ({
        ...p,
        slug: p.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        title: p.title.trim(),
        excerpt: p.excerpt.trim(),
        date: p.date.trim(),
        body: p.body.map((t) => t.trim()).filter(Boolean),
      }));

      const r = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; ok?: boolean; count?: number };
      if (!r.ok) {
        flash(j.error || "Save failed.", "err");
        return;
      }
      setPosts(cleaned);
      flash(`Saved ${j.count ?? cleaned.length} post(s).`);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addPost}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
        >
          + New post
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
        >
          Reload
        </button>
        <button
          type="button"
          disabled={busy || !posts}
          onClick={() => void save()}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save all posts"}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700"
        >
          Log out
        </button>
      </div>

      {msg && (
        <p className={`text-sm ${msgTone === "err" ? "text-red-800" : "text-neutral-700"}`} role="status">
          {msg}
        </p>
      )}

      {!posts ? (
        <p className="text-sm text-neutral-500">Loading blog posts…</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post, index) => {
            const open = expanded === post.slug;
            return (
              <li key={`${post.slug}-${index}`} className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : post.slug)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-neutral-900">{post.title || "Untitled"}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{post.date}</span>
                </button>

                {open ? (
                  <div className="space-y-4 border-t border-neutral-100 px-5 pb-6 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-neutral-700">Slug (URL)</span>
                        <input
                          type="text"
                          value={post.slug}
                          onChange={(e) => updatePost(index, { slug: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-neutral-700">Date</span>
                        <input
                          type="date"
                          value={post.date}
                          onChange={(e) => updatePost(index, { date: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-xs font-semibold text-neutral-700">Title</span>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => updatePost(index, { title: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-neutral-700">Excerpt</span>
                      <textarea
                        value={post.excerpt}
                        onChange={(e) => updatePost(index, { excerpt: e.target.value })}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </label>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-700">Body paragraphs</span>
                        <button
                          type="button"
                          onClick={() => addBodyParagraph(index)}
                          className="text-xs font-semibold underline"
                        >
                          + Add paragraph
                        </button>
                      </div>
                      {post.body.map((para, pi) => (
                        <div key={pi} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-neutral-500">¶ {pi + 1}</span>
                            {post.body.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => removeBodyParagraph(index, pi)}
                                className="text-xs text-red-700"
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <textarea
                            value={para}
                            onChange={(e) => updateBodyParagraph(index, pi, e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => removePost(index)}
                      className="text-sm font-semibold text-red-700"
                    >
                      Delete this post
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
