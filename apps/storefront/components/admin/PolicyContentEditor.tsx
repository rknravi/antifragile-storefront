"use client";

import { useCallback, useEffect, useState } from "react";
import { POLICY_LABELS, POLICY_SLUGS, type PolicyPage, type PolicySlug } from "@/lib/content-types";
import type { PoliciesDocument } from "@/lib/policies-parse";

function emptyPolicy(slug: PolicySlug): PolicyPage {
  return { slug, title: POLICY_LABELS[slug], paragraphs: [""] };
}

export function PolicyContentEditor() {
  const [active, setActive] = useState<PolicySlug>("shipping");
  const [policies, setPolicies] = useState<PoliciesDocument | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<"ok" | "err">("ok");
  const [busy, setBusy] = useState(false);

  const flash = useCallback((message: string, tone: "ok" | "err" = "ok") => {
    setMsg(message);
    setMsgTone(tone);
  }, []);

  const load = useCallback(async () => {
    setMsg(null);
    const r = await fetch("/api/admin/policies");
    if (!r.ok) {
      flash("Could not load policies (unauthorized or server error).", "err");
      return;
    }
    const data = (await r.json()) as PoliciesDocument;
    setPolicies(data);
    flash("Policies loaded.");
  }, [flash]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = policies?.[active] ?? emptyPolicy(active);

  function updateCurrent(patch: Partial<PolicyPage>) {
    if (!policies) return;
    setPolicies({ ...policies, [active]: { ...current, ...patch, slug: active } });
  }

  function updateParagraph(index: number, value: string) {
    const next = [...current.paragraphs];
    next[index] = value;
    updateCurrent({ paragraphs: next });
  }

  function addParagraph() {
    updateCurrent({ paragraphs: [...current.paragraphs, ""] });
  }

  function removeParagraph(index: number) {
    if (current.paragraphs.length <= 1) return;
    updateCurrent({ paragraphs: current.paragraphs.filter((_, i) => i !== index) });
  }

  async function save() {
    if (!policies) return;
    setBusy(true);
    setMsg(null);
    try {
      const cleaned = { ...policies };
      for (const slug of POLICY_SLUGS) {
        const p = cleaned[slug];
        cleaned[slug] = {
          ...p,
          title: p.title.trim(),
          paragraphs: p.paragraphs.map((t) => t.trim()).filter(Boolean),
        };
        if (!cleaned[slug].paragraphs.length) {
          flash(`${POLICY_LABELS[slug]} needs at least one paragraph.`, "err");
          return;
        }
      }

      const r = await fetch("/api/admin/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!r.ok) {
        flash(j.error || "Save failed.", "err");
        return;
      }
      setPolicies(cleaned);
      flash("Policies saved. Storefront pages will refresh on next visit.");
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
      <div className="flex flex-wrap items-center gap-2">
        {POLICY_SLUGS.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => setActive(slug)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active === slug
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
            }`}
          >
            {POLICY_LABELS[slug]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
        >
          Reload
        </button>
        <button
          type="button"
          disabled={busy || !policies}
          onClick={() => void save()}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save all policies"}
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

      {!policies ? (
        <p className="text-sm text-neutral-500">Loading policies…</p>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Editing: {POLICY_LABELS[active]}
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-neutral-900">Page title</span>
            <input
              type="text"
              value={current.title}
              onChange={(e) => updateCurrent({ title: e.target.value })}
              className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-900">Paragraphs</span>
              <button
                type="button"
                onClick={addParagraph}
                className="text-xs font-semibold text-neutral-700 underline"
              >
                + Add paragraph
              </button>
            </div>
            {current.paragraphs.map((para, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Paragraph {index + 1}</span>
                  {current.paragraphs.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeParagraph(index)}
                      className="text-xs font-semibold text-red-700"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <textarea
                  value={para}
                  onChange={(e) => updateParagraph(index, e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
