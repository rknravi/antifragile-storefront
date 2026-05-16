"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type OrderRow = {
  id: string;
  sourceOrderId: string;
  status: string;
  gateway: string;
  paymentRef: string | null;
  razorpayOrderId: string | null;
  customerJson: string;
  shippingJson: string;
  itemsJson: string;
  totalsJson: string;
  createdAt: string;
};

type Customer = { name?: string; email?: string; mobile?: string };
type Shipping = { address?: string; city?: string; pin?: string; gstNumber?: string };
type LineItem = { name?: string; sku?: string; qty?: number; price?: number };
type Totals = {
  subtotal?: number;
  discount?: number;
  tax?: number;
  shippingFee?: number;
  total?: number;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const STATUS_OPTIONS = ["created", "paid", "demo_completed", "cod_pending", "shipped", "cancelled", "payment_event"];

function OrderCard({
  o,
  onStatusChange,
}: {
  o: OrderRow;
  onStatusChange: (id: string, status: string) => void;
}) {
  const customer = parseJson<Customer>(o.customerJson, {});
  const shipping = parseJson<Shipping>(o.shippingJson, {});
  const items = parseJson<LineItem[]>(o.itemsJson, []);
  const totals = parseJson<Totals>(o.totalsJson, {});
  const itemCount = items.reduce((n, i) => n + (typeof i.qty === "number" ? i.qty : 0), 0);

  return (
    <article className="rounded-xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/5 bg-neutral-50/80 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Store order ID</p>
          <p className="font-mono text-sm font-semibold text-neutral-900">{o.sourceOrderId}</p>
          <p className="mt-1 text-xs text-neutral-500">
            DB id: <span className="font-mono text-neutral-700">{o.id}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-neutral-900">
            {typeof totals.total === "number" ? `₹${totals.total}` : "—"}
          </p>
          <p className="text-xs text-neutral-500">
            {itemCount} unit{itemCount === 1 ? "" : "s"} · {items.length} line item{items.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 md:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Customer</h2>
          <ul className="mt-2 space-y-1 text-sm text-neutral-800">
            <li>
              <span className="text-neutral-500">Name:</span> {customer.name || "—"}
            </li>
            <li>
              <span className="text-neutral-500">Email:</span> {customer.email || "—"}
            </li>
            <li>
              <span className="text-neutral-500">Mobile:</span> {customer.mobile || "—"}
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Shipping</h2>
          <p className="mt-2 text-sm text-neutral-800">
            {[shipping.address, shipping.city, shipping.pin].filter(Boolean).join(", ") || "—"}
          </p>
          {shipping.gstNumber ? (
            <p className="mt-1 text-sm text-neutral-600">
              <span className="text-neutral-500">GSTIN:</span> {shipping.gstNumber}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-black/5 px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Line items</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs text-neutral-500">
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 pr-4 font-medium">SKU</th>
                <th className="py-2 pr-4 font-medium">Qty</th>
                <th className="py-2 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 text-neutral-500">
                    No line items stored.
                  </td>
                </tr>
              ) : (
                items.map((line, idx) => {
                  const qty = typeof line.qty === "number" ? line.qty : 0;
                  const price = typeof line.price === "number" ? line.price : 0;
                  const lineTotal = qty * price;
                  return (
                    <tr key={`${line.sku ?? idx}-${idx}`} className="border-t border-black/5">
                      <td className="py-2 pr-4">{line.name || "—"}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{line.sku || "—"}</td>
                      <td className="py-2 pr-4">{qty}</td>
                      <td className="py-2">₹{lineTotal}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-black/5 bg-neutral-50/50 px-4 py-3 text-xs text-neutral-600">
        <span>
          <span className="text-neutral-500">Gateway:</span> {o.gateway}
        </span>
        <label className="flex items-center gap-2">
          <span className="text-neutral-500">Status:</span>
          <select
            className="rounded border border-neutral-200 px-2 py-1 text-xs"
            value={o.status}
            onChange={(e) => onStatusChange(o.id, e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {!STATUS_OPTIONS.includes(o.status) && <option value={o.status}>{o.status}</option>}
          </select>
        </label>
        <span>
          <span className="text-neutral-500">Created:</span> {new Date(o.createdAt).toLocaleString()}
        </span>
        {o.paymentRef ? (
          <span className="font-mono">
            <span className="text-neutral-500">Payment ref:</span> {o.paymentRef}
          </span>
        ) : null}
        {o.razorpayOrderId ? (
          <span className="font-mono">
            <span className="text-neutral-500">Razorpay order:</span> {o.razorpayOrderId}
          </span>
        ) : null}
      </div>

      {(typeof totals.subtotal === "number" ||
        typeof totals.discount === "number" ||
        typeof totals.tax === "number" ||
        typeof totals.shippingFee === "number") && (
        <div className="border-t border-black/5 px-4 py-3 text-xs text-neutral-600">
          <span className="text-neutral-500">Totals breakdown:</span>{" "}
          {typeof totals.subtotal === "number" ? `sub ₹${totals.subtotal}` : ""}
          {typeof totals.discount === "number" && totals.discount > 0 ? ` · disc −₹${totals.discount}` : ""}
          {typeof totals.tax === "number" ? ` · tax ₹${totals.tax}` : ""}
          {typeof totals.shippingFee === "number" ? ` · ship ₹${totals.shippingFee}` : ""}
        </div>
      )}
    </article>
  );
}

function exportOrdersCsv(rows: OrderRow[]) {
  const header = ["sourceOrderId", "status", "gateway", "email", "name", "total", "createdAt"];
  const lines = rows.map((o) => {
    const c = parseJson<Customer>(o.customerJson, {});
    const t = parseJson<Totals>(o.totalsJson, {});
    const cols = [
      o.sourceOrderId,
      o.status,
      o.gateway,
      c.email ?? "",
      c.name ?? "",
      String(t.total ?? ""),
      o.createdAt,
    ];
    return cols.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("");

  const load = useCallback(async () => {
    setMsg(null);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (gatewayFilter) params.set("gateway", gatewayFilter);
    const qs = params.toString();
    const r = await fetch(`/api/admin/orders${qs ? `?${qs}` : ""}`);
    const j = (await r.json()) as { orders?: OrderRow[]; message?: string; error?: string };
    if (!r.ok) {
      setMsg(j.error || "Could not load orders.");
      return;
    }
    setOrders(j.orders ?? []);
    if (j.message) setMsg(j.message);
  }, [search, statusFilter, gatewayFilter]);

  async function updateStatus(id: string, status: string) {
    const r = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!r.ok) {
      const j = (await r.json()) as { error?: string };
      setMsg(j.error || "Could not update status.");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-neutral-900">Orders</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/products" className="font-semibold text-brand-fresh underline">
            Catalog
          </Link>
          <button type="button" onClick={() => void load()} className="font-semibold text-neutral-700 underline">
            Refresh
          </button>
        </div>
      </div>
      {msg?.includes("DATABASE_URL") ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Orders are not being saved</p>
          <p className="mt-2 text-amber-900/90">
            Checkout still works, but without a database connection the storefront does not persist rows for this
            list.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-amber-950">
            <li>
              Set <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">DATABASE_URL</code> in{" "}
              <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">.env.local</code> (PostgreSQL URL). See{" "}
              <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">.env.example</code> for a local example.
            </li>
            <li>
              In <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">apps/storefront</code>, run{" "}
              <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">npm run db:push</code> once to create the{" "}
              <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">Order</code> table.
            </li>
            <li>
              Restart <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">npm run dev</code>, then place a{" "}
              <strong>new</strong> order—previous checkouts were not stored.
            </li>
          </ol>
        </div>
      ) : (
        msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-neutral-500">Search</label>
          <input
            className="mt-1 block w-48 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="ID, email, name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Status</label>
          <select
            className="mt-1 block rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500">Gateway</label>
          <select
            className="mt-1 block rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="demo">demo</option>
            <option value="cod">cod</option>
            <option value="razorpay">razorpay</option>
            <option value="cashfree">cashfree</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Apply filters
        </button>
        <button
          type="button"
          disabled={!orders.length}
          onClick={() => exportOrdersCsv(orders)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        One card is <strong>one checkout</strong>. Multiple products are <strong>line items</strong> inside that order.
      </p>

      <div className="mt-6 space-y-6">
        {orders.map((o) => (
          <OrderCard key={o.id} o={o} onStatusChange={updateStatus} />
        ))}
      </div>

      {orders.length === 0 && !msg?.includes("DATABASE") && (
        <p className="mt-6 text-sm text-neutral-500">No orders in database yet.</p>
      )}
    </div>
  );
}
