import type { Product } from "@/lib/product-types";
import type { AdminOrderRow } from "@/lib/admin-reports";
import { computeCartBundles } from "@/lib/bundle-cart";
import { ROUTINE_BUNDLES } from "@/lib/routine-bundles";

type Totals = {
  subtotal?: number;
  discount?: number;
  tax?: number;
  shippingFee?: number;
  total?: number;
};

type LineItem = { name?: string; sku?: string; qty?: number; price?: number };
type Customer = { email?: string; name?: string };
type Shipping = { city?: string; pin?: string };

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export type SalesAnalytics = {
  grossSalesOverTime: { date: string; grossSales: number; orders: number }[];
  netSalesOverTime: { date: string; netSales: number; orders: number }[];
  averageOrderValueOverTime: { date: string; aov: number; orders: number }[];
  averageOrderQuantityOverTime: { date: string; avgQuantity: number; orders: number; units: number }[];
  itemsSoldByReferrer: { channel: string; units: number; revenue: number }[];
  netSalesByChannel: { channel: string; orders: number; netSales: number }[];
  newVsReturningCustomerSales: { period: string; type: "New" | "Returning"; sales: number; orders: number }[];
  salesByCustomerName: { name: string; email: string; orders: number; netSales: number }[];
  salesByBillingLocation: { city: string; pin: string; orders: number; netSales: number }[];
  returnsOverTime: { date: string; returns: number; returnValue: number }[];
  totalSalesByCurrency: { currency: string; orders: number; netSales: number }[];
  bundleTotalSalesOverTime: { date: string; bundleOrders: number; netSales: number }[];
  bundleVsNonBundle: {
    type: "Bundle" | "Non-bundle";
    orders: number;
    netSales: number;
    units: number;
  }[];
  totalSalesByBundle: { bundle: string; orders: number; netSales: number; units: number }[];
  totalSalesByBundleComponents: { sku: string; name: string; units: number; revenue: number }[];
  ccNewCustomers: { month: string; customers: number }[];
  ccReturnCustomers: { month: string; customers: number }[];
  ccTotalCustomers: { month: string; customers: number }[];
};

