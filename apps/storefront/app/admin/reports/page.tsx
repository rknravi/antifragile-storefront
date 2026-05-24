import type { Metadata } from "next";
import { ReportsDashboard } from "./ReportsDashboard";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return <ReportsDashboard />;
}
