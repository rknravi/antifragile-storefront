"use client";

import { useEffect, type ReactNode } from "react";
import { useReportExport } from "@/components/admin/ReportExportContext";

const SERIES_COLORS = ["#171717", "#ea580c", "#6366f1", "#0d9488", "#a855f7", "#db2777"];

export function formatChartValue(value: number, mode: "inr" | "number" = "number"): string {
  if (mode === "inr") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-IN").format(value);
}

type ChartPoint = { label: string; value: number };

function emptyChart(message = "No data for this period.") {
  return <p className="text-sm text-neutral-500">{message}</p>;
}

export function ChartPanel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5">
      {title ? <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">{title}</p> : null}
      {children}
    </div>
  );
}

/** Vertical bar chart — time series or categories. */
export function VerticalBarChart({
  points,
  format = "number",
  color = SERIES_COLORS[0],
  maxBars = 31,
}: {
  points: ChartPoint[];
  format?: "inr" | "number";
  color?: string;
  maxBars?: number;
}) {
  const slice = points.slice(-maxBars);
  if (!slice.length) return emptyChart();

  const max = Math.max(...slice.map((p) => p.value), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-44 items-end gap-1 overflow-x-auto border-b border-neutral-200 pb-2">
        {slice.map((p) => (
          <div
            key={p.label}
            className="flex min-w-[20px] flex-1 flex-col items-center justify-end gap-1"
            title={`${p.label}: ${formatChartValue(p.value, format)}`}
          >
            <div
              className="w-full max-w-[32px] rounded-t transition-all"
              style={{
                height: `${Math.max(6, (p.value / max) * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-neutral-500">
        <span className="truncate pr-2">{slice[0]?.label}</span>
        <span className="truncate pl-2 text-right">{slice[slice.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Horizontal bars — rankings, products, locations. */
export function HorizontalBarChart({
  points,
  format = "number",
  color = SERIES_COLORS[0],
  maxBars = 12,
}: {
  points: ChartPoint[];
  format?: "inr" | "number";
  color?: string;
  maxBars?: number;
}) {
  const slice = points.slice(0, maxBars);
  if (!slice.length) return emptyChart();

  const max = Math.max(...slice.map((p) => p.value), 1);

  return (
    <ul className="space-y-3">
      {slice.map((p) => (
        <li key={p.label}>
          <div className="mb-1 flex justify-between gap-2 text-xs">
            <span className="truncate font-medium text-neutral-800" title={p.label}>
              {p.label}
            </span>
            <span className="shrink-0 tabular-nums text-neutral-600">{formatChartValue(p.value, format)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(p.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Side-by-side bars per category (e.g. New vs Returning). */
export function GroupedBarChart({
  categories,
  series,
  format = "number",
}: {
  categories: string[];
  series: { name: string; values: number[]; color?: string }[];
  format?: "inr" | "number";
}) {
  if (!categories.length || !series.length) return emptyChart();

  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues, 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
        {series.map((s, i) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>
      <div className="flex h-44 items-end gap-2 overflow-x-auto border-b border-neutral-200 pb-2">
        {categories.map((cat, ci) => (
          <div key={cat} className="flex min-w-[36px] flex-col items-center gap-1">
            <div className="flex h-36 items-end justify-center gap-0.5">
              {series.map((s, si) => {
                const v = s.values[ci] ?? 0;
                return (
                  <div
                    key={s.name}
                    className="w-3 rounded-t sm:w-4"
                    style={{
                      height: `${Math.max(4, (v / max) * 100)}%`,
                      backgroundColor: s.color ?? SERIES_COLORS[si % SERIES_COLORS.length],
                    }}
                    title={`${cat} · ${s.name}: ${formatChartValue(v, format)}`}
                  />
                );
              })}
            </div>
            <span className="max-w-[48px] truncate text-[9px] text-neutral-500" title={cat}>
              {cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Donut for share breakdowns (2–8 segments). */
export function DonutChart({
  segments,
  format = "number",
}: {
  segments: { label: string; value: number; color?: string }[];
  format?: "inr" | "number";
}) {
  const filtered = segments.filter((s) => s.value > 0);
  const total = filtered.reduce((sum, s) => sum + s.value, 0);
  if (!total) return emptyChart();

  let cumulative = 0;
  const stops = filtered.map((s, i) => {
    const pct = (s.value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    const color = s.color ?? SERIES_COLORS[i % SERIES_COLORS.length];
    return `${color} ${start}% ${cumulative}%`;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-neutral-50 text-center">
          <span className="text-[10px] uppercase tracking-wide text-neutral-500">Total</span>
          <span className="text-sm font-semibold tabular-nums text-neutral-900">
            {formatChartValue(total, format)}
          </span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2 text-sm">
        {filtered.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
              <span className="truncate text-neutral-800">{s.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-neutral-600">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Cohort retention heat-style grid. */
export function CohortGrid({
  rows,
}: {
  rows: { cohort: string; customers: number; period0: number; period1: number; period2: number; period3: number }[];
}) {
  if (!rows.length) return emptyChart();

  const maxCell = Math.max(...rows.flatMap((r) => [r.period0, r.period1, r.period2, r.period3, 1]));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-center text-xs">
        <thead>
          <tr className="text-neutral-500">
            <th className="px-2 py-2 text-left font-semibold">Cohort</th>
            <th className="px-2 py-2">M0</th>
            <th className="px-2 py-2">M1</th>
            <th className="px-2 py-2">M2</th>
            <th className="px-2 py-2">M3</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cohort}>
              <td className="px-2 py-2 text-left font-medium text-neutral-800">
                {r.cohort}
                <span className="ml-1 text-neutral-400">({r.customers})</span>
              </td>
              {[r.period0, r.period1, r.period2, r.period3].map((v, i) => (
                <td key={i} className="px-2 py-2">
                  <span
                    className="inline-flex min-w-[2rem] justify-center rounded px-1.5 py-1 tabular-nums text-neutral-900"
                    style={{
                      backgroundColor: `rgba(23, 23, 23, ${0.08 + (v / maxCell) * 0.55})`,
                    }}
                  >
                    {v}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportLayout({
  note,
  chartTitle = "Chart",
  chart,
  tableTitle = "Detail table",
  headers,
  rows,
}: {
  note?: ReactNode;
  chartTitle?: string;
  chart?: ReactNode;
  tableTitle?: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  const { registerTable } = useReportExport();

  useEffect(() => {
    registerTable({ headers, rows });
    return () => registerTable(null);
  }, [headers, rows, registerTable]);

  return (
    <div className="space-y-8">
      {note}
      {chart ? (
        <div>
          <ChartPanel title={chartTitle}>{chart}</ChartPanel>
        </div>
      ) : null}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">{tableTitle}</p>
        <ReportDataTable headers={headers} rows={rows} />
      </div>
    </div>
  );
}

export function ReportDataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  if (!rows.length) {
    return <p className="text-sm text-neutral-500">No data for this period.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-neutral-100 even:bg-neutral-50/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-neutral-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
