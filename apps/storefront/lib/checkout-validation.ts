/** India-first checkout checks (client + optional server guard). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CheckoutFields = {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  pin: string;
  /** Optional 15-char GSTIN for B2B / invoice details */
  gstNumber?: string;
};

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function validateOptionalGstin(raw: string | undefined): string | null {
  const g = raw?.trim().toUpperCase();
  if (!g) return null;
  if (g.length !== 15 || !GSTIN_RE.test(g)) {
    return "GSTIN must be 15 characters in the standard Indian format (or leave blank).";
  }
  return null;
}

export function validateNameEmailMobile(f: { name: string; email: string; mobile: string }): string | null {
  const name = f.name.trim();
  if (name.length < 2 || name.length > 120) {
    return "Enter your full name (2–120 characters).";
  }
  if (!/^[\p{L}\s'.-]+$/u.test(name)) {
    return "Name may only include letters, spaces, hyphens, apostrophes, and periods.";
  }

  const email = f.email.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return "Enter a valid email address.";
  }

  const mobileDigits = f.mobile.replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
    return "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
  }

  return null;
}

export function validateCheckoutFields(f: CheckoutFields): string | null {
  const m = validateNameEmailMobile({ name: f.name, email: f.email, mobile: f.mobile });
  if (m) return m;

  const address = f.address.trim();
  if (address.length < 10 || address.length > 500) {
    return "Enter a complete shipping address (at least 10 characters).";
  }

  const city = f.city.trim();
  if (city.length < 2 || city.length > 80) {
    return "Enter a valid city.";
  }
  if (!/^[\p{L}\s'.-]+$/u.test(city)) {
    return "City may only include letters, spaces, hyphens, apostrophes, and periods.";
  }

  const pin = f.pin.replace(/\s/g, "");
  if (!/^\d{6}$/.test(pin)) {
    return "PIN code must be exactly 6 digits (India).";
  }

  const gstErr = validateOptionalGstin(f.gstNumber);
  if (gstErr) return gstErr;

  return null;
}
