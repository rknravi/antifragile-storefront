/** Client-side loyalty ledger when DB is unavailable or order not yet synced. */

function pointsForOrderTotal(total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.floor(total);
}

export type BrowserLoyaltyEntry = {
  sourceOrderId: string;
  points: number;
  orderTotal: number;
  createdAt: string;
  email: string;
};

const LEDGER_KEY = "af_loyalty_ledger_v1";

function loadLedger(): BrowserLoyaltyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BrowserLoyaltyEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLedger(entries: BrowserLoyaltyEntry[]): void {
  localStorage.setItem(LEDGER_KEY, JSON.stringify(entries.slice(0, 100)));
}

/** Credit points for a completed checkout in this browser (idempotent per order id). */
export function recordBrowserLoyalty(email: string, sourceOrderId: string, orderTotal: number): number {
  const normalized = email.trim().toLowerCase();
  const id = sourceOrderId.trim();
  const points = pointsForOrderTotal(orderTotal);
  if (!normalized || !id || points <= 0) return getBrowserLoyaltyBalance(normalized);

  const entries = loadLedger();
  if (entries.some((e) => e.sourceOrderId === id)) {
    return getBrowserLoyaltyBalance(normalized);
  }

  entries.unshift({
    email: normalized,
    sourceOrderId: id,
    points,
    orderTotal: Math.floor(orderTotal),
    createdAt: new Date().toISOString(),
  });
  saveLedger(entries);
  return getBrowserLoyaltyBalance(normalized);
}

export function getBrowserLoyaltyBalance(email: string): number {
  const normalized = email.trim().toLowerCase();
  return loadLedger()
    .filter((e) => e.email === normalized)
    .reduce((sum, e) => sum + e.points, 0);
}

export function getBrowserLoyaltyHistory(email: string, limit = 12): BrowserLoyaltyEntry[] {
  const normalized = email.trim().toLowerCase();
  return loadLedger()
    .filter((e) => e.email === normalized)
    .slice(0, limit);
}

/** Last checkout snapshot for account order sync. */
export type BrowserOrderSync = {
  sourceOrderId: string;
  gateway: string;
  paymentRef?: string;
  customer: { name: string; email: string; mobile: string };
  shippingAddress: { address: string; city: string; pin: string; gstNumber?: string };
  items: { name: string; sku: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
};

export function readBrowserOrderForSync(accountEmail: string): BrowserOrderSync | null {
  if (typeof window === "undefined") return null;
  const email = accountEmail.trim().toLowerCase();
  try {
    const raw = sessionStorage.getItem("af_last_order");
    if (!raw) return null;
    const o = JSON.parse(raw) as {
      orderId?: string;
      paymentId?: string;
      gateway?: string;
      customer?: { name?: string; email?: string; mobile?: string };
      shippingAddress?: { address?: string; city?: string; pin?: string; gstNumber?: string };
      items?: { name?: string; sku?: string; qty?: number; price?: number }[];
      subtotal?: number;
      discount?: number;
      tax?: number;
      shippingFee?: number;
      total?: number;
    };
    if (o.customer?.email?.trim().toLowerCase() !== email) return null;
    if (!o.orderId || typeof o.total !== "number" || o.total <= 0) return null;

    return {
      sourceOrderId: o.orderId,
      gateway: o.gateway ?? "demo",
      paymentRef: o.paymentId,
      customer: {
        name: String(o.customer.name ?? "").trim(),
        email,
        mobile: String(o.customer.mobile ?? "").replace(/\D/g, ""),
      },
      shippingAddress: {
        address: String(o.shippingAddress?.address ?? "").trim(),
        city: String(o.shippingAddress?.city ?? "").trim(),
        pin: String(o.shippingAddress?.pin ?? "").replace(/\s/g, ""),
        ...(o.shippingAddress?.gstNumber ? { gstNumber: o.shippingAddress.gstNumber } : {}),
      },
      items: Array.isArray(o.items)
        ? o.items.map((i) => ({
            name: String(i.name ?? ""),
            sku: String(i.sku ?? ""),
            qty: Number(i.qty) || 1,
            price: Number(i.price) || 0,
          }))
        : [],
      subtotal: Number(o.subtotal) || 0,
      discount: Number(o.discount) || 0,
      tax: Number(o.tax) || 0,
      shippingFee: Number(o.shippingFee) || 0,
      total: o.total,
    };
  } catch {
    return null;
  }
}
