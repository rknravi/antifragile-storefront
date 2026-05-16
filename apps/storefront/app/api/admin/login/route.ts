import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { createAdminSessionValue, adminSessionCookieName, verifyAdminSessionValue } from "@/lib/admin-session";

function constantTimeEqualStrings(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return ha.length === hb.length && timingSafeEqual(ha, hb);
}

export async function POST(req: Request) {
  // SECURITY-REVIEW: Admin login — compare token using digest equality; set httpOnly cookie.
  const expected = process.env.ADMIN_PORTAL_TOKEN;
  if (!expected || expected.length < 16) {
    return NextResponse.json({ error: "Admin portal is not configured." }, { status: 503 });
  }
  let body: { token?: string };
  try {
    body = (await req.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!constantTimeEqualStrings(token, expected)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
  const session = createAdminSessionValue();
  if (!session) {
    return NextResponse.json(
      { error: "Set ADMIN_SESSION_SECRET (or reuse ADMIN_PORTAL_TOKEN) — min 16 chars." },
      { status: 503 }
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}

export async function GET() {
  const cookieStore = await cookies();
  const c = cookieStore.get(adminSessionCookieName())?.value;
  return NextResponse.json({ authenticated: verifyAdminSessionValue(c) });
}
