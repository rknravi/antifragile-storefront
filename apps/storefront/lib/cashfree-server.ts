/** Server-only Cashfree PG helpers. */

export function cashfreeBaseUrl(): string {
  return process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export function cashfreeCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export type CashfreeOrderStatus = {
  order_status?: string;
  order_id?: string;
};

/** Fetch Cashfree order status (PG API). */
export async function fetchCashfreeOrder(cfOrderId: string): Promise<CashfreeOrderStatus | null> {
  const creds = cashfreeCredentials();
  if (!creds) return null;
  const res = await fetch(`${cashfreeBaseUrl()}/orders/${encodeURIComponent(cfOrderId)}`, {
    headers: {
      "x-client-id": creds.clientId,
      "x-client-secret": creds.clientSecret,
      "x-api-version": "2022-09-01",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as CashfreeOrderStatus;
}

export function isCashfreeOrderPaid(status: string | undefined): boolean {
  const s = (status ?? "").toUpperCase();
  return s === "PAID" || s === "ACTIVE";
}
