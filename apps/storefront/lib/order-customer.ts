/** Parse customerJson from persisted orders. */

export type OrderCustomer = {
  name?: string;
  email?: string;
  mobile?: string;
};

export function parseOrderCustomer(customerJson: string): OrderCustomer {
  try {
    const c = JSON.parse(customerJson) as OrderCustomer;
    return {
      name: typeof c.name === "string" ? c.name.trim() : undefined,
      email: typeof c.email === "string" ? c.email.trim().toLowerCase() : undefined,
      mobile:
        typeof c.mobile === "string" ? c.mobile.replace(/\D/g, "").slice(0, 15) : undefined,
    };
  } catch {
    return {};
  }
}

type OrderRow = { customerJson: string };

/**
 * Best contact for checkout prefill: newest order wins for name/email;
 * mobile is taken from the newest order that has one (older orders included).
 */
export function extractLastCustomerFromOrders(rows: OrderRow[]): OrderCustomer | null {
  if (!rows.length) return null;

  const parsed = rows.map((r) => parseOrderCustomer(r.customerJson));
  const newest = parsed[0];

  let mobile = newest.mobile;
  if (!mobile) {
    for (const c of parsed) {
      if (c.mobile) {
        mobile = c.mobile;
        break;
      }
    }
  }

  return {
    name: newest.name,
    email: newest.email,
    mobile,
  };
}
