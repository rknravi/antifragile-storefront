import type { Product } from "@/lib/product-types";
import {
  buildCustomerCohortFromOrders,
  buildCustomerProfiles,
  buildCustomersByLocation,
  buildNewCustomersOverTime,
  buildNewVsReturningOverTime,
  buildPredictedSpendTier,
  buildRfmAnalysis,
  type CohortRow,
  type CustomerProfile,
  type RfmCustomerRow,
  type RfmGroupRow,
} from "@/lib/admin-customer-analytics";
import { buildSalesAnalytics, type SalesAnalytics } from "@/lib/admin-sales-analytics";

export type AdminOrderRow = {
  id: string;
  sourceOrderId: string;
  status: string;
  gateway: string;
  customerJson: string;
  shippingJson: string;
  itemsJson: string;
  totalsJson: string;
  createdAt: string;
};

type Totals = {
  subtotal?: number;
  discount?: number;
  tax?: number;
  shippingFee?: number;
  total?: number;
};

type LineItem = { name?: string; sku?: string; qty?: number; price?: number };

type Customer = { email?: string; name?: string };

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

export type AdminReportsPayload = {
  generatedAt: string;
  databaseConnected: boolean;
  orderCount: number;
  catalogCount: number;
  kpis: {
    grossSales: number;
    totalDiscount: number;
    totalTax: number;
    totalShipping: number;
    netSales: number;
    orders: number;
    averageOrderValue: number;
    uniqueCustomers: number;
    repeatCustomerRate: number;
  };
  salesOverTime: { date: string; revenue: number; orders: number }[];
  salesByProduct: { sku: string; name: string; units: number; revenue: number }[];
  ordersByStatus: { status: string; count: number; revenue: number }[];
  ordersByGateway: { gateway: string; count: number; revenue: number }[];
  topCustomers: { email: string; name: string; orders: number; revenue: number }[];
  finance: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  inventory: {
    sku: string;
    name: string;
    quantity: number;
    lowStockThreshold: number;
    isLow: boolean;
  }[];
  ordersWithDiscount: number;
  fraudSignals: {
    demoOrders: number;
    codOrders: number;
    cancelledOrders: number;
    nonPaidStatuses: number;
  };
  customersByLocation: { city: string; pin: string; newCustomers: number; revenue: number }[];
  newCustomersOverTime: { month: string; newCustomers: number }[];
  newVsReturningOverTime: { period: string; type: "First-time" | "Returning"; customers: number }[];
  returningCustomers: CustomerProfile[];
  oneTimeCustomers: CustomerProfile[];
  customerCohort: CohortRow[];
  predictedSpendTier: {
    tier: string;
    email: string;
    name: string;
    orderCount: number;
    totalSpent: number;
    lastOrderAt: string;
  }[];
  rfmGroups: RfmGroupRow[];
  rfmCustomers: RfmCustomerRow[];
  visitorsOverTime: { date: string; uniqueCustomers: number; orders: number }[];
  sales: SalesAnalytics;
};