export function buildSalesAnalytics(orders: AdminOrderRow[], catalog: Product[]): SalesAnalytics {
  const skuToSlug = new Map(catalog.map((p) => [p.sku, p.slug]));
  const firstOrderMonth = new Map<string, string>();

  const customerFirst = new Map<string, string>();
  for (const o of orders) {
    const customer = parseJson<Customer>(o.customerJson, {});
    const email = customer.email?.trim().toLowerCase() || "unknown";
    const existing = customerFirst.get(email);
    if (!existing || o.createdAt < existing) customerFirst.set(email, o.createdAt);
  }
  for (const [email, firstAt] of customerFirst) {
    firstOrderMonth.set(email, monthKey(firstAt));
  }

  const byDay = new Map<
    string,
    {
      gross: number;
      net: number;
      orders: number;
      units: number;
      bundleNet: number;
      bundleOrders: number;
      returns: number;
      returnValue: number;
    }
  >();

  const referrerUnits = new Map<string, { units: number; revenue: number }>();
  const channelSales = new Map<string, { orders: number; netSales: number }>();
  const customerSales = new Map<string, { name: string; email: string; orders: number; netSales: number }>();
  const locationSales = new Map<string, { city: string; pin: string; orders: number; netSales: number }>();
  const bundleSales = new Map<string, { orders: number; netSales: number; units: number }>();
  const bundleComponentMap = new Map<string, { sku: string; name: string; units: number; revenue: number }>();
  const newVsReturningSales = new Map<string, { newSales: number; newOrders: number; retSales: number; retOrders: number }>();
  const ccNew = new Map<string, Set<string>>();
  const ccReturn = new Map<string, Set<string>>();
  const ccTotal = new Map<string, Set<string>>();

  let bundleOrders = 0;
  let nonBundleOrders = 0;
  let bundleNet = 0;
  let nonBundleNet = 0;
  let bundleUnits = 0;
  let nonBundleUnits = 0;

  for (const o of orders) {
    const totals = parseJson<Totals>(o.totalsJson, {});
    const subtotal = typeof totals.subtotal === "number" ? totals.subtotal : 0;
    const total = typeof totals.total === "number" ? totals.total : 0;
    const discount = typeof totals.discount === "number" ? totals.discount : 0;
    const dk = dayKey(o.createdAt);
    const mk = monthKey(o.createdAt);

    const items = parseJson<LineItem[]>(o.itemsJson, []);
    let units = 0;
    const cartLines: { slug: string; quantity: number }[] = [];
    for (const line of items) {
      const qty = typeof line.qty === "number" ? line.qty : 0;
      const price = typeof line.price === "number" ? line.price : 0;
      units += qty;
      const sku = line.sku?.trim() || "";
      const slug = skuToSlug.get(sku);
      if (slug) cartLines.push({ slug, quantity: qty });

      const gw = o.gateway;
      const ref = referrerUnits.get(gw) ?? { units: 0, revenue: 0 };
      ref.units += qty;
      ref.revenue += qty * price;
      referrerUnits.set(gw, ref);
    }

    const bundleResult = computeCartBundles(catalog, cartLines);
    const isBundleOrder = bundleResult.applied.length > 0 && discount > 0;
    const isReturn = o.status === "cancelled";

    const day = byDay.get(dk) ?? {
      gross: 0,
      net: 0,
      orders: 0,
      units: 0,
      bundleNet: 0,
      bundleOrders: 0,
      returns: 0,
      returnValue: 0,
    };
    if (isReturn) {
      day.returns += 1;
      day.returnValue += total;
    } else {
      day.gross += subtotal;
      day.net += total;
      day.orders += 1;
      day.units += units;
      if (isBundleOrder) {
        day.bundleNet += total;
        day.bundleOrders += 1;
      }
    }
    byDay.set(dk, day);

    if (!isReturn) {
      const ch = channelSales.get(o.gateway) ?? { orders: 0, netSales: 0 };
      ch.orders += 1;
      ch.netSales += total;
      channelSales.set(o.gateway, ch);

      const customer = parseJson<Customer>(o.customerJson, {});
      const email = customer.email?.trim().toLowerCase() || "unknown";
      const name = customer.name?.trim() || "—";
      const cs = customerSales.get(email) ?? { name, email, orders: 0, netSales: 0 };
      cs.orders += 1;
      cs.netSales += total;
      customerSales.set(email, cs);

      const shipping = parseJson<Shipping>(o.shippingJson, {});
      const city = shipping.city?.trim() || "—";
      const pin = shipping.pin?.trim() || "—";
      const locKey = `${city}|${pin}`;
      const loc = locationSales.get(locKey) ?? { city, pin, orders: 0, netSales: 0 };
      loc.orders += 1;
      loc.netSales += total;
      locationSales.set(locKey, loc);

      const nvr = newVsReturningSales.get(mk) ?? { newSales: 0, newOrders: 0, retSales: 0, retOrders: 0 };
      const isNew = firstOrderMonth.get(email) === mk;
      if (isNew) {
        nvr.newSales += total;
        nvr.newOrders += 1;
      } else {
        nvr.retSales += total;
        nvr.retOrders += 1;
      }
      newVsReturningSales.set(mk, nvr);

      const totalSet = ccTotal.get(mk) ?? new Set();
      totalSet.add(email);
      ccTotal.set(mk, totalSet);

      if (isNew) {
        const newSet = ccNew.get(mk) ?? new Set();
        newSet.add(email);
        ccNew.set(mk, newSet);
      } else {
        const retSet = ccReturn.get(mk) ?? new Set();
        retSet.add(email);
        ccReturn.set(mk, retSet);
      }

      if (isBundleOrder) {
        bundleOrders += 1;
        bundleNet += total;
        bundleUnits += units;
        for (const b of bundleResult.applied) {
          const row = bundleSales.get(b.title) ?? { orders: 0, netSales: 0, units: 0 };
          row.orders += 1;
          row.netSales += total / bundleResult.applied.length;
          row.units += units;
          bundleSales.set(b.title, row);
        }
        for (const line of items) {
          const qty = typeof line.qty === "number" ? line.qty : 0;
          const price = typeof line.price === "number" ? line.price : 0;
          const sku = line.sku?.trim() || "unknown";
          const comp = bundleComponentMap.get(sku) ?? {
            sku,
            name: line.name?.trim() || sku,
            units: 0,
            revenue: 0,
          };
          comp.units += qty;
          comp.revenue += qty * price;
          bundleComponentMap.set(sku, comp);
        }
      } else {
        nonBundleOrders += 1;
        nonBundleNet += total;
        nonBundleUnits += units;
      }
    }
  }

  const sortedDays = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  return {
    grossSalesOverTime: sortedDays.map(([date, d]) => ({
      date,
      grossSales: d.gross,
      orders: d.orders,
    })),
    netSalesOverTime: sortedDays.map(([date, d]) => ({
      date,
      netSales: d.net,
      orders: d.orders,
    })),
    averageOrderValueOverTime: sortedDays.map(([date, d]) => ({
      date,
      aov: d.orders > 0 ? Math.round(d.net / d.orders) : 0,
      orders: d.orders,
    })),
    averageOrderQuantityOverTime: sortedDays.map(([date, d]) => ({
      date,
      avgQuantity: d.orders > 0 ? Math.round((d.units / d.orders) * 10) / 10 : 0,
      orders: d.orders,
      units: d.units,
    })),
    itemsSoldByReferrer: [...referrerUnits.entries()]
      .map(([channel, v]) => ({ channel, units: v.units, revenue: v.revenue }))
      .sort((a, b) => b.units - a.units),
    netSalesByChannel: [...channelSales.entries()]
      .map(([channel, v]) => ({ channel, orders: v.orders, netSales: v.netSales }))
      .sort((a, b) => b.netSales - a.netSales),
    newVsReturningCustomerSales: [...newVsReturningSales.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([period, v]) => [
        { period, type: "New" as const, sales: v.newSales, orders: v.newOrders },
        { period, type: "Returning" as const, sales: v.retSales, orders: v.retOrders },
      ]),
    salesByCustomerName: [...customerSales.values()].sort((a, b) => b.netSales - a.netSales),
    salesByBillingLocation: [...locationSales.values()].sort((a, b) => b.netSales - a.netSales),
    returnsOverTime: sortedDays.map(([date, d]) => ({
      date,
      returns: d.returns,
      returnValue: d.returnValue,
    })),
    totalSalesByCurrency: [{ currency: "INR", orders: orders.filter((o) => o.status !== "cancelled").length, netSales: orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (parseJson<Totals>(o.totalsJson, {}).total ?? 0), 0) }],
    bundleTotalSalesOverTime: sortedDays.map(([date, d]) => ({
      date,
      bundleOrders: d.bundleOrders,
      netSales: d.bundleNet,
    })),
    bundleVsNonBundle: [
      { type: "Bundle", orders: bundleOrders, netSales: bundleNet, units: bundleUnits },
      { type: "Non-bundle", orders: nonBundleOrders, netSales: nonBundleNet, units: nonBundleUnits },
    ],
    totalSalesByBundle: [...bundleSales.entries()]
      .map(([bundle, v]) => ({ bundle, ...v }))
      .sort((a, b) => b.netSales - a.netSales),
    totalSalesByBundleComponents: [...bundleComponentMap.values()].sort((a, b) => b.revenue - a.revenue),
    ccNewCustomers: [...ccNew.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, set]) => ({ month, customers: set.size })),
    ccReturnCustomers: [...ccReturn.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, set]) => ({ month, customers: set.size })),
    ccTotalCustomers: [...ccTotal.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, set]) => ({ month, customers: set.size })),
  };
}

/** Labels for empty bundle catalog reference in UI. */
export const BUNDLE_REPORT_LABELS = ROUTINE_BUNDLES.map((b) => b.title);
