import type { AdminOrderRow } from "@/lib/admin-reports";

type Totals = { total?: number };
type Customer = { email?: string; name?: string };
type Shipping = { city?: string; pin?: string };

export type CustomerProfile = {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderAt: string;
  lastOrderAt: string;
  city: string;
  pin: string;
};

export type RfmGroupRow = {
  group: string;
  description: string;
  customerCount: number;
  percentOfCustomers: number;
  avgDaysSinceLastOrder: number;
  totalOrders: number;
  totalSpent: number;
};

export type RfmCustomerRow = {
  email: string;
  name: string;
  rfmGroup: string;
  daysSinceLastOrder: number;
  orderCount: number;
  totalSpent: number;
};

export type CohortRow = {
  cohort: string;
  customers: number;
  period0: number;
  period1: number;
  period2: number;
  period3: number;
};

const RFM_GROUPS: { name: string; description: string; match: (r: number, fm: number) => boolean }[] = [
  { name: "Champions", description: "Very recent, many orders, high spend", match: (r, fm) => r === 5 && fm > 3 },
  { name: "Loyal", description: "Recent purchases, strong history", match: (r, fm) => r >= 3 && r <= 4 && fm > 3 },
  { name: "Active", description: "Recent purchases, moderate history", match: (r, fm) => r >= 4 && fm > 1 && fm <= 3 },
  { name: "New", description: "Very recent, few orders", match: (r, fm) => r === 5 && fm <= 1 },
  { name: "Promising", description: "Recent, lower spend", match: (r, fm) => r === 4 && fm <= 1 },
  { name: "Needs attention", description: "Moderate recency, moderate FM", match: (r, fm) => r === 3 && fm === 3 },
  { name: "At risk", description: "Not recent, but strong past history", match: (r, fm) => r <= 2 && fm > 2 && fm <= 4 },
  { name: "Previously loyal", description: "Not recent, very strong history", match: (r, fm) => r <= 2 && fm > 4 },
  { name: "Almost lost", description: "Moderate recency, low FM", match: (r, fm) => r === 3 && fm <= 2 },
  { name: "Dormant", description: "Inactive, infrequent, low spend", match: (r, fm) => r <= 2 && fm <= 2 },
];

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function scoreQuintile(value: number, sortedValues: number[]): number {
  if (!sortedValues.length) return 1;
  const rank = sortedValues.filter((v) => v <= value).length / sortedValues.length;
  if (rank >= 0.8) return 5;
  if (rank >= 0.6) return 4;
  if (rank >= 0.4) return 3;
  if (rank >= 0.2) return 2;
  return 1;
}

function assignRfmGroup(r: number, fm: number): string {
  for (const g of RFM_GROUPS) {
    if (g.match(r, fm)) return g.name;
  }
  return "Active";
}

export function buildCustomerProfiles(orders: AdminOrderRow[]): CustomerProfile[] {
  const map = new Map<string, CustomerProfile & { orderDates: string[] }>();

  for (const o of orders) {
    const customer = parseJson<Customer>(o.customerJson, {});
    const shipping = parseJson<Shipping>(o.shippingJson, {});
    const totals = parseJson<Totals>(o.totalsJson, {});
    const email = customer.email?.trim().toLowerCase() || "unknown";
    const total = typeof totals.total === "number" ? totals.total : 0;

    const existing = map.get(email) ?? {
      email,
      name: customer.name?.trim() || "—",
      orderCount: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      firstOrderAt: o.createdAt,
      lastOrderAt: o.createdAt,
      city: shipping.city?.trim() || "—",
      pin: shipping.pin?.trim() || "—",
      orderDates: [] as string[],
    };

    existing.orderCount += 1;
    existing.totalSpent += total;
    existing.orderDates.push(o.createdAt);
    if (o.createdAt < existing.firstOrderAt) existing.firstOrderAt = o.createdAt;
    if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
    if (shipping.city?.trim()) existing.city = shipping.city.trim();
    if (shipping.pin?.trim()) existing.pin = shipping.pin.trim();

    map.set(email, existing);
  }

  return [...map.values()].map(({ orderDates, ...p }) => ({
    ...p,
    averageOrderValue: p.orderCount > 0 ? Math.round(p.totalSpent / p.orderCount) : 0,
  }));
}

export function buildRfmAnalysis(profiles: CustomerProfile[]): {
  groups: RfmGroupRow[];
  customers: RfmCustomerRow[];
} {
  if (!profiles.length) return { groups: [], customers: [] };

  const now = Date.now();
  const msDay = 86400000;

  const recencyDays = profiles.map((p) =>
    Math.max(0, Math.floor((now - new Date(p.lastOrderAt).getTime()) / msDay))
  );
  const frequencies = profiles.map((p) => p.orderCount).sort((a, b) => a - b);
  const monetary = profiles.map((p) => p.totalSpent).sort((a, b) => a - b);

  const customers: RfmCustomerRow[] = profiles.map((p, i) => {
    const r = scoreQuintile(recencyDays[i], [...recencyDays].sort((a, b) => a - b));
    const f = scoreQuintile(p.orderCount, frequencies);
    const m = scoreQuintile(p.totalSpent, monetary);
    const fm = Math.round((f + m) / 2);
    return {
      email: p.email,
      name: p.name,
      rfmGroup: assignRfmGroup(r, fm),
      daysSinceLastOrder: recencyDays[i],
      orderCount: p.orderCount,
      totalSpent: p.totalSpent,
    };
  });

  const total = customers.length;
  const groups: RfmGroupRow[] = RFM_GROUPS.map((g) => {
    const inGroup = customers.filter((c) => c.rfmGroup === g.name);
    const days =
      inGroup.length > 0
        ? Math.round(inGroup.reduce((s, c) => s + c.daysSinceLastOrder, 0) / inGroup.length)
        : 0;
    return {
      group: g.name,
      description: g.description,
      customerCount: inGroup.length,
      percentOfCustomers: total > 0 ? Math.round((inGroup.length / total) * 100) : 0,
      avgDaysSinceLastOrder: days,
      totalOrders: inGroup.reduce((s, c) => s + c.orderCount, 0),
      totalSpent: inGroup.reduce((s, c) => s + c.totalSpent, 0),
    };
  }).filter((g) => g.customerCount > 0);

  return { groups, customers: customers.sort((a, b) => b.totalSpent - a.totalSpent) };
}

