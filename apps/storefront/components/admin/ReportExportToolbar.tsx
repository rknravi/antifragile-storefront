"use client";

import { useCallback, useState } from "react";
import { useReportExport } from "@/components/admin/ReportExportContext";
import {
  buildExportFilename,
  buildPrintableHtml,
  downloadCsv,
  openPrintWindow,
} from "@/lib/report-export";

type ReportExportToolbarProps = {
  title: string;
  description: string;
  meta: string;
  printRootId: string;
  disabled?: boolean;
};

export function ReportExportToolbar({
  title,
  description,
  meta,
  printRootId,
  disabled,
}: ReportExportToolbarProps) {
  const { table } = useReportExport();
  const [busy, setBusy] = useState<"print" | "pdf" | "csv" | null>(null);

  const getPrintRootHtml = useCallback(() => {
    const el = document.getElementById(printRootId);
    if (!el) return "";
    return el.innerHTML;
  }, [printRootId]);

  const handlePrint = useCallback(() => {
    setBusy("print");
    try {
      document.body.classList.add("admin-report-printing");
      window.print();
    } finally {
      setTimeout(() => document.body.classList.remove("admin-report-printing"), 500);
      setBusy(null);
    }
  }, []);

  const handlePdf = useCallback(() => {
    setBusy("pdf");
    try {
      const html = buildPrintableHtml({
        title,
        description,
        meta,
        bodyHtml: getPrintRootHtml(),
        table,
      });
      openPrintWindow(html, title);
    } finally {
      setBusy(null);
    }
  }, [title, description, meta, getPrintRootHtml, table]);

  const handleCsv = useCallback(() => {
    if (!table?.rows.length) {
      window.alert("No table data to export for this report. Try a report with a detail table.");
      return;
    }
    setBusy("csv");
    try {
      downloadCsv(buildExportFilename(title, "csv"), table.headers, table.rows);
    } finally {
      setBusy(null);
    }
  }, [table, title]);

  const btn =
    "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button type="button" className={btn} onClick={handlePrint} disabled={disabled || busy !== null}>
        {busy === "print" ? "Preparing…" : "Print"}
      </button>
      <button type="button" className={btn} onClick={handlePdf} disabled={disabled || busy !== null}>
        {busy === "pdf" ? "Opening…" : "Save as PDF"}
      </button>
      <button
        type="button"
        className={btn}
        onClick={handleCsv}
        disabled={disabled || busy !== null || !table?.rows.length}
        title={!table?.rows.length ? "This view has no exportable table" : "Download CSV"}
      >
        {busy === "csv" ? "Exporting…" : "Export CSV"}
      </button>
      <span className="hidden text-[11px] text-neutral-400 sm:inline">
        PDF opens print dialog — choose &quot;Save as PDF&quot; as destination.
      </span>
    </div>
  );
}
