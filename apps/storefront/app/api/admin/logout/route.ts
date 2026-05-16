import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSessionCookieName } from "@/lib/admin-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
