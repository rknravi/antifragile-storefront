"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Money } from "@/components/Money";
import {
  clearAccountSession,
  displayName,
  readAccountSession,
  writeAccountSession,
  type AccountSession,
} from "@/lib/account-session";
import type { StoreTheme } from "@/lib/theme-paths";
import { accountUi } from "@/lib/account-ui-styles";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import { readBrowserLastOrderAddress } from "@/lib/last-order-browser";
import {
  getBrowserLoyaltyBalance,
  getBrowserLoyaltyHistory,
  readBrowserOrderForSync,
  recordBrowserLoyalty,
} from "@/lib/loyalty-browser";
import { mergeSavedAddresses, type SavedAddress } from "@/lib/shipping-address";
import { RaysPageBreadcrumbs } from "@/components/rays/RaysPageBreadcrumbs";

type View = "login" | "recover" | "dashboard";
type Tab = "home" | "orders" | "profile" | "addresses" | "rewards";

type OrderSummary = {
  id: string;
  sourceOrderId: string;
  status: string;
  gateway: string;
  createdAt: string;
  itemsJson: string;
  totalsJson: string;
};

type OrderLine = { name?: string; sku?: string; qty?: number; price?: number };

type LoyaltyEntry = {
  sourceOrderId: string;
  points: number;
  orderTotal: number;
  createdAt: string;
};

function parseTotal(totalsJson: string): number | null {
  try {
    const t = JSON.parse(totalsJson) as { total?: number };
    return typeof t.total === "number" ? t.total : null;
  } catch {
    return null;
  }
}

function parseItems(itemsJson: string): OrderLine[] {
  try {
    const items = JSON.parse(itemsJson) as OrderLine[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function statusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("paid") || s.includes("complete")) return "Confirmed";
  if (s.includes("pending")) return "Processing";
  if (s.includes("fail") || s.includes("cancel")) return "Cancelled";
  return status;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "orders", label: "Orders" },
  { id: "profile", label: "Profile" },
  { id: "addresses", label: "Addresses" },
  { id: "rewards", label: "Rewards" },
];

