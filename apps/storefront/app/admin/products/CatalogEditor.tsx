"use client";

import { useCallback, useEffect, useState } from "react";

export function CatalogEditor() {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setMsg(null);
    const r = await fetch("/api/admin/catalog");
    if (!r.ok) {
      setMsg("Could not load catalog (unauthorized or server error).");
      return;
    }
    const raw = await r.text();
    try {
      const parsed = JSON.parse(raw) as unknown;
      setText(JSON.stringify(parsed, null, 2));
    } catch {
      setMsg("Catalog response was not valid JSON.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      let data: unknown;
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        setMsg("Invalid JSON — fix syntax before saving.");
        return;
      }
      const r = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; ok?: boolean; count?: number };
      if (!r.ok) {
        setMsg(j.error || "Save failed.");
        return;
      }
      setMsg(`Saved ${j.count ?? ""} products. Refresh the storefront to pick up ISR/cache updates.`);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold"
        >
          Reload from server
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Validate & save"}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700"
        >
          Log out
        </button>
      </div>
      {msg && <p className="text-sm text-neutral-700">{msg}</p>}
      <textarea
        className="min-h-[480px] w-full rounded-xl border border-neutral-200 p-4 font-mono text-xs leading-relaxed"
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Catalog JSON"
      />
    </div>
  );
}
