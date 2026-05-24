/** Client-only demo customer session (Remedy-style account; not full auth). */

export type AccountSession = {
  email: string;
  firstName: string;
  lastName: string;
  signedInAt: string;
  /** Last mobile used at checkout (optional, client-only). */
  mobile?: string;
};

const KEY = "af_account";

export function readAccountSession(): AccountSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AccountSession;
    if (!s.email || typeof s.email !== "string") return null;
    if (typeof s.mobile === "string" && s.mobile) {
      s.mobile = s.mobile.replace(/\D/g, "").slice(0, 15);
    }
    return s;
  } catch {
    return null;
  }
}

export function writeAccountSession(session: AccountSession): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearAccountSession(): void {
  localStorage.removeItem(KEY);
}

export function displayName(session: AccountSession): string {
  const name = [session.firstName, session.lastName].filter(Boolean).join(" ").trim();
  return name || session.email.split("@")[0] || "there";
}
