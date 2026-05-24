/** Shipping address shape persisted on orders (shippingJson). */

export type ShippingAddress = {
  address: string;
  city: string;
  pin: string;
  gstNumber?: string;
};

export type SavedAddress = ShippingAddress & {
  sourceOrderId: string;
  createdAt: string;
  isDefault: boolean;
};

export function addressKey(addr: Pick<ShippingAddress, "address" | "city" | "pin">): string {
  return [addr.address, addr.city, addr.pin].map((s) => s.trim().toLowerCase()).join("|");
}

export function parseShippingJson(raw: string | null | undefined): ShippingAddress | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<ShippingAddress>;
    const address = typeof s.address === "string" ? s.address.trim() : "";
    const city = typeof s.city === "string" ? s.city.trim() : "";
    const pin = typeof s.pin === "string" ? s.pin.replace(/\s/g, "").trim() : "";
    if (!address || !city || !pin) return null;
    const gstNumber =
      typeof s.gstNumber === "string" && s.gstNumber.trim() ? s.gstNumber.trim().toUpperCase() : undefined;
    return { address, city, pin, ...(gstNumber ? { gstNumber } : {}) };
  } catch {
    return null;
  }
}

type OrderRow = {
  shippingJson: string;
  sourceOrderId: string;
  createdAt: Date | string;
};

/** Dedupe by address/city/pin; newest order first; first entry is default. */
export function extractAddressesFromOrderRows(rows: OrderRow[]): SavedAddress[] {
  const seen = new Set<string>();
  const out: SavedAddress[] = [];

  for (const row of rows) {
    const ship = parseShippingJson(row.shippingJson);
    if (!ship) continue;
    const key = addressKey(ship);
    if (seen.has(key)) continue;
    seen.add(key);
    const createdAt = row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt);
    out.push({
      ...ship,
      sourceOrderId: row.sourceOrderId,
      createdAt,
      isDefault: out.length === 0,
    });
  }

  return out;
}

export function mergeSavedAddresses(api: SavedAddress[], extra: SavedAddress | null): SavedAddress[] {
  if (!extra?.address) return api;
  if (api.some((a) => addressKey(a) === addressKey(extra))) return api;
  return [
    { ...extra, isDefault: true },
    ...api.map((a) => ({ ...a, isDefault: false })),
  ];
}
