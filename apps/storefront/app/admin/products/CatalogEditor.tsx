"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import JsonView from "@uiw/react-json-view";
import { catalogJsonTreeTheme } from "./catalog-editor-theme";

const CatalogJsonCodeEditor = dynamic(
  () => import("./CatalogJsonCodeEditor").then((m) => m.CatalogJsonCodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center rounded-b-xl bg-neutral-50 text-sm text-neutral-500">
        Loading code editor…
      </div>
    ),
  }
);

type ViewMode = "tree" | "code";

function productLabel(item: unknown, index: number): string {
  if (item && typeof item === "object" && "name" in item && typeof (item as { name: unknown }).name === "string") {
    const name = (item as { name: string }).name;
    return name.length > 42 ? `${name.slice(0, 42)}…` : name;
  }
  if (item && typeof item === "object" && "slug" in item && typeof (item as { slug: unknown }).slug === "string") {
    return (item as { slug: string }).slug;
  }
  return `Product ${index + 1}`;
}

export function CatalogEditor() {
  const [mode, setMode] = useState<ViewMode>("tree");
  const [data, setData] = useState<unknown>(null);
  const [text, setText] = useState("");
  const [collapsedDepth, setCollapsedDepth] = useState<number | false>(1);
  const [treeKey, setTreeKey] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<"ok" | "err">("ok");
  const [busy, setBusy] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const productCount = useMemo(() => (Array.isArray(data) ? data.length : null), [data]);

  const flash = useCallback((message: string, tone: "ok" | "err" = "ok") => {
    setMsg(message);
    setMsgTone(tone);
  }, []);

  const applyLoadedJson = useCallback((parsed: unknown) => {
    setData(parsed);
    setText(JSON.stringify(parsed, null, 2));
    setParseError(null);
    setTreeKey((k) => k + 1);
  }, []);

  const load = useCallback(async () => {
    setMsg(null);
    setParseError(null);
    const r = await fetch("/api/admin/catalog");
    if (!r.ok) {
      flash("Could not load catalog (unauthorized or server error).", "err");
      return;
    }
    const raw = await r.text();
    try {
      applyLoadedJson(JSON.parse(raw) as unknown);
      flash("Catalog loaded.");
    } catch {
      flash("Catalog response was not valid JSON.", "err");
    }
  }, [applyLoadedJson, flash]);

  useEffect(() => {
    void load();
  }, [load]);

  function switchMode(next: ViewMode) {
    if (next === mode) return;

    if (next === "tree") {
      try {
        const parsed = JSON.parse(text) as unknown;
        setData(parsed);
        setParseError(null);
        setTreeKey((k) => k + 1);
        setMode("tree");
      } catch {
        setParseError("Fix JSON syntax before switching to tree view.");
        flash("Invalid JSON — stay in code view or fix errors.", "err");
      }
      return;
    }

    setText(JSON.stringify(data, null, 2));
    setParseError(null);
    setMode("code");
  }

  function formatCode() {
    try {
      const parsed = JSON.parse(text) as unknown;
      setText(JSON.stringify(parsed, null, 2));
      setData(parsed);
      setParseError(null);
      flash("Formatted.");
    } catch {
      setParseError("Cannot format — JSON syntax is invalid.");
      flash("Invalid JSON.", "err");
    }
  }

  function validateOnly() {
    try {
      JSON.parse(text);
      setParseError(null);
      flash("JSON is valid.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid JSON";
      setParseError(message);
      flash("JSON has errors.", "err");
    }
  }

  function bumpCollapse(depth: number | false) {
    setCollapsedDepth(depth);
    setTreeKey((k) => k + 1);
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    setParseError(null);
    try {
      let payload: unknown;
      if (mode === "code") {
        try {
          payload = JSON.parse(text) as unknown;
        } catch (e) {
          const message = e instanceof Error ? e.message : "Invalid JSON";
          setParseError(message);
          flash("Invalid JSON — fix syntax before saving.", "err");
          return;
        }
      } else {
        payload = data;
      }

      const r = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; ok?: boolean; count?: number };
      if (!r.ok) {
        flash(j.error || "Save failed.", "err");
        return;
      }
      applyLoadedJson(payload);
      flash(`Saved ${j.count ?? ""} products. Refresh the storefront to pick up cache updates.`);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  const treeReady = data !== null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-0.5">
          <button
            type="button"
            onClick={() => switchMode("tree")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              mode === "tree" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Tree
          </button>
          <button
            type="button"
            onClick={() => switchMode("code")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              mode === "code" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Code
          </button>
        </div>

        {mode === "tree" && (
          <>
            <button
              type="button"
              onClick={() => bumpCollapse(false)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => bumpCollapse(1)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Collapse products
            </button>
            <button
              type="button"
              onClick={() => bumpCollapse(2)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Collapse all
            </button>
          </>
        )}

        {mode === "code" && (
          <>
            <button
              type="button"
              onClick={formatCode}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Format JSON
            </button>
            <button
              type="button"
              onClick={validateOnly}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Validate
            </button>
          </>
        )}

        <span className="hidden h-6 w-px bg-neutral-200 sm:inline-block" aria-hidden />

        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
        >
          Reload
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

        {productCount != null && (
          <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {productCount} product{productCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        {mode === "tree"
          ? "Tree view — click arrows to expand/collapse. Click values to copy. Edit in Code view for bulk changes."
          : "Code view — syntax highlighting, line numbers, and fold gutters (click the arrow in the gutter). Use Format before save."}
      </p>

      {msg && (
        <p className={`text-sm ${msgTone === "err" ? "text-red-800" : "text-neutral-700"}`} role="status">
          {msg}
        </p>
      )}
      {parseError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {parseError}
        </p>
      )}

      {Array.isArray(data) && data.length > 0 && mode === "tree" && (
        <div className="flex flex-wrap gap-2">
          {data.map((item, index) => (
            <span
              key={index}
              className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-900"
              title={productLabel(item, index)}
            >
              {index}: {productLabel(item, index)}
            </span>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-900 px-4 py-2">
          <span className="font-mono text-xs font-medium text-neutral-300">data/catalog.json</span>
          <span className="text-xs text-neutral-500">{mode === "tree" ? "read-only tree" : "editable"}</span>
        </div>

        {mode === "tree" ? (
          treeReady ? (
            <div
              className="max-h-[min(72vh,640px)] overflow-auto p-4"
              style={catalogJsonTreeTheme}
            >
              <JsonView
                key={treeKey}
                value={data as object}
                collapsed={collapsedDepth}
                displayObjectSize
                displayDataTypes={false}
                enableClipboard
                shortenTextAfterLength={80}
                indentWidth={18}
              />
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center bg-neutral-50 text-sm text-neutral-500">
              Loading catalog…
            </div>
          )
        ) : (
          <CatalogJsonCodeEditor
            value={text}
            onChange={(v) => {
              setText(v);
              setParseError(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
