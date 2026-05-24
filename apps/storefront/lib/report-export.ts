import type { ReportExportPayload } from "@/components/admin/ReportExportContext";

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function slugifyFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function buildExportFilename(title: string, ext: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `antifragile-${slugifyFilename(title)}-${date}.${ext}`;
}

/** Open a clean print window (works well for Save as PDF). */
export function openPrintWindow(html: string, documentTitle: string): void {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) {
    window.alert("Allow pop-ups to print or save this report as PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.document.title = documentTitle;
  win.focus();
  const trigger = () => {
    win.print();
    win.onafterprint = () => win.close();
  };
  if (win.document.readyState === "complete") {
    setTimeout(trigger, 250);
  } else {
    win.onload = () => setTimeout(trigger, 250);
  }
}

export function buildPrintableHtml(options: {
  title: string;
  description: string;
  meta: string;
  bodyHtml: string;
  table?: ReportExportPayload | null;
}): string {
  const { title, description, meta, bodyHtml, table } = options;
  const tableHtml =
    table && table.rows.length
      ? `<table>
          <thead><tr>${table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
          <tbody>
            ${table.rows
              .map(
                (row) =>
                  `<tr>${row.map((c) => `<td>${escapeHtml(String(c))}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: #171717;
      margin: 0;
      padding: 24px 32px 48px;
      font-size: 12px;
      line-height: 1.45;
    }
    h1 { font-size: 22px; margin: 0 0 8px; font-weight: 700; }
    .desc { color: #525252; margin: 0 0 4px; max-width: 640px; }
    .meta { color: #737373; font-size: 11px; margin: 0 0 24px; }
    .brand { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #a3a3a3; margin-bottom: 12px; }
    .section { margin-bottom: 28px; page-break-inside: avoid; }
    .section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #737373; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #e5e5e5; padding: 8px 10px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    tr:nth-child(even) td { background: #fafafa; }
    .chart-block { border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 14mm; size: A4; }
    }
  </style>
</head>
<body>
  <p class="brand">ANTIFRAGILE · Admin report</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="desc">${escapeHtml(description)}</p>
  <p class="meta">${escapeHtml(meta)}</p>
  <div class="section chart-block">${bodyHtml}</div>
  ${
    tableHtml
      ? `<div class="section"><h2>Detail table</h2>${tableHtml}</div>`
      : ""
  }
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
