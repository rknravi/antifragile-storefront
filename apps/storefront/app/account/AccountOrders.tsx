"use client";

import { useState } from "react";
import { Money } from "@/components/Money";

type OrderSummary = {
  id: string;
  sourceOrderId: string;
  status: string;
  gateway: string;
  createdAt: string;
  itemsJson: string;
  totalsJson: string;
};

function parseTotal(totalsJson: string): number | null {
  try {
    const t = JSON.parse(totalsJson) as { total?: number };
    return typeof t.total === "number" ? t.total : null;
  } catch {
    return null;
  }
}

function parseItemCount(itemsJson: string): number {
  try {
    const items = JSON.parse(itemsJson) as { qty?: number }[];
    if (!Array.isArray(items)) return 0;
    return items.reduce((n, i) => n + (typeof i.qty === "number" ? i.qty : 0), 0);
  } catch {
    return 0;
  }
}

export function AccountOrders() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const r = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const j = (await r.json()) as { orders?: OrderSummary[]; message?: string; error?: string };
      if (!r.ok) {
        setMsg(j.error || "Could not load orders.");
        setOrders([]);
        return;
      }
      setOrders(j.orders ?? []);
      if (j.message) setMsg(j.message);
      else if ((j.orders ?? []).length === 0) setMsg("No orders found for this email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={lookup} className="flex flex-wrap gap-3">
        <input
          type="email"
          required
          className="min-w-[220px] flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          placeholder="Email used at checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Loading…" : "Find my orders"}
        </button>
      </form>
      {msg && <p className="text-sm text-neutral-600">{msg}</p>}
      <ul className="space-y-4">
        {orders.map((o) => {
          const total = parseTotal(o.totalsJson);
          const units = parseItemCount(o.itemsJson);
          return (
            <li key={o.id} className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold">{o.sourceOrderId}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(o.createdAt).toLocaleString()} · {o.gateway} · {o.status}
                  </p>
                </div>
                <p className="font-semibold">{total != null ? <Money amount={total} /> : "—"}</p>
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                {units} item{units === 1 ? "" : "s"}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