export function AccountClient({ variant = "rays" }: { variant?: StoreTheme }) {
  const ui = accountUi(variant);
  const paths = themeNavPaths(variant);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("login");
  const [tab, setTab] = useState<Tab>("home");
  const [session, setSession] = useState<AccountSession | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [ordersMsg, setOrdersMsg] = useState<string | null>(null);
  const [ordersBusy, setOrdersBusy] = useState(false);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyEntry[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverSent, setRecoverSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const [profileFirst, setProfileFirst] = useState("");
  const [profileLast, setProfileLast] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const loadOrders = useCallback(async (email: string) => {
    setOrdersBusy(true);
    setOrdersMsg(null);
    const normalized = email.trim().toLowerCase();

    const browserOrder = readBrowserOrderForSync(normalized);
    if (browserOrder) {
      recordBrowserLoyalty(normalized, browserOrder.sourceOrderId, browserOrder.total);
    }
    setPointsBalance(getBrowserLoyaltyBalance(normalized));

    try {
      const r = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, browserOrder: browserOrder ?? undefined }),
      });
      const j = (await r.json()) as {
        orders?: OrderSummary[];
        addresses?: SavedAddress[];
        pointsBalance?: number;
        loyaltyHistory?: LoyaltyEntry[];
        loyaltyWarning?: string | null;
        message?: string;
        error?: string;
      };
      if (!r.ok) {
        setOrdersMsg(j.error || "Could not load orders.");
        setOrders([]);
        setAddresses([]);
        setPointsBalance(getBrowserLoyaltyBalance(normalized));
        setLoyaltyHistory(
          getBrowserLoyaltyHistory(normalized).map((e) => ({
            sourceOrderId: e.sourceOrderId,
            points: e.points,
            orderTotal: e.orderTotal,
            createdAt: e.createdAt,
          }))
        );
        return;
      }
      setOrders(j.orders ?? []);
      const fromApi = j.addresses ?? [];
      const fromBrowser = readBrowserLastOrderAddress(normalized);
      setAddresses(mergeSavedAddresses(fromApi, fromBrowser));

      const serverPoints = typeof j.pointsBalance === "number" ? j.pointsBalance : 0;
      const browserPoints = getBrowserLoyaltyBalance(normalized);
      setPointsBalance(Math.max(serverPoints, browserPoints));

      const serverHistory = j.loyaltyHistory ?? [];
      if (serverHistory.length > 0) {
        setLoyaltyHistory(serverHistory);
      } else {
        setLoyaltyHistory(
          getBrowserLoyaltyHistory(normalized).map((e) => ({
            sourceOrderId: e.sourceOrderId,
            points: e.points,
            orderTotal: e.orderTotal,
            createdAt: e.createdAt,
          }))
        );
      }

      const msgs: string[] = [];
      if (j.message) msgs.push(j.message);
      if (j.loyaltyWarning) msgs.push(j.loyaltyWarning);
      if ((j.orders ?? []).length === 0 && browserOrder) {
        msgs.push("Your latest checkout from this browser was synced to your account.");
      } else if ((j.orders ?? []).length === 0) {
        msgs.push("No orders yet for this account.");
      }
      setOrdersMsg(msgs.length ? msgs.join(" ") : null);
    } finally {
      setOrdersBusy(false);
    }
  }, []);

  useEffect(() => {
    const s = readAccountSession();
    if (s) {
      const normalized = s.email.trim().toLowerCase();
      const browserOrder = readBrowserOrderForSync(normalized);
      if (browserOrder) {
        recordBrowserLoyalty(normalized, browserOrder.sourceOrderId, browserOrder.total);
      }
      setPointsBalance(getBrowserLoyaltyBalance(normalized));
      setSession(s);
      setView("dashboard");
      setProfileFirst(s.firstName);
      setProfileLast(s.lastName);
      void loadOrders(s.email);
    }
    setMounted(true);
  }, [loadOrders]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const email = loginEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError("Enter a valid email address.");
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError("Password must be at least 6 characters.");
      return;
    }
    setLoginBusy(true);
    try {
      const s: AccountSession = {
        email,
        firstName: email.split("@")[0] ?? "",
        lastName: "",
        signedInAt: new Date().toISOString(),
      };
      writeAccountSession(s);
      setSession(s);
      setProfileFirst(s.firstName);
      setProfileLast(s.lastName);
      setView("dashboard");
      setTab("home");
      await loadOrders(email);
    } finally {
      setLoginBusy(false);
    }
  }

  function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    if (!recoverEmail.trim()) return;
    setRecoverSent(true);
  }

  function signOut() {
    clearAccountSession();
    setSession(null);
    setOrders([]);
    setView("login");
    setLoginPassword("");
    setRecoverSent(false);
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    const next: AccountSession = {
      ...session,
      firstName: profileFirst.trim(),
      lastName: profileLast.trim(),
    };
    writeAccountSession(next);
    setSession(next);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  if (!mounted) {
    return <div className={ui.loadingBg} aria-hidden />;
  }

  if (view === "login" || view === "recover") {
    return (
      <div className={ui.loginBg}>
        {variant === "rays" && <RaysPageBreadcrumbs trail={[{ label: "Account" }]} />}
        <div className="mx-auto max-w-md px-4 py-10 md:py-16 md:px-6">
          <p className={ui.eyebrow}>Account</p>

          {view === "login" ? (
            <>
              <h1 className={ui.title}>Welcome back!</h1>
              {recoverSent && (
                <p className={`mt-4 text-center text-sm ${ui.accent}`} role="status">
                  Password recovery sent!
                </p>
              )}
              <form onSubmit={handleLogin} className="mt-10 space-y-5">
                <div>
                  <label htmlFor="login-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={ui.input}
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={ui.input}
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-red-700" role="alert">
                    {loginError}
                  </p>
                )}
                <button type="submit" disabled={loginBusy} className={ui.btnPrimary}>
                  {loginBusy ? "Signing in…" : "Login"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setView("recover");
                    setRecoverEmail(loginEmail);
                    setRecoverSent(false);
                  }}
                  className={ui.linkMuted}
                >
                  Forgot your password?
                </button>
              </p>
              <p className={`mt-4 text-center text-sm ${ui.body}`}>
                <Link href={paths.accountRegister} className={ui.link}>
                  Create an account
                </Link>
              </p>
              <p className={`mt-10 text-center text-xs ${ui.body}`}>
                Use the email from checkout. Demo sign-in stores your session on this device only.
              </p>
            </>
          ) : (
            <>
              <h1 className={ui.titleRecover}>Recover your password</h1>
              {recoverSent ? (
                <p className={`mt-6 text-center text-sm ${ui.accent}`} role="status">
                  Password recovery sent! Check your inbox for reset instructions.
                </p>
              ) : (
                <form onSubmit={handleRecover} className="mt-10 space-y-5">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    className={ui.input}
                  />
                  <button type="submit" className={ui.btnPrimary}>
                    Submit
                  </button>
                </form>
              )}
              <p className="mt-8 text-center">
                <button type="button" onClick={() => setView("login")} className={`text-sm ${ui.linkMuted}`}>
                  Cancel
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const name = session ? displayName(session) : "";
  const browserOrderPending =
    session != null && orders.length === 0 && readBrowserOrderForSync(session.email) != null;
  const displayOrderCount = orders.length > 0 ? orders.length : browserOrderPending ? 1 : 0;

  return (
    <div className={ui.pageBg}>
      {variant === "rays" && <RaysPageBreadcrumbs trail={[{ label: "Account" }]} />}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <aside className="lg:w-56 shrink-0">
            <p className={ui.sidebarLabel}>My account</p>
            <p className={ui.sidebarName}>Hi, {name}</p>
            <p className={`mt-1 text-sm ${ui.body}`}>{session?.email}</p>
            <nav className="mt-8 space-y-1" aria-label="Account sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    tab === t.id ? ui.tabActive : ui.tabIdle
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <button type="button" onClick={signOut} className={`mt-8 text-sm ${ui.linkMuted}`}>
              Sign out
            </button>
            <Link href={paths.orderConfirmation} className={`mt-4 block text-sm ${ui.accent} underline`}>
              Last order (this browser)
            </Link>
          </aside>

          <main className={ui.panel}>
            {tab === "home" && (
              <div>
                <h2 className={ui.h2}>Welcome back, {name}</h2>
                <p className={`mt-2 ${ui.body}`}>
                  Manage orders, update your profile, and track rewards from one place.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTab("orders")}
                    className={ui.card}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wider ${ui.body}`}>Orders</p>
                    <p className={`mt-2 text-2xl font-semibold ${variant === "rays" ? "text-rays-black" : "text-neutral-900"}`}>
                      {displayOrderCount}
                    </p>
                    <p className={`mt-1 text-sm ${ui.body}`}>View order history</p>
                  </button>
                  <button type="button" onClick={() => setTab("rewards")} className={ui.card}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${ui.body}`}>Rewards</p>
                    <p className={`mt-2 text-2xl font-semibold ${variant === "rays" ? "text-rays-black" : "text-neutral-900"}`}>
                      {pointsBalance.toLocaleString("en-IN")} pts
                    </p>
                    <p className={`mt-1 text-sm ${ui.body}`}>1 point per ₹1 spent</p>
                  </button>
                </div>
                <div className={`mt-8 rounded-xl p-5 ${variant === "rays" ? "bg-rays-cream" : "bg-brand-mist/50"}`}>
                  <p className={`text-sm font-semibold ${variant === "rays" ? "text-rays-black" : "text-neutral-900"}`}>
                    Skin health is a shared journey
                  </p>
                  <p className={`mt-2 text-sm ${ui.body}`}>
                    Build your routine with our{" "}
                    <Link href={paths.routineBuilder} className={`${ui.accent} underline`}>
                      routine builder
                    </Link>{" "}
                    or explore{" "}
                    <Link href={paths.shop} className={`${ui.accent} underline`}>
                      the shop
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className={ui.h2}>Orders</h2>
                  <button
                    type="button"
                    disabled={ordersBusy || !session}
                    onClick={() => session && loadOrders(session.email)}
                    className={`text-sm font-semibold ${ui.accent} underline disabled:opacity-50`}
                  >
                    {ordersBusy ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
                {ordersMsg && <p className={`mt-4 text-sm ${ui.body}`}>{ordersMsg}</p>}
                <ul className="mt-6 space-y-4">
                  {orders.map((o) => {
                    const total = parseTotal(o.totalsJson);
                    const items = parseItems(o.itemsJson);
                    const open = expandedOrder === o.id;
                    return (
                      <li key={o.id} className="rounded-xl border border-black/5 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedOrder(open ? null : o.id)}
                          className="flex w-full flex-wrap items-start justify-between gap-3 p-5 text-left hover:bg-neutral-50/80"
                        >
                          <div>
                            <p className="font-mono text-sm font-semibold">{o.sourceOrderId}</p>
                            <p className="mt-1 text-xs text-neutral-500">
                              {new Date(o.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              · {statusLabel(o.status)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{total != null ? <Money amount={total} /> : "—"}</p>
                            <p className="mt-1 text-xs text-neutral-500">{open ? "Hide details" : "View details"}</p>
                          </div>
                        </button>
                        {open && (
                          <div className="border-t border-black/5 bg-neutral-50/50 px-5 py-4">
                            <ul className="space-y-2 text-sm">
                              {items.map((line, i) => (
                                <li key={i} className="flex justify-between gap-4">
                                  <span>
                                    {line.name ?? line.sku ?? "Item"} × {line.qty ?? 1}
                                  </span>
                                  {typeof line.price === "number" && (
                                    <span className="shrink-0 text-neutral-600">
                                      <Money amount={line.price * (line.qty ?? 1)} />
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 flex flex-wrap gap-3">
                              <Link href={paths.shop} className={ui.btnSecondary}>
                                Buy again
                              </Link>
                              <Link
                                href={paths.contact}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                                  variant === "rays" ? "border-rays-line text-rays-gray" : "border-neutral-200 text-neutral-600"
                                }`}
                              >
                                Get help
                              </Link>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {orders.length === 0 && !ordersBusy && (
                  <Link href={paths.shop} className={`mt-8 inline-block ${ui.btnSecondary}`}>
                    Shop now
                  </Link>
                )}
              </div>
            )}

            {tab === "profile" && session && (
              <div>
                <h2 className={ui.h2}>Profile</h2>
                <form onSubmit={saveProfile} className="mt-8 max-w-md space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="profile-first" className={`text-xs font-semibold uppercase tracking-wider ${ui.body}`}>
                        First name
                      </label>
                      <input
                        id="profile-first"
                        value={profileFirst}
                        onChange={(e) => setProfileFirst(e.target.value)}
                        className={`mt-2 ${ui.input}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-last" className={`text-xs font-semibold uppercase tracking-wider ${ui.body}`}>
                        Last name
                      </label>
                      <input
                        id="profile-last"
                        value={profileLast}
                        onChange={(e) => setProfileLast(e.target.value)}
                        className={`mt-2 ${ui.input}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Email</label>
                    <p className="mt-2 text-neutral-900">{session.email}</p>
                  </div>
                  <button type="submit" className={ui.btnPrimary}>
                    Save
                  </button>
                  {profileSaved && (
                    <p className={`text-sm ${ui.accent}`} role="status">
                      Profile updated.
                    </p>
                  )}
                </form>
              </div>
            )}

            {tab === "addresses" && (
              <div>
                <h2 className={ui.h2}>Addresses</h2>
                {ordersBusy ? (
                  <p className={`mt-4 text-sm ${ui.body}`}>Loading addresses…</p>
                ) : addresses.length > 0 ? (
                  <ul className="mt-6 space-y-4">
                    {addresses.map((addr) => (
                      <li
                        key={`${addr.sourceOrderId}-${addr.pin}`}
                        className={`rounded-xl border p-5 ${variant === "rays" ? "border-[#e8e0d5] bg-[#faf8f5]" : "border-neutral-200 bg-neutral-50"}`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {addr.isDefault && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                variant === "rays" ? "bg-[#e85d04] text-white" : "bg-neutral-900 text-white"
                              }`}
                            >
                              Default
                            </span>
                          )}
                          <span className={`text-xs ${ui.body}`}>
                            From order {addr.sourceOrderId}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-neutral-900">{addr.address}</p>
                        <p className="mt-1 text-sm text-neutral-700">
                          {addr.city}, {addr.pin}
                        </p>
                        {addr.gstNumber && (
                          <p className={`mt-2 text-xs ${ui.body}`}>GSTIN: {addr.gstNumber}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <p className={`mt-2 text-sm ${ui.body}`}>
                      No saved addresses yet. Shipping addresses from your orders will appear here after checkout.
                    </p>
                    <Link
                      href={paths.checkout}
                      className={`mt-6 inline-block text-sm font-semibold ${ui.accent} underline`}
                    >
                      Go to checkout
                    </Link>
                  </>
                )}
              </div>
            )}

            {tab === "rewards" && (
              <div>
                <h2 className={ui.h2}>Rewards</h2>
                <p className={`mt-2 text-sm ${ui.body}`}>
                  Earn 1 point for every ₹1 you spend. Points are added when an order is placed (including your past
                  orders on this account).
                </p>
                <div
                  className={`mt-6 rounded-xl border p-8 text-center ${
                    variant === "rays" ? "border-rays-line bg-rays-cream" : "border-neutral-200 bg-brand-mist/30"
                  }`}
                >
                  <p
                    className={`text-4xl font-semibold ${
                      variant === "rays" ? "font-rays text-rays-accent" : "font-display text-neutral-900"
                    }`}
                  >
                    {pointsBalance.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">Points balance</p>
                </div>
                {loyaltyHistory.length > 0 ? (
                  <div className="mt-8">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${ui.body}`}>Recent earnings</h3>
                    <ul className="mt-4 space-y-3">
                      {loyaltyHistory.map((entry) => (
                        <li
                          key={entry.sourceOrderId}
                          className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm ${
                            variant === "rays" ? "border-rays-line" : "border-black/5"
                          }`}
                        >
                          <div>
                            <p className="font-mono font-semibold">{entry.sourceOrderId}</p>
                            <p className={`text-xs ${ui.body}`}>
                              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                              {entry.orderTotal > 0 ? (
                                <>
                                  {" "}
                                  · order{" "}
                                  <Money amount={entry.orderTotal} />
                                </>
                              ) : null}
                            </p>
                          </div>
                          <p className={`font-semibold ${ui.accent}`}>+{entry.points.toLocaleString("en-IN")} pts</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className={`mt-6 text-sm ${ui.body}`}>
                    Complete a purchase while signed in with this email to start earning points.
                  </p>
                )}
                <Link href={paths.shop} className={`mt-8 inline-block ${ui.btnSecondary}`}>
                  Shop to earn more
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
