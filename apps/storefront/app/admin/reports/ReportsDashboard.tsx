"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_REPORT_SECTIONS,
  OVERVIEW_REPORT,
  findReportById,
} from "@/lib/admin-report-catalog";
import type { AdminReportsPayload } from "@/lib/admin-reports";
import { AdminPortalNav } from "@/components/admin/AdminPortalNav";
import { ReportExportProvider } from "@/components/admin/ReportExportContext";
import { ReportExportToolbar } from "@/components/admin/ReportExportToolbar";
import {
  ChartPanel,
  CohortGrid,
  DonutChart,
  GroupedBarChart,
  HorizontalBarChart,
  ReportLayout,
  VerticalBarChart,
} from "@/components/admin/ReportCharts";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-neutral-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function ReportNote({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600">
      {children}
    </p>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function pivotByPeriod(
  rows: { period: string; type: string; customers?: number; sales?: number }[],
  types: string[],
  key: "customers" | "sales"
) {
  const categories = [...new Set(rows.map((r) => r.period))].sort();
  return {
    categories,
    series: types.map((type, i) => ({
      name: type,
      color: ["#171717", "#ea580c", "#6366f1"][i],
      values: categories.map((period) => {
        const row = rows.find((r) => r.period === period && r.type === type);
        return row ? (row[key] ?? 0) : 0;
      }),
    })),
  };
}

function ReportBody({ reportId, data }: { reportId: string; data: AdminReportsPayload }) {
  const { kpis } = data;

  switch (reportId) {
    case "overview":
      return (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Net sales" value={formatInr(kpis.netSales)} hint={`${kpis.orders} orders`} />
            <KpiCard label="Average order" value={formatInr(kpis.averageOrderValue)} />
            <KpiCard label="Customers" value={String(kpis.uniqueCustomers)} hint={`${kpis.repeatCustomerRate}% repeat`} />
            <KpiCard label="Discounts" value={formatInr(kpis.totalDiscount)} />
          </div>
          <ChartPanel title="Sales over time">
            <VerticalBarChart
              points={data.salesOverTime.map((d) => ({ label: d.date, value: d.revenue }))}
              format="inr"
            />
          </ChartPanel>
        </div>
      );

    case "gross-sales-over-time":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.grossSalesOverTime.map((d) => ({ label: d.date, value: d.grossSales }))}
              format="inr"
              color="#171717"
            />
          }
          headers={["Date", "Gross sales", "Orders"]}
          rows={data.sales.grossSalesOverTime.map((d) => [d.date, formatInr(d.grossSales), d.orders])}
        />
      );

    case "net-sales-over-time":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.netSalesOverTime.map((d) => ({ label: d.date, value: d.netSales }))}
              format="inr"
              color="#ea580c"
            />
          }
          headers={["Date", "Net sales", "Orders"]}
          rows={data.sales.netSalesOverTime.map((d) => [d.date, formatInr(d.netSales), d.orders])}
        />
      );

    case "sales-over-time":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.salesOverTime.map((d) => ({ label: d.date, value: d.revenue }))}
              format="inr"
            />
          }
          headers={["Date", "Orders", "Revenue"]}
          rows={data.salesOverTime.map((d) => [d.date, d.orders, formatInr(d.revenue)])}
        />
      );

    case "sales-by-product":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.salesByProduct.map((p) => ({ label: p.name, value: p.revenue }))}
              format="inr"
            />
          }
          headers={["SKU", "Product", "Units", "Revenue"]}
          rows={data.salesByProduct.map((p) => [p.sku, p.name, p.units, formatInr(p.revenue)])}
        />
      );

    case "average-order-value-over-time":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.averageOrderValueOverTime.map((d) => ({ label: d.date, value: d.aov }))}
              format="inr"
              color="#6366f1"
            />
          }
          headers={["Date", "AOV", "Orders"]}
          rows={data.sales.averageOrderValueOverTime.map((d) => [d.date, formatInr(d.aov), d.orders])}
        />
      );

    case "average-order-quantity-over-time":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.averageOrderQuantityOverTime.map((d) => ({
                label: d.date,
                value: d.avgQuantity,
              }))}
              color="#0d9488"
            />
          }
          headers={["Date", "Avg units / order", "Orders", "Units"]}
          rows={data.sales.averageOrderQuantityOverTime.map((d) => [
            d.date,
            d.avgQuantity,
            d.orders,
            d.units,
          ])}
        />
      );

    case "average-order-value":
      return (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Average order value" value={formatInr(kpis.averageOrderValue)} />
            <KpiCard label="Total orders" value={String(kpis.orders)} />
            <KpiCard label="Gross sales" value={formatInr(kpis.grossSales)} />
          </div>
          <ChartPanel title="AOV trend">
            <VerticalBarChart
              points={data.sales.averageOrderValueOverTime.map((d) => ({ label: d.date, value: d.aov }))}
              format="inr"
              color="#6366f1"
            />
          </ChartPanel>
        </div>
      );

    case "net-sales-by-sales-channel":
      return (
        <ReportLayout
          chart={
            <DonutChart
              segments={data.sales.netSalesByChannel.map((r) => ({
                label: r.channel,
                value: r.netSales,
              }))}
              format="inr"
            />
          }
          headers={["Channel", "Orders", "Net sales"]}
          rows={data.sales.netSalesByChannel.map((r) => [r.channel, r.orders, formatInr(r.netSales)])}
        />
      );

    case "items-sold-by-referrer":
      return (
        <ReportLayout
          note={
            <ReportNote>Payment gateway used as referrer proxy until marketing analytics is connected.</ReportNote>
          }
          chart={
            <HorizontalBarChart
              points={data.sales.itemsSoldByReferrer.map((r) => ({ label: r.channel, value: r.units }))}
            />
          }
          headers={["Referrer / channel", "Units", "Revenue"]}
          rows={data.sales.itemsSoldByReferrer.map((r) => [r.channel, r.units, formatInr(r.revenue)])}
        />
      );

    case "new-vs-returning-customer-sales": {
      const pivot = pivotByPeriod(
        data.sales.newVsReturningCustomerSales.map((r) => ({
          period: r.period,
          type: r.type,
          sales: r.sales,
        })),
        ["New", "Returning"],
        "sales"
      );
      return (
        <ReportLayout
          chart={<GroupedBarChart categories={pivot.categories} series={pivot.series} format="inr" />}
          headers={["Month", "Type", "Net sales", "Orders"]}
          rows={data.sales.newVsReturningCustomerSales.map((r) => [
            r.period,
            r.type,
            formatInr(r.sales),
            r.orders,
          ])}
        />
      );
    }

    case "new-vs-returning-customers-sales-time": {
      const pivot = pivotByPeriod(data.newVsReturningOverTime, ["First-time", "Returning"], "customers");
      return (
        <ReportLayout
          chart={<GroupedBarChart categories={pivot.categories} series={pivot.series} />}
          headers={["Month", "Type", "Customers"]}
          rows={data.newVsReturningOverTime.map((r) => [r.period, r.type, r.customers])}
        />
      );
    }

    case "cc-new-customers":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.ccNewCustomers.map((r) => ({ label: r.month, value: r.customers }))}
              color="#171717"
            />
          }
          headers={["Month", "New customers"]}
          rows={data.sales.ccNewCustomers.map((r) => [r.month, r.customers])}
        />
      );

    case "cc-return-customers":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.ccReturnCustomers.map((r) => ({ label: r.month, value: r.customers }))}
              color="#ea580c"
            />
          }
          headers={["Month", "Return customers"]}
          rows={data.sales.ccReturnCustomers.map((r) => [r.month, r.customers])}
        />
      );

    case "cc-total-customers":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.ccTotalCustomers.map((r) => ({ label: r.month, value: r.customers }))}
              color="#6366f1"
            />
          }
          headers={["Month", "Total customers"]}
          rows={data.sales.ccTotalCustomers.map((r) => [r.month, r.customers])}
        />
      );

    case "sales-by-customer-name":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.sales.salesByCustomerName.map((c) => ({
                label: c.name,
                value: c.netSales,
              }))}
              format="inr"
            />
          }
          headers={["Customer", "Email", "Orders", "Net sales"]}
          rows={data.sales.salesByCustomerName.map((c) => [
            c.name,
            c.email,
            c.orders,
            formatInr(c.netSales),
          ])}
        />
      );

    case "top-product-variants-by-units": {
      const sorted = [...data.salesByProduct].sort((a, b) => b.units - a.units);
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart points={sorted.map((p) => ({ label: p.name, value: p.units }))} color="#0d9488" />
          }
          headers={["SKU", "Product", "Units", "Revenue"]}
          rows={sorted.map((p) => [p.sku, p.name, p.units, formatInr(p.revenue)])}
        />
      );
    }

    case "total-sales-by-billing-location":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.sales.salesByBillingLocation.map((r) => ({
                label: `${r.city} (${r.pin})`,
                value: r.netSales,
              }))}
              format="inr"
            />
          }
          headers={["City", "PIN", "Orders", "Net sales"]}
          rows={data.sales.salesByBillingLocation.map((r) => [
            r.city,
            r.pin,
            r.orders,
            formatInr(r.netSales),
          ])}
        />
      );

    case "bundle-total-sales-over-time":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.sales.bundleTotalSalesOverTime.map((d) => ({
                label: d.date,
                value: d.netSales,
              }))}
              format="inr"
              color="#a855f7"
            />
          }
          headers={["Date", "Bundle orders", "Net sales"]}
          rows={data.sales.bundleTotalSalesOverTime.map((d) => [
            d.date,
            d.bundleOrders,
            formatInr(d.netSales),
          ])}
        />
      );

    case "bundle-item-vs-non-bundle":
      return (
        <ReportLayout
          chart={
            <DonutChart
              segments={data.sales.bundleVsNonBundle.map((r) => ({ label: r.type, value: r.netSales }))}
              format="inr"
            />
          }
          headers={["Type", "Orders", "Units", "Net sales"]}
          rows={data.sales.bundleVsNonBundle.map((r) => [
            r.type,
            r.orders,
            r.units,
            formatInr(r.netSales),
          ])}
        />
      );

    case "total-sales-by-bundle":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.sales.totalSalesByBundle.map((r) => ({ label: r.bundle, value: r.netSales }))}
              format="inr"
              color="#a855f7"
            />
          }
          headers={["Bundle", "Orders", "Units", "Net sales"]}
          rows={data.sales.totalSalesByBundle.map((r) => [
            r.bundle,
            r.orders,
            r.units,
            formatInr(r.netSales),
          ])}
        />
      );

    case "total-sales-by-bundle-components":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.sales.totalSalesByBundleComponents.map((r) => ({
                label: r.name,
                value: r.revenue,
              }))}
              format="inr"
            />
          }
          headers={["SKU", "Product", "Units", "Revenue"]}
          rows={data.sales.totalSalesByBundleComponents.map((r) => [
            r.sku,
            r.name,
            r.units,
            formatInr(r.revenue),
          ])}
        />
      );

    case "returns-over-time":
      return (
        <ReportLayout
          note={
            <ReportNote>
              Cancelled orders used as a return proxy. A dedicated refund ledger is not configured.
            </ReportNote>
          }
          chart={
            <VerticalBarChart
              points={data.sales.returnsOverTime.map((d) => ({ label: d.date, value: d.returnValue }))}
              format="inr"
              color="#db2777"
            />
          }
          headers={["Date", "Returns", "Value"]}
          rows={data.sales.returnsOverTime.map((d) => [d.date, d.returns, formatInr(d.returnValue)])}
        />
      );

    case "total-returns-over-time":
      return (
        <ReportLayout
          note={<ReportNote>Same cancelled-order data as Returns over time.</ReportNote>}
          chart={
            <VerticalBarChart
              points={data.sales.returnsOverTime.map((d) => ({ label: d.date, value: d.returns }))}
              color="#db2777"
            />
          }
          headers={["Date", "Returns", "Return value"]}
          rows={data.sales.returnsOverTime.map((d) => [d.date, d.returns, formatInr(d.returnValue)])}
        />
      );

    case "total-sales-by-currency":
      return (
        <ReportLayout
          chart={
            <DonutChart
              segments={data.sales.totalSalesByCurrency.map((r) => ({
                label: r.currency,
                value: r.netSales,
              }))}
              format="inr"
            />
          }
          headers={["Currency", "Orders", "Net sales"]}
          rows={data.sales.totalSalesByCurrency.map((r) => [
            r.currency,
            r.orders,
            formatInr(r.netSales),
          ])}
        />
      );

    case "pos-staff-orders-total":
      return (
        <ReportNote>
          This storefront is online-only. POS staff orders are not applicable — all sales are web checkouts.
        </ReportNote>
      );

    case "orders-by-status":
      return (
        <ReportLayout
          chart={
            <DonutChart
              segments={data.ordersByStatus.map((r) => ({
                label: formatStatus(r.status),
                value: r.revenue,
              }))}
              format="inr"
            />
          }
          headers={["Status", "Orders", "Revenue"]}
          rows={data.ordersByStatus.map((r) => [formatStatus(r.status), r.count, formatInr(r.revenue)])}
        />
      );

    case "orders-by-gateway":
    case "sessions-by-referrer":
      return (
        <ReportLayout
          note={
            reportId === "sessions-by-referrer" ? (
              <ReportNote>
                Shopify&apos;s Sessions by referrer uses web analytics. Here, payment gateway is used as a
                channel proxy from completed checkouts.
              </ReportNote>
            ) : undefined
          }
          chart={
            <DonutChart
              segments={data.ordersByGateway.map((r) => ({ label: r.gateway, value: r.revenue }))}
              format="inr"
            />
          }
          headers={["Channel / gateway", "Orders", "Revenue"]}
          rows={data.ordersByGateway.map((r) => [r.gateway, r.count, formatInr(r.revenue)])}
        />
      );

    case "sessions-by-location":
    case "customers-by-location":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.customersByLocation.map((r) => ({
                label: `${r.city} (${r.pin})`,
                value: r.revenue,
              }))}
              format="inr"
            />
          }
          headers={["City", "PIN", "Customers", "Revenue"]}
          rows={data.customersByLocation.map((r) => [
            r.city,
            r.pin,
            r.newCustomers,
            formatInr(r.revenue),
          ])}
        />
      );

    case "sessions-over-time":
      return (
        <ReportLayout
          note={
            <ReportNote>
              True session counts need analytics. This chart shows completed orders per day as a proxy.
            </ReportNote>
          }
          chart={
            <VerticalBarChart
              points={data.salesOverTime.map((d) => ({ label: d.date, value: d.orders }))}
            />
          }
          headers={["Date", "Orders (proxy)", "Revenue"]}
          rows={data.salesOverTime.map((d) => [d.date, d.orders, formatInr(d.revenue)])}
        />
      );

    case "visitors-over-time":
      return (
        <ReportLayout
          note={
            <ReportNote>
              Unique customers with at least one order on that day — not anonymous visitors.
            </ReportNote>
          }
          chart={
            <VerticalBarChart
              points={data.visitorsOverTime.map((d) => ({ label: d.date, value: d.uniqueCustomers }))}
              color="#6366f1"
            />
          }
          headers={["Date", "Unique customers", "Orders"]}
          rows={data.visitorsOverTime.map((d) => [d.date, d.uniqueCustomers, d.orders])}
        />
      );

    case "conversion-rate-breakdown":
      return (
        <div className="space-y-8">
          <ReportNote>
            Only completed checkouts are stored. Add session tracking to measure browse → cart → checkout
            conversion.
          </ReportNote>
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Completed checkouts" value={String(kpis.orders)} hint="100% of stored funnel" />
            <KpiCard label="Unique customers" value={String(kpis.uniqueCustomers)} />
            <KpiCard label="Repeat rate" value={`${kpis.repeatCustomerRate}%`} />
          </div>
          <ChartPanel title="Checkout volume">
            <DonutChart
              segments={[
                { label: "Completed", value: kpis.orders },
                { label: "Other statuses", value: Math.max(0, data.orderCount - kpis.orders) },
              ]}
            />
          </ChartPanel>
        </div>
      );

    case "conversion-rate-over-time":
      return (
        <ReportLayout
          note={
            <ReportNote>
              Daily completed orders. Session-based conversion rate is not available without analytics.
            </ReportNote>
          }
          chart={
            <VerticalBarChart
              points={data.salesOverTime.map((d) => ({ label: d.date, value: d.orders }))}
            />
          }
          headers={["Date", "Orders"]}
          rows={data.salesOverTime.map((d) => [d.date, d.orders])}
        />
      );

    case "search-conversions-over-time":
    case "searches-by-search-term":
    case "sessions-by-landing-page":
    case "sessions-by-device":
      return (
        <ReportNote>
          {reportId === "search-conversions-over-time" || reportId === "searches-by-search-term"
            ? "Connect GA4 site search or log queries from /search to populate search reports."
            : "Connect page-view analytics (GA4, Plausible) for landing page and device session reports."}
        </ReportNote>
      );

    case "new-customers-over-time":
      return (
        <ReportLayout
          chart={
            <VerticalBarChart
              points={data.newCustomersOverTime.map((r) => ({ label: r.month, value: r.newCustomers }))}
              color="#171717"
            />
          }
          headers={["Month", "New customers"]}
          rows={data.newCustomersOverTime.map((r) => [r.month, r.newCustomers])}
        />
      );

    case "new-vs-returning-customers": {
      const pivot = pivotByPeriod(data.newVsReturningOverTime, ["First-time", "Returning"], "customers");
      return (
        <ReportLayout
          chart={<GroupedBarChart categories={pivot.categories} series={pivot.series} />}
          headers={["Month", "Type", "Customers"]}
          rows={data.newVsReturningOverTime.map((r) => [r.period, r.type, r.customers])}
        />
      );
    }

    case "returning-customers":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.returningCustomers.map((c) => ({ label: c.name, value: c.totalSpent }))}
              format="inr"
            />
          }
          headers={["Email", "Name", "Orders", "AOV", "Total spent", "First order", "Last order"]}
          rows={data.returningCustomers.map((c) => [
            c.email,
            c.name,
            c.orderCount,
            formatInr(c.averageOrderValue),
            formatInr(c.totalSpent),
            formatDate(c.firstOrderAt),
            formatDate(c.lastOrderAt),
          ])}
        />
      );

    case "one-time-customers":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.oneTimeCustomers.map((c) => ({ label: c.name, value: c.totalSpent }))}
              format="inr"
            />
          }
          headers={["Email", "Name", "Order total", "Order date", "City"]}
          rows={data.oneTimeCustomers.map((c) => [
            c.email,
            c.name,
            formatInr(c.totalSpent),
            formatDate(c.firstOrderAt),
            c.city,
          ])}
        />
      );

    case "customer-cohort-analysis":
      return (
        <ReportLayout
          note={
            <ReportNote>
              Rows are acquisition month (first order). Columns are months since first purchase with active
              customers (placed an order that month).
            </ReportNote>
          }
          chartTitle="Cohort heatmap"
          chart={<CohortGrid rows={data.customerCohort} />}
          headers={["Cohort", "Customers", "Month 0", "Month 1", "Month 2", "Month 3"]}
          rows={data.customerCohort.map((c) => [
            c.cohort,
            c.customers,
            c.period0,
            c.period1,
            c.period2,
            c.period3,
          ])}
        />
      );

    case "predicted-spend-tier": {
      const tierCounts = ["High", "Medium", "Low"].map((tier) => ({
        label: tier,
        value: data.predictedSpendTier.filter((c) => c.tier === tier).length,
      }));
      return (
        <ReportLayout
          note={
            <ReportNote>
              Demo segmentation by lifetime spend percentile (High / Medium / Low). Shopify Plus uses a
              predictive model when enabled.
            </ReportNote>
          }
          chart={<DonutChart segments={tierCounts} />}
          headers={["Tier", "Email", "Name", "Orders", "Total spent", "Last order"]}
          rows={data.predictedSpendTier.map((c) => [
            c.tier,
            c.email,
            c.name,
            c.orderCount,
            formatInr(c.totalSpent),
            formatDate(c.lastOrderAt),
          ])}
        />
      );
    }

    case "rfm-analysis":
      return (
        <ReportLayout
          note={
            <ReportNote>
              R, F, and M scores are quintiles from order history. Groups follow common RFM segment names.
            </ReportNote>
          }
          chart={
            <HorizontalBarChart
              points={data.rfmGroups.map((g) => ({ label: g.group, value: g.customerCount }))}
            />
          }
          headers={["Group", "Customers", "%", "Avg days since order", "Orders", "Revenue"]}
          rows={data.rfmGroups.map((g) => [
            g.group,
            g.customerCount,
            `${g.percentOfCustomers}%`,
            g.avgDaysSinceLastOrder,
            g.totalOrders,
            formatInr(g.totalSpent),
          ])}
        />
      );

    case "rfm-customer-list":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.rfmCustomers.slice(0, 12).map((c) => ({ label: c.name, value: c.totalSpent }))}
              format="inr"
            />
          }
          headers={["Email", "Name", "RFM group", "Days since order", "Orders", "Revenue"]}
          rows={data.rfmCustomers.map((c) => [
            c.email,
            c.name,
            c.rfmGroup,
            c.daysSinceLastOrder,
            c.orderCount,
            formatInr(c.totalSpent),
          ])}
        />
      );

    case "customers-overview":
      return (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard label="Unique customers" value={String(kpis.uniqueCustomers)} />
            <KpiCard label="Repeat rate" value={`${kpis.repeatCustomerRate}%`} hint="Customers with 2+ orders" />
          </div>
          <ChartPanel title="New customers by month">
            <VerticalBarChart
              points={data.newCustomersOverTime.map((r) => ({ label: r.month, value: r.newCustomers }))}
            />
          </ChartPanel>
        </div>
      );

    case "top-customers":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.topCustomers.map((c) => ({ label: c.name, value: c.revenue }))}
              format="inr"
            />
          }
          headers={["Email", "Name", "Orders", "Revenue"]}
          rows={data.topCustomers.map((c) => [c.email, c.name, c.orders, formatInr(c.revenue)])}
        />
      );

    case "finance-summary":
      return (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Subtotal" value={formatInr(data.finance.subtotal)} />
            <KpiCard label="Discounts" value={formatInr(data.finance.discount)} />
            <KpiCard label="Tax" value={formatInr(data.finance.tax)} />
            <KpiCard label="Shipping" value={formatInr(data.finance.shipping)} />
            <KpiCard label="Total" value={formatInr(data.finance.total)} />
          </div>
          <ChartPanel title="Revenue composition">
            <DonutChart
              segments={[
                { label: "Subtotal", value: data.finance.subtotal },
                { label: "Tax", value: data.finance.tax },
                { label: "Shipping", value: data.finance.shipping },
              ]}
              format="inr"
            />
          </ChartPanel>
        </div>
      );

    case "inventory-levels":
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart
              points={data.inventory.map((p) => ({ label: p.name, value: p.quantity }))}
              color="#0d9488"
            />
          }
          headers={["SKU", "Product", "On hand", "Low threshold"]}
          rows={data.inventory.map((p) => [p.sku, p.name, p.quantity, p.lowStockThreshold])}
        />
      );

    case "low-stock": {
      const low = data.inventory.filter((p) => p.isLow);
      return (
        <ReportLayout
          chart={
            <HorizontalBarChart points={low.map((p) => ({ label: p.name, value: p.quantity }))} color="#db2777" />
          }
          headers={["SKU", "Product", "On hand", "Threshold"]}
          rows={low.map((p) => [p.sku, p.name, p.quantity, p.lowStockThreshold])}
        />
      );
    }

    case "discount-performance":
      return (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard label="Orders with discount" value={String(data.ordersWithDiscount)} />
            <KpiCard label="Total discounted" value={formatInr(kpis.totalDiscount)} />
          </div>
          <ChartPanel title="Orders with vs without discount">
            <DonutChart
              segments={[
                { label: "With discount", value: data.ordersWithDiscount },
                { label: "Full price", value: Math.max(0, kpis.orders - data.ordersWithDiscount) },
              ]}
            />
          </ChartPanel>
        </div>
      );

    case "profit-summary":
      return (
        <div className="space-y-8">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo report: net sales after discounts. Configure cost of goods in your ERP to calculate true margin.
          </p>
          <KpiCard
            label="Net sales (after discounts)"
            value={formatInr(kpis.grossSales)}
            hint={`Discounts: ${formatInr(kpis.totalDiscount)}`}
          />
          <ChartPanel title="Net vs discounts">
            <DonutChart
              segments={[
                { label: "Net sales", value: kpis.grossSales },
                { label: "Discounts", value: kpis.totalDiscount },
              ]}
              format="inr"
            />
          </ChartPanel>
        </div>
      );

    case "payment-risk":
      return (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Demo checkouts" value={String(data.fraudSignals.demoOrders)} />
            <KpiCard label="COD orders" value={String(data.fraudSignals.codOrders)} />
            <KpiCard label="Cancelled" value={String(data.fraudSignals.cancelledOrders)} />
            <KpiCard label="Non-paid status" value={String(data.fraudSignals.nonPaidStatuses)} />
          </div>
          <ChartPanel title="Risk signal mix">
            <HorizontalBarChart
              points={[
                { label: "Demo", value: data.fraudSignals.demoOrders },
                { label: "COD", value: data.fraudSignals.codOrders },
                { label: "Cancelled", value: data.fraudSignals.cancelledOrders },
                { label: "Non-paid", value: data.fraudSignals.nonPaidStatuses },
              ]}
              color="#db2777"
            />
          </ChartPanel>
        </div>
      );

    case "retail-online":
      return (
        <div className="space-y-8">
          <div className="grid gap-4 gap-y-4 sm:grid-cols-2">
            <KpiCard label="Online orders" value={String(kpis.orders)} hint="All channels = web storefront" />
            <KpiCard label="Online net sales" value={formatInr(kpis.netSales)} />
          </div>
          <ChartPanel title="Online sales trend">
            <VerticalBarChart
              points={data.salesOverTime.map((d) => ({ label: d.date, value: d.revenue }))}
              format="inr"
            />
          </ChartPanel>
        </div>
      );

    default:
      return <p className="text-sm text-neutral-500">Select a report from the list.</p>;
  }
}

