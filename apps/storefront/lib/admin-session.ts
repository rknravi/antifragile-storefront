import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "af_admin_sess";

export function adminSessionCookieName(): string {
  return COOKIE;
}

function signingSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PORTAL_TOKEN;
  if (!s || s.length < 16) return "";
  return s;
}

export function createAdminSessionValue(): string | null {
  const secret = signingSecret();
  if (!secret) return null;
  const exp = Date.now() + 8 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp, v: 1 }), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionValue(token: string | undefined): boolean {
  if (!token?.includes(".")) return false;
  const secret = signingSecret();
  if (!secret) return false;
  const i = token.lastIndexOf(".");
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return false;
    }
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    if (typeof data.exp !== "number" || Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}
