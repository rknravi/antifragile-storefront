/** India-first checkout checks (client + server guard). */

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

export type CheckoutFieldKey = keyof CheckoutFields;

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeIndianMobile(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function normalizePin(raw: string): string {
  return raw.replace(/\s/g, "");
}

export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) return "Email is required.";
  if (email.length > 254) return "Email is too long.";
  if (email.includes(" ") || (email.match(/@/g) ?? []).length !== 1) {
    return "Enter a valid email address.";
  }
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  const [, domain] = email.split("@");
  if (!domain?.includes(".") || domain.startsWith(".") || domain.endsWith(".")) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validateOptionalGstin(raw: string | undefined): string | null {
  const g = raw?.trim().toUpperCase();
  if (!g) return null;
  if (g.length !== 15 || !GSTIN_RE.test(g)) {
    return "GSTIN must be 15 characters in the standard Indian format (or leave blank).";
  }
  return null;
}

export function validateName(raw: string): string | null {
  const name = raw.trim();
  if (!name) return "Full name is required.";
  if (name.length < 2 || name.length > 120) {
    return "Enter your full name (2–120 characters).";
  }
  if (!/^[\p{L}\s'.-]+$/u.test(name)) {
    return "Name may only include letters, spaces, hyphens, apostrophes, and periods.";
  }
  return null;
}

export function validateMobile(raw: string): string | null {
  const mobileDigits = normalizeIndianMobile(raw);
  if (!mobileDigits) return "Mobile number is required.";
  if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
    return "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
  }
  return null;
}

export function validateAddress(raw: string): string | null {
  const address = raw.trim();
  if (!address) return "Shipping address is required.";
  if (address.length < 10 || address.length > 500) {
    return "Enter a complete shipping address (at least 10 characters).";
  }
  if (!/[\p{L}\d]/u.test(address)) {
    return "Enter a street address with building or area details.";
  }
  return null;
}

export function validateCity(raw: string): string | null {
  const city = raw.trim();
  if (!city) return "City is required.";
  if (city.length < 2 || city.length > 80) {
    return "Enter a valid city.";
  }
  if (!/^[\p{L}\s'.-]+$/u.test(city)) {
    return "City may only include letters, spaces, hyphens, apostrophes, and periods.";
  }
  return null;
}

export function validatePin(raw: string): string | null {
  const pin = normalizePin(raw);
  if (!pin) return "PIN code is required.";
  if (!/^\d{6}$/.test(pin)) {
    return "PIN code must be exactly 6 digits (India).";
  }
  if (pin === "000000") {
    return "Enter a valid Indian PIN code.";
  }
  return null;
}

export function getCheckoutFieldErrors(f: CheckoutFields): Partial<Record<CheckoutFieldKey, string>> {
  const errors: Partial<Record<CheckoutFieldKey, string>> = {};

  const nameErr = validateName(f.name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(f.email);
  if (emailErr) errors.email = emailErr;

  const mobileErr = validateMobile(f.mobile);
  if (mobileErr) errors.mobile = mobileErr;

  const addressErr = validateAddress(f.address);
  if (addressErr) errors.address = addressErr;

  const cityErr = validateCity(f.city);
  if (cityErr) errors.city = cityErr;

  const pinErr = validatePin(f.pin);
  if (pinErr) errors.pin = pinErr;

  const gstErr = validateOptionalGstin(f.gstNumber);
  if (gstErr) errors.gstNumber = gstErr;

  return errors;
}

export function validateNameEmailMobile(f: { name: string; email: string; mobile: string }): string | null {
  const errors = getCheckoutFieldErrors({
    ...f,
    address: "placeholder address line",
    city: "City",
    pin: "560001",
  });
  return errors.name ?? errors.email ?? errors.mobile ?? null;
}

export function validateCheckoutFields(f: CheckoutFields): string | null {
  const errors = getCheckoutFieldErrors(f);
  const first = errors.name ?? errors.email ?? errors.mobile ?? errors.address ?? errors.city ?? errors.pin ?? errors.gstNumber;
  return first ?? null;
}
