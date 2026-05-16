"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setErr(j.error || "Login failed.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-display text-3xl text-neutral-900">Product admin</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Enter the portal token from <code className="rounded bg-neutral-100 px-1">ADMIN_PORTAL_TOKEN</code> (server
        env). Use a long random value; set <code className="rounded bg-neutral-100 px-1">ADMIN_SESSION_SECRET</code>{" "}
        for cookie signing in production.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Portal token</label>
          <input
            type="password"
            autoComplete="off"
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
