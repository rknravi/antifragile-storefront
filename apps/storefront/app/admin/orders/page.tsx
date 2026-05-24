"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPortalNav } from "@/components/admin/AdminPortalNav";

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

const STATUS_OPTIONS = ["created", "paid", "demo_completed", "cod_pending", "shipped", "cancelled", "payment_event"];

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function shortProductName(name?: string): string {
  if (!name) return "—";
  return name.replace(/^ANTIFRAGILE\s*/i, "").trim() || name;
}

function formatOrderDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
  };
}

function statusStyle(status: string): string {
  switch (status) {
    case "paid":
    case "demo_completed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
    case "shipped":
      return "bg-violet-50 text-violet-800 ring-violet-200/80";
    case "cod_pending":
      return "bg-amber-50 text-amber-900 ring-amber-200/80";
    case "cancelled":
      return "bg-red-50 text-red-800 ring-red-200/80";
    case "created":
      return "bg-sky-50 text-sky-800 ring-sky-200/80";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200/80";
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function gatewayStyle(gateway: string): string {
  switch (gateway) {
    case "razorpay":
      return "bg-blue-50 text-blue-800";
    case "cashfree":
      return "bg-indigo-50 text-indigo-800";
    case "cod":
      return "bg-amber-50 text-amber-900";
    case "demo":
      return "bg-neutral-100 text-neutral-600";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

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
  const { date, time } = formatOrderDate(o.createdAt);
  const shippingLine = [shipping.address, shipping.city, shipping.pin].filter(Boolean).join(", ");

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-lg font-bold tracking-tight text-neutral-900">{o.sourceOrderId}</h2>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle(o.status)}`}
            >
              {statusLabel(o.status)}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${gatewayStyle(o.gateway)}`}
            >
              {o.gateway}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-neutral-500">
            {date} · {time}
            <span className="mx-2 text-neutral-300">|</span>
            {itemCount} unit{itemCount === 1 ? "" : "s"} · {items.length} line item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="text-2xl font-semibold tabular-nums text-neutral-900">
            {typeof totals.total === "number" ? formatInr(totals.total) : "—"}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Order total</p>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_minmax(220px,280px)]">
        <div className="space-y-5">
          {/* Customer & shipping */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl bg-neutral-50/80 p-4 ring-1 ring-neutral-100">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Customer</h3>
              <p className="mt-2 font-medium text-neutral-900">{customer.name || "—"}</p>
              <dl className="mt-2 space-y-1 text-sm text-neutral-600">
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-neutral-400">Email</dt>
                  <dd className="min-w-0 break-all">{customer.email || "—"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-neutral-400">Phone</dt>
                  <dd>{customer.mobile || "—"}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl bg-neutral-50/80 p-4 ring-1 ring-neutral-100">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Shipping</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-800">{shippingLine || "—"}</p>
              {shipping.gstNumber ? (
                <p className="mt-2 text-xs text-neutral-500">
                  GSTIN <span className="font-mono text-neutral-700">{shipping.gstNumber}</span>
                </p>
              ) : null}
            </section>
          </div>

          {/* Line items */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Products</h3>
            <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-neutral-100">
              {items.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-neutral-500">No line items stored.</li>
              ) : (
                items.map((line, idx) => {
                  const qty = typeof line.qty === "number" ? line.qty : 0;
                  const price = typeof line.price === "number" ? line.price : 0;
                  return (
                    <li
                      key={`${line.sku ?? idx}-${idx}`}
                      className="flex items-start justify-between gap-4 px-4 py-3.5 even:bg-neutral-50/50"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900">{shortProductName(line.name)}</p>
                        <p className="mt-0.5 font-mono text-xs text-neutral-500">
                          {line.sku || "—"} · Qty {qty}
                          {price > 0 ? ` · ${formatInr(price)} each` : ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                        {formatInr(qty * price)}
                      </p>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </div>

        {/* Totals sidebar */}
        <aside className="h-fit rounded-xl bg-neutral-900 p-4 text-neutral-100">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Summary</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {typeof totals.subtotal === "number" && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Subtotal</dt>
                <dd className="tabular-nums font-medium">{formatInr(totals.subtotal)}</dd>
              </div>
            )}
            {typeof totals.discount === "number" && totals.discount > 0 && (
              <div className="flex justify-between gap-4 text-emerald-300">
                <dt>Discount</dt>
                <dd className="tabular-nums font-medium">−{formatInr(totals.discount)}</dd>
              </div>
            )}
            {typeof totals.tax === "number" && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Tax</dt>
                <dd className="tabular-nums font-medium">{formatInr(totals.tax)}</dd>
              </div>
            )}
            {typeof totals.shippingFee === "number" && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Shipping</dt>
                <dd className="tabular-nums font-medium">
                  {totals.shippingFee === 0 ? "Free" : formatInr(totals.shippingFee)}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex justify-between border-t border-neutral-700 pt-3">
            <span className="font-medium text-neutral-300">Total</span>
            <span className="text-lg font-bold tabular-nums">
              {typeof totals.total === "number" ? formatInr(totals.total) : "—"}
            </span>
          </div>
        </aside>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col gap-3 border-t border-neutral-100 bg-neutral-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-neutral-500">Update status</span>
          <select
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            value={o.status}
            onChange={(e) => onStatusChange(o.id, e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
            {!STATUS_OPTIONS.includes(o.status) && (
              <option value={o.status}>{statusLabel(o.status)}</option>
            )}
          </select>
        </label>

        <details className="text-xs text-neutral-500 sm:text-right">
          <summary className="cursor-pointer font-medium text-neutral-500 hover:text-neutral-800">
            Payment & system IDs
          </summary>
          <div className="mt-2 space-y-1 font-mono text-[11px] text-neutral-600 sm:text-right">
            <p>
              <span className="text-neutral-400">DB id </span>
              {o.id}
            </p>
            {o.paymentRef ? (
              <p>
                <span className="text-neutral-400">Payment ref </span>
                {o.paymentRef}
              </p>
            ) : null}
            {o.razorpayOrderId ? (
              <p>
                <span className="text-neutral-400">Razorpay </span>
                {o.razorpayOrderId}
              </p>
            ) : null}
          </div>
        </details>
      </div>
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

  const summary = useMemo(() => {
    let revenue = 0;
    for (const o of orders) {
      const t = parseJson<Totals>(o.totalsJson, {});
      if (typeof t.total === "number") revenue += t.total;
    }
    return { count: orders.length, revenue };
  }, [orders]);

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

  const inputClass =
    "mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200/80";

  return (
    <div className="min-h-screen bg-[#f6f5f3]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Page header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Admin</p>
            <h1 className="font-display text-4xl text-neutral-900">Orders</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
              Each card is one checkout. Products purchased together appear as line items inside that order.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <AdminPortalNav active="orders" />
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200/80 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Showing</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-neutral-900">{summary.count}</p>
              <p className="text-sm text-neutral-500">orders matching filters</p>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Revenue (filtered)</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-neutral-900">
                {formatInr(summary.revenue)}
              </p>
              <p className="text-sm text-neutral-500">sum of order totals</p>
            </div>
          </div>
        )}

        {msg?.includes("DATABASE_URL") ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 shadow-sm">
            <p className="font-semibold">Orders are not being saved</p>
            <p className="mt-2 text-amber-900/90">
              Checkout still works, but without a database connection the storefront does not persist rows for this
              list.
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-amber-950">
              <li>
                Set <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">DATABASE_URL</code> in{" "}
                <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">.env.local</code>.
              </li>
              <li>
                Run <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">npm run db:push</code> in{" "}
                <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">apps/storefront</code>.
              </li>
              <li>
                Restart dev server and place a <strong>new</strong> order.
              </li>
            </ol>
          </div>
        ) : (
          msg && (
            <p className="mt-6 rounded-xl bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm ring-1 ring-neutral-100">
              {msg}
            </p>
          )
        )}

        {/* Filters */}
        <section className="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900">Filter orders</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Search</label>
              <input
                className={inputClass}
                placeholder="Order ID, email, or name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void load()}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</label>
              <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Gateway</label>
              <select className={inputClass} value={gatewayFilter} onChange={(e) => setGatewayFilter(e.target.value)}>
                <option value="">All gateways</option>
                <option value="demo">Demo</option>
                <option value="cod">Cash on delivery</option>
                <option value="razorpay">Razorpay</option>
                <option value="cashfree">Cashfree</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              Apply filters
            </button>
            <button
              type="button"
              disabled={!orders.length}
              onClick={() => exportOrdersCsv(orders)}
              className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </section>

        {/* Order list */}
        <div className="mt-8 space-y-6">
          {orders.map((o) => (
            <OrderCard key={o.id} o={o} onStatusChange={updateStatus} />
          ))}
        </div>

        {orders.length === 0 && !msg?.includes("DATABASE") && (
          <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
            <p className="font-display text-xl text-neutral-700">No orders yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              Completed checkouts will appear here once the database is connected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