export function ReportsDashboard() {
  const [data, setData] = useState<AdminReportsPayload | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [reportId, setReportId] = useState("overview");
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/admin/reports");
    const j = (await r.json()) as AdminReportsPayload & { error?: string; message?: string };
    if (!r.ok) {
      setMsg(j.error || "Could not load reports.");
      setData(null);
      setBusy(false);
      return;
    }
    setData(j);
    if (j.message) setMsg(j.message);
    setBusy(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeMeta = useMemo(() => {
    if (reportId === "overview") return { title: OVERVIEW_REPORT.title, description: OVERVIEW_REPORT.description };
    const found = findReportById(reportId);
    if (found) return { title: found.report.title, description: found.report.description };
    return { title: "Reports", description: "" };
  }, [reportId]);

  const reportMeta = data
    ? `${data.orderCount} orders · ${data.catalogCount} active SKUs · Generated ${new Date(data.generatedAt).toLocaleString()}`
    : "";

  return (
    <ReportExportProvider>
    <div className="min-h-screen bg-[#f6f5f3]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <header className="no-print flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Admin</p>
            <h1 className="font-display text-4xl text-neutral-900">Reports</h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">
              Default storefront reports from orders and catalog — similar groupings to Shopify&apos;s report library.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <AdminPortalNav active="reports" />
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-neutral-50"
            >
              Refresh data
            </button>
          </div>
        </header>

        {msg && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{msg}</p>
        )}

        {busy && <p className="mt-10 text-sm text-neutral-500">Loading reports…</p>}

        {!busy && data && (
          <div className="no-print mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="h-fit rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Reports</p>
              <ul className="mt-3 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setReportId("overview")}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      reportId === "overview" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    Overview
                  </button>
                </li>
              </ul>
              {ADMIN_REPORT_SECTIONS.map((section) => (
                <div key={section.id} className="mt-5">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wide text-neutral-500">{section.title}</p>
                  <ul className="mt-2 space-y-0.5">
                    {section.reports.map((report) => (
                      <li key={report.id}>
                        <button
                          type="button"
                          onClick={() => setReportId(report.id)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                            reportId === report.id
                              ? "bg-neutral-900 text-white font-medium"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                          }`}
                        >
                          {report.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>

            <main
              id="admin-report-printable"
              className="min-w-0 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="report-print-header">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  ANTIFRAGILE · Admin report
                </p>
                <h1 className="text-xl font-semibold text-neutral-900">{activeMeta.title}</h1>
                <p className="mt-1 text-sm text-neutral-600">{activeMeta.description}</p>
                <p className="mt-1 text-xs text-neutral-500">{reportMeta}</p>
              </div>

              <div className="no-print flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{activeMeta.title}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{activeMeta.description}</p>
                  <p className="mt-2 text-xs text-neutral-400">{reportMeta}</p>
                </div>
                <ReportExportToolbar
                  title={activeMeta.title}
                  description={activeMeta.description}
                  meta={reportMeta}
                  printRootId="report-export-body"
                />
              </div>

              <div id="report-export-body" className="mt-8">
                <ReportBody reportId={reportId} data={data} />
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
    </ReportExportProvider>
  );
}
