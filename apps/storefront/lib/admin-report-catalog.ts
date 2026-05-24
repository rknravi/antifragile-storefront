/** Report navigation — aligned with Shopify default report groupings. */

export type ReportItem = {
  id: string;
  title: string;
  description: string;
};

export type ReportSection = {
  id: string;
  title: string;
  reports: ReportItem[];
};

export const ADMIN_REPORT_SECTIONS: ReportSection[] = [
  {
    id: "sales",
    title: "Sales reports",
    reports: [
      {
        id: "gross-sales-over-time",
        title: "Gross sales over time",
        description: "Product subtotal before discounts, by day.",
      },
      {
        id: "net-sales-over-time",
        title: "Net sales over time",
        description: "Order totals after discounts, tax, and shipping, by day.",
      },
      {
        id: "sales-over-time",
        title: "Sales over time",
        description: "Daily revenue and order count (same as net sales over time).",
      },
      {
        id: "average-order-value-over-time",
        title: "Average order value over time",
        description: "Mean order total per day.",
      },
      {
        id: "average-order-value",
        title: "Average order value",
        description: "Mean order total across the full selected period.",
      },
      {
        id: "average-order-quantity-over-time",
        title: "Average order quantity over time",
        description: "Mean line-item units per order, by day.",
      },
      {
        id: "net-sales-by-sales-channel",
        title: "Net sales by sales channel",
        description: "Net sales by payment gateway (Razorpay, Cashfree, COD, demo).",
      },
      {
        id: "items-sold-by-referrer",
        title: "Items sold by referrer",
        description: "Units sold by payment gateway (referrer proxy until marketing analytics).",
      },
      {
        id: "new-vs-returning-customer-sales",
        title: "New vs returning customer sales",
        description: "Net sales from first-time vs repeat customers, by month.",
      },
      {
        id: "new-vs-returning-customers-sales-time",
        title: "New vs returning customers over time",
        description: "Customer counts by month — see Customers reports for detail.",
      },
      {
        id: "cc-new-customers",
        title: "CC — New customers",
        description: "Count of customers whose first order was in each month.",
      },
      {
        id: "cc-return-customers",
        title: "CC — Return customers",
        description: "Returning customers (repeat purchasers) active each month.",
      },
      {
        id: "cc-total-customers",
        title: "CC — Total customers",
        description: "Unique customers who placed an order each month.",
      },
      {
        id: "sales-by-customer-name",
        title: "Sales by customer name",
        description: "Net sales and order count for every customer in the period.",
      },
      {
        id: "sales-by-product",
        title: "Sales by product",
        description: "Units sold and revenue by SKU from order line items.",
      },
      {
        id: "top-product-variants-by-units",
        title: "Top product variants by units sold",
        description: "SKUs ranked by units sold.",
      },
      {
        id: "total-sales-by-billing-location",
        title: "Total sales by billing location",
        description: "Net sales by shipping city and PIN from checkout.",
      },
      {
        id: "bundle-total-sales-over-time",
        title: "Bundle total sales over time",
        description: "Orders with ritual bundle savings applied, by day.",
      },
      {
        id: "bundle-item-vs-non-bundle",
        title: "Bundle item versus non-bundle",
        description: "Compare orders with bundle discount vs single-SKU / non-bundle carts.",
      },
      {
        id: "total-sales-by-bundle",
        title: "Total sales by bundle",
        description: "Revenue attributed to detected ritual bundles.",
      },
      {
        id: "total-sales-by-bundle-components",
        title: "Total sales by bundle components",
        description: "Line items from bundle orders, by SKU.",
      },
      {
        id: "returns-over-time",
        title: "Returns over time",
        description: "Cancelled orders used as return proxy — no refund ledger yet.",
      },
      {
        id: "total-returns-over-time",
        title: "Total returns over time",
        description: "Cumulative view of cancelled-order value by day.",
      },
      {
        id: "total-sales-by-currency",
        title: "Total sales by currency",
        description: "All storefront orders are INR.",
      },
      {
        id: "pos-staff-orders-total",
        title: "POS staff orders total",
        description: "Point of sale — not applicable; online storefront only.",
      },
    ],
  },
  {
    id: "orders",
    title: "Order reports",
    reports: [
      {
        id: "orders-by-status",
        title: "Orders by status",
        description: "Fulfillment and payment status breakdown.",
      },
      {
        id: "orders-by-gateway",
        title: "Orders by payment gateway",
        description: "Checkout volume by Razorpay, Cashfree, COD, or demo.",
      },
    ],
  },
  {
    id: "acquisition",
    title: "Acquisition reports",
    reports: [
      {
        id: "sessions-by-referrer",
        title: "Sessions by referrer",
        description:
          "Order-based proxy: payment gateway mix stands in for referrer until web analytics (GA4) is connected.",
      },
      {
        id: "sessions-by-location",
        title: "Sessions by location",
        description:
          "Order-based proxy: unique customers and revenue by shipping city and PIN from checkout addresses.",
      },
      {
        id: "sessions-over-time",
        title: "Sessions over time",
        description:
          "Order-based proxy: daily order count. Connect analytics for true session counts.",
      },
      {
        id: "visitors-over-time",
        title: "Visitors over time",
        description:
          "Order-based proxy: unique customers with at least one order per day.",
      },
    ],
  },
  {
    id: "behavior",
    title: "Behavior reports",
    reports: [
      {
        id: "conversion-rate-breakdown",
        title: "Conversion rate breakdown",
        description:
          "Checkout funnel from completed orders only. Full funnel needs session analytics.",
      },
      {
        id: "conversion-rate-over-time",
        title: "Conversion rate over time",
        description: "Daily completed checkouts. Session conversion requires GA4 or similar.",
      },
      {
        id: "search-conversions-over-time",
        title: "Search conversions over time",
        description: "Requires server-side search logging or GA4 site search events.",
      },
      {
        id: "searches-by-search-term",
        title: "Searches by search term",
        description: "Top queries from your search integration — not yet logged on this storefront.",
      },
      {
        id: "sessions-by-landing-page",
        title: "Sessions by landing page",
        description: "First page per session — connect page-view analytics.",
      },
      {
        id: "sessions-by-device",
        title: "Sessions by device type",
        description: "Desktop vs mobile sessions — connect analytics.",
      },
    ],
  },
  {
    id: "customers",
    title: "Customers reports",
    reports: [
      {
        id: "new-customers-over-time",
        title: "New customers over time",
        description: "Customers grouped by the month of their first order.",
      },
      {
        id: "new-vs-returning-customers",
        title: "New vs returning customers over time",
        description: "First-time vs repeat purchasers by month.",
      },
      {
        id: "customers-by-location",
        title: "Customers by location",
        description: "Customer count and revenue by shipping city and PIN.",
      },
      {
        id: "returning-customers",
        title: "Returning customers",
        description: "Customers with two or more orders: spend, AOV, and order dates.",
      },
      {
        id: "one-time-customers",
        title: "One-time customers",
        description: "Customers who placed exactly one order.",
      },
      {
        id: "customer-cohort-analysis",
        title: "Customer cohort analysis",
        description: "Monthly acquisition cohorts and repeat purchase in months 0–3.",
      },
      {
        id: "predicted-spend-tier",
        title: "Predicted spend tier",
        description:
          "Demo tiers from lifetime spend percentiles — not Shopify’s ML model.",
      },
      {
        id: "rfm-analysis",
        title: "RFM customer analysis",
        description: "Recency, frequency, and monetary quintiles grouped into RFM segments.",
      },
      {
        id: "rfm-customer-list",
        title: "RFM customer list",
        description: "Per-customer RFM group with days since last order and spend.",
      },
      {
        id: "customers-overview",
        title: "Customers overview",
        description: "Unique shoppers and repeat purchase rate.",
      },
      {
        id: "top-customers",
        title: "Top customers",
        description: "Highest spenders by email from order history.",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance reports",
    reports: [
      {
        id: "finance-summary",
        title: "Finance summary",
        description: "Subtotal, discounts, tax, shipping, and net totals.",
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory reports",
    reports: [
      {
        id: "inventory-levels",
        title: "Inventory on hand",
        description: "Current catalog stock levels from catalog.json.",
      },
      {
        id: "low-stock",
        title: "Low stock products",
        description: "SKUs at or below their low-stock threshold.",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing reports",
    reports: [
      {
        id: "discount-performance",
        title: "Discount performance",
        description: "Orders with promotional or bundle discounts applied.",
      },
    ],
  },
  {
    id: "profit",
    title: "Profit reports",
    reports: [
      {
        id: "profit-summary",
        title: "Gross margin (demo)",
        description: "Net sales after discounts — cost of goods not configured in demo.",
      },
    ],
  },
  {
    id: "fraud",
    title: "Fraud reports",
    reports: [
      {
        id: "payment-risk",
        title: "Payment risk signals",
        description: "Demo vs live gateways and non-paid statuses for review.",
      },
    ],
  },
  {
    id: "retail",
    title: "Retail sales reports",
    reports: [
      {
        id: "retail-online",
        title: "Online store sales",
        description: "This storefront is online-only; all sales are D2C web orders.",
      },
    ],
  },
];

export const OVERVIEW_REPORT: ReportItem = {
  id: "overview",
  title: "Overview",
  description: "Key metrics across orders and catalog.",
};

export function findReportById(id: string): { section: ReportSection; report: ReportItem } | null {
  if (id === "overview") return null;
  for (const section of ADMIN_REPORT_SECTIONS) {
    const report = section.reports.find((r) => r.id === id);
    if (report) return { section, report };
  }
  return null;
}