export function buildAdminReports(orders: AdminOrderRow[], catalog: Product[]): AdminReportsPayload {
  const salesByDay = new Map<string, { revenue: number; orders: number }>();
  const productMap = new Map<string, { sku: string; name: string; units: number; revenue: number }>();
  const statusMap = new Map<string, { count: number; revenue: number }>();
  const gatewayMap = new Map<string, { count: number; revenue: number }>();
  const customerMap = new Map<string, { email: string; name: string; orders: number; revenue: number }>();

  let grossSales = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalShipping = 0;
  let subtotalSum = 0;
  let ordersWithDiscount = 0;
  let demoOrders = 0;
  let codOrders = 0;
  let cancelledOrders = 0;
  let nonPaidStatuses = 0;

  const paidLike = new Set(["paid", "demo_completed", "shipped"]);

  for (const o of orders) {
    const totals = parseJson<Totals>(o.totalsJson, {});
    const total = typeof totals.total === "number" ? totals.total : 0;
    const discount = typeof totals.discount === "number" ? totals.discount : 0;
    const tax = typeof totals.tax === "number" ? totals.tax : 0;
    const ship = typeof totals.shippingFee === "number" ? totals.shippingFee : 0;
    const sub = typeof totals.subtotal === "number" ? totals.subtotal : 0;

    grossSales += total;
    totalDiscount += discount;
    totalTax += tax;
    totalShipping += ship;
    subtotalSum += sub;
    if (discount > 0) ordersWithDiscount += 1;

    if (o.gateway === "demo") demoOrders += 1;
    if (o.gateway === "cod") codOrders += 1;
    if (o.status === "cancelled") cancelledOrders += 1;
    if (!paidLike.has(o.status)) nonPaidStatuses += 1;

    const dk = dayKey(o.createdAt);
    const day = salesByDay.get(dk) ?? { revenue: 0, orders: 0 };
    day.revenue += total;
    day.orders += 1;
    salesByDay.set(dk, day);

    const st = statusMap.get(o.status) ?? { count: 0, revenue: 0 };
    st.count += 1;
    st.revenue += total;
    statusMap.set(o.status, st);

    const gw = gatewayMap.get(o.gateway) ?? { count: 0, revenue: 0 };
    gw.count += 1;
    gw.revenue += total;
    gatewayMap.set(o.gateway, gw);

    const customer = parseJson<Customer>(o.customerJson, {});
    const email = customer.email?.trim().toLowerCase() || "unknown";
    const c = customerMap.get(email) ?? {
      email,
      name: customer.name?.trim() || "—",
      orders: 0,
      revenue: 0,
    };
    c.orders += 1;
    c.revenue += total;
    customerMap.set(email, c);

    const items = parseJson<LineItem[]>(o.itemsJson, []);
    for (const line of items) {
      const qty = typeof line.qty === "number" ? line.qty : 0;
      const price = typeof line.price === "number" ? line.price : 0;
      const sku = line.sku?.trim() || "unknown";
      const p = productMap.get(sku) ?? {
        sku,
        name: line.name?.trim() || sku,
        units: 0,
        revenue: 0,
      };
      p.units += qty;
      p.revenue += qty * price;
      productMap.set(sku, p);
    }
  }

  const salesOverTime = [...salesByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));

  const salesByProduct = [...productMap.values()].sort((a, b) => b.revenue - a.revenue);
  const ordersByStatus = [...statusMap.entries()]
    .map(([status, v]) => ({ status, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.count - a.count);
  const ordersByGateway = [...gatewayMap.entries()]
    .map(([gateway, v]) => ({ gateway, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const topCustomers = [...customerMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 15);
  const uniqueCustomers = customerMap.size;
  const repeatCustomers = [...customerMap.values()].filter((c) => c.orders > 1).length;
  const repeatCustomerRate =
    uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? Math.round(grossSales / orderCount) : 0;

  const inventory = catalog
    .filter((p) => p.status === "active")
    .map((p) => ({
      sku: p.sku,
      name: p.name,
      quantity: p.inventoryQuantity,
      lowStockThreshold: p.lowStockThreshold ?? 0,
      isLow: p.inventoryQuantity <= (p.lowStockThreshold ?? 0),
    }))
    .sort((a, b) => a.quantity - b.quantity);

  const profiles = buildCustomerProfiles(orders);
  const { groups: rfmGroups, customers: rfmCustomers } = buildRfmAnalysis(profiles);
  const returningCustomers = profiles
    .filter((p) => p.orderCount > 1)
    .sort((a, b) => b.totalSpent - a.totalSpent);
  const oneTimeCustomers = profiles
    .filter((p) => p.orderCount === 1)
    .sort((a, b) => b.totalSpent - a.totalSpent);

  const visitorsByDay = new Map<string, { emails: Set<string>; orders: number }>();
  for (const o of orders) {
    const dk = dayKey(o.createdAt);
    const customer = parseJson<Customer>(o.customerJson, {});
    const email = customer.email?.trim().toLowerCase() || "unknown";
    const row = visitorsByDay.get(dk) ?? { emails: new Set(), orders: 0 };
    row.emails.add(email);
    row.orders += 1;
    visitorsByDay.set(dk, row);
  }
  const visitorsOverTime = [...visitorsByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, uniqueCustomers: v.emails.size, orders: v.orders }));

  return {
    generatedAt: new Date().toISOString(),
    databaseConnected: true,
    orderCount,
    catalogCount: catalog.filter((p) => p.status === "active").length,
    kpis: {
      grossSales,
      totalDiscount,
      totalTax,
      totalShipping,
      netSales: grossSales,
      orders: orderCount,
      averageOrderValue,
      uniqueCustomers,
      repeatCustomerRate,
    },
    salesOverTime,
    salesByProduct,
    ordersByStatus,
    ordersByGateway,
    topCustomers,
    finance: {
      subtotal: subtotalSum,
      discount: totalDiscount,
      tax: totalTax,
      shipping: totalShipping,
      total: grossSales,
    },
    inventory,
    ordersWithDiscount,
    fraudSignals: {
      demoOrders,
      codOrders,
      cancelledOrders,
      nonPaidStatuses,
    },
    customersByLocation: buildCustomersByLocation(profiles),
    newCustomersOverTime: buildNewCustomersOverTime(profiles),
    newVsReturningOverTime: buildNewVsReturningOverTime(orders),
    returningCustomers,
    oneTimeCustomers,
    customerCohort: buildCustomerCohortFromOrders(orders, profiles),
    predictedSpendTier: buildPredictedSpendTier(profiles),
    rfmGroups,
    rfmCustomers,
    visitorsOverTime,
    sales: buildSalesAnalytics(orders, catalog),
  };
}

export function emptyAdminReports(message?: string): AdminReportsPayload {
  const base = buildAdminReports([], []);
  return {
    ...base,
    databaseConnected: false,
    generatedAt: new Date().toISOString(),
    ...(message ? {} : {}),
  };
}
