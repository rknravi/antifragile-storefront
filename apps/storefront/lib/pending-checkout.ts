/** Shape stored in sessionStorage before Cashfree redirect (client-only). */

export type PendingCheckoutItem = {
  name: string;
  sku: string;
  qty: number;
  price: number;
};

export type PendingCheckout = {
  gateway: "cashfree";
  cfOrderId: string;
  customer: { name: string; email: string; mobile: string };
  shippingAddress: { address: string; city: string; pin: string; gstNumber?: string };
  items: PendingCheckoutItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
};

export const PENDING_CHECKOUT_KEY = "af_pending_checkout";

export function readPendingCheckout(): PendingCheckout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingCheckout;
  } catch {
    return null;
  }
}

export function writePendingCheckout(data: PendingCheckout): void {
  sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(data));
}

export function clearPendingCheckout(): void {
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
}
