import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSessionCookieName, verifyAdminSessionValue } from "@/lib/admin-session";
import "./report-print.css";

export default async function AdminReportsLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const v = store.get(adminSessionCookieName())?.value;
  if (!verifyAdminSessionValue(v)) {
    redirect("/admin");
  }
  return <>{children}</>;
}
