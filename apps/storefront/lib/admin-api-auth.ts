import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSessionValue } from "./admin-session";

export async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const c = cookieStore.get(adminSessionCookieName())?.value;
  return verifyAdminSessionValue(c);
}