export function buildCustomerCohortFromOrders(
  orders: AdminOrderRow[],
  profiles: CustomerProfile[]
): CohortRow[] {
  const firstOrderMonth = new Map<string, string>();
  for (const p of profiles) {
    firstOrderMonth.set(p.email, monthKey(p.firstOrderAt));
  }

  const cohortEmails = new Map<string, Set<string>>();
  for (const p of profiles) {
    const m = monthKey(p.firstOrderAt);
    const set = cohortEmails.get(m) ?? new Set();
    set.add(p.email);
    cohortEmails.set(m, set);
  }

  const repeatByCohortOffset = new Map<string, Map<number, Set<string>>>();

  for (const o of orders) {
    const customer = parseJson<Customer>(o.customerJson, {});
    const email = customer.email?.trim().toLowerCase() || "unknown";
    const cohort = firstOrderMonth.get(email);
    if (!cohort) continue;

    const orderMonth = monthKey(o.createdAt);
    const cohortDate = new Date(`${cohort}-01`);
    const orderDate = new Date(`${orderMonth}-01`);
    const offset =
      (orderDate.getFullYear() - cohortDate.getFullYear()) * 12 +
      (orderDate.getMonth() - cohortDate.getMonth());
    if (offset < 0 || offset > 3) continue;

    const cohortMap = repeatByCohortOffset.get(cohort) ?? new Map();
    const set = cohortMap.get(offset) ?? new Set();
    set.add(email);
    cohortMap.set(offset, set);
    repeatByCohortOffset.set(cohort, cohortMap);
  }

  return [...cohortEmails.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([cohort, emails]) => {
      const offsets = repeatByCohortOffset.get(cohort) ?? new Map();
      return {
        cohort,
        customers: emails.size,
        period0: offsets.get(0)?.size ?? 0,
        period1: offsets.get(1)?.size ?? 0,
        period2: offsets.get(2)?.size ?? 0,
        period3: offsets.get(3)?.size ?? 0,
      };
    });
}

export function buildPredictedSpendTier(profiles: CustomerProfile[]): {
  tier: string;
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}[] {
  if (!profiles.length) return [];

  const sorted = [...profiles].sort((a, b) => b.totalSpent - a.totalSpent);
  const highCut = Math.max(1, Math.ceil(sorted.length * 0.2));
  const medCut = Math.max(highCut + 1, Math.ceil(sorted.length * 0.5));

  return sorted.map((p, i) => {
    let tier = "Low";
    if (i < highCut) tier = "High";
    else if (i < medCut) tier = "Medium";
    return {
      tier,
      email: p.email,
      name: p.name,
      orderCount: p.orderCount,
      totalSpent: p.totalSpent,
      lastOrderAt: p.lastOrderAt,
    };
  });
}

export function buildCustomersByLocation(profiles: CustomerProfile[]): {
  city: string;
  pin: string;
  newCustomers: number;
  revenue: number;
}[] {
  const map = new Map<string, { city: string; pin: string; emails: Set<string>; revenue: number }>();

  for (const p of profiles) {
    const key = `${p.city}|${p.pin}`;
    const row = map.get(key) ?? { city: p.city, pin: p.pin, emails: new Set(), revenue: 0 };
    row.emails.add(p.email);
    row.revenue += p.totalSpent;
    map.set(key, row);
  }

  return [...map.values()]
    .map((r) => ({
      city: r.city,
      pin: r.pin,
      newCustomers: r.emails.size,
      revenue: r.revenue,
    }))
    .sort((a, b) => b.newCustomers - a.newCustomers);
}

export function buildNewVsReturningOverTime(orders: AdminOrderRow[]): {
  period: string;
  type: "First-time" | "Returning";
  customers: number;
}[] {
  const firstOrder = new Map<string, string>();
  const profiles = buildCustomerProfiles(orders);
  for (const p of profiles) {
    firstOrder.set(p.email, p.firstOrderAt);
  }

  const buckets = new Map<string, { first: Set<string>; returning: Set<string> }>();

  for (const o of orders) {
    const period = monthKey(o.createdAt);
    const customer = parseJson<Customer>(o.customerJson, {});
    const email = customer.email?.trim().toLowerCase() || "unknown";
    const bucket = buckets.get(period) ?? { first: new Set(), returning: new Set() };
    const firstAt = firstOrder.get(email);
    if (firstAt && monthKey(firstAt) === period) bucket.first.add(email);
    else bucket.returning.add(email);
    buckets.set(period, bucket);
  }

  const rows: { period: string; type: "First-time" | "Returning"; customers: number }[] = [];
  for (const [period, b] of [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    rows.push({ period, type: "First-time", customers: b.first.size });
    rows.push({ period, type: "Returning", customers: b.returning.size });
  }
  return rows;
}

export function buildNewCustomersOverTime(profiles: CustomerProfile[]): {
  month: string;
  newCustomers: number;
}[] {
  const map = new Map<string, number>();
  for (const p of profiles) {
    const m = monthKey(p.firstOrderAt);
    map.set(m, (map.get(m) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, newCustomers]) => ({ month, newCustomers }));
}
