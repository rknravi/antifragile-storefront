import type { SavedAddress } from "@/lib/shipping-address";

/** Client-only last order snapshot (sessionStorage after checkout). */

type LastOrderSnapshot = {
  orderId?: string;
  customer?: { email?: string; name?: string; mobile?: string };
  shippingAddress?: {
    address?: string;
    city?: string;
    pin?: string;
    gstNumber?: string;
  };
  createdAt?: string;
};

const KEY = "af_last_order";

function readBrowserLastOrderSnapshot(accountEmail: string): LastOrderSnapshot | null {
  if (typeof window === "undefined") return null;
  const email = accountEmail.trim().toLowerCase();
  if (!email) return null;

  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as LastOrderSnapshot;
    if (o.customer?.email?.trim().toLowerCase() !== email) return null;
    return o;
  } catch {
    return null;
  }
}

/** Name / mobile from the last checkout in this browser (sessionStorage). */
export function readBrowserLastOrderContact(
  accountEmail: string
): { name?: string; mobile?: string } | null {
  const o = readBrowserLastOrderSnapshot(accountEmail);
  if (!o?.customer) return null;

  const name = typeof o.customer.name === "string" ? o.customer.name.trim() : undefined;
  const mobile =
    typeof o.customer.mobile === "string" ? o.customer.mobile.replace(/\D/g, "").slice(0, 15) : undefined;

  if (!name && !mobile) return null;
  return { ...(name ? { name } : {}), ...(mobile ? { mobile } : {}) };
}

export function readBrowserLastOrderAddress(accountEmail: string): SavedAddress | null {
  const o = readBrowserLastOrderSnapshot(accountEmail);
  if (!o) return null;

  try {

    const ship = o.shippingAddress;
    const address = typeof ship?.address === "string" ? ship.address.trim() : "";
    const city = typeof ship?.city === "string" ? ship.city.trim() : "";
    const pin = typeof ship?.pin === "string" ? ship.pin.replace(/\s/g, "").trim() : "";
    if (!address || !city || !pin) return null;

    const gstNumber =
      typeof ship?.gstNumber === "string" && ship.gstNumber.trim()
        ? ship.gstNumber.trim().toUpperCase()
        : undefined;

    return {
      address,
      city,
      pin,
      ...(gstNumber ? { gstNumber } : {}),
      sourceOrderId: typeof o.orderId === "string" ? o.orderId : "browser",
      createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
      isDefault: false,
    };
  } catch {
    return null;
  }
}
