"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ReportExportPayload = {
  headers: string[];
  rows: (string | number)[][];
};

type ReportExportContextValue = {
  table: ReportExportPayload | null;
  registerTable: (payload: ReportExportPayload | null) => void;
};

const ReportExportContext = createContext<ReportExportContextValue | null>(null);

export function ReportExportProvider({ children }: { children: ReactNode }) {
  const [table, setTable] = useState<ReportExportPayload | null>(null);

  const registerTable = useCallback((payload: ReportExportPayload | null) => {
    setTable(payload);
  }, []);

  const value = useMemo(() => ({ table, registerTable }), [table, registerTable]);

  return <ReportExportContext.Provider value={value}>{children}</ReportExportContext.Provider>;
}

export function useReportExport() {
  const ctx = useContext(ReportExportContext);
  if (!ctx) {
    throw new Error("useReportExport must be used within ReportExportProvider");
  }
  return ctx;
}
