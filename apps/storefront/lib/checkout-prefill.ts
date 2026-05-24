import type { AccountSession } from "@/lib/account-session";
import { displayName } from "@/lib/account-session";
import { readBrowserLastOrderAddress, readBrowserLastOrderContact } from "@/lib/last-order-browser";
import {
  mergeSavedAddresses,
  type SavedAddress,
  type ShippingAddress,
} from "@/lib/shipping-address";

export type CheckoutPrefillFields = {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  pin: string;
  gstNumber: string;
};

export type CheckoutPrefillSource = {
  session: AccountSession;
  addresses: SavedAddress[];
  lastCustomer?: { name?: string; mobile?: string } | null;
};

/** Default shipping address: newest saved (API + browser), same as account Addresses tab. */
export function defaultSavedAddress(email: string, apiAddresses: SavedAddress[]): ShippingAddress | null {
  const merged = mergeSavedAddresses(apiAddresses, readBrowserLastOrderAddress(email));
  const first = merged[0];
  if (!first) return null;
  return {
    address: first.address,
    city: first.city,
    pin: first.pin,
    ...(first.gstNumber ? { gstNumber: first.gstNumber } : {}),
  };
}

export function buildCheckoutPrefill({
  session,
  addresses,
  lastCustomer,
}: CheckoutPrefillSource): CheckoutPrefillFields {
  const ship = defaultSavedAddress(session.email, addresses);
  const profileName = displayName(session);
  const browserContact = readBrowserLastOrderContact(session.email);
  const orderName = lastCustomer?.name?.trim() ?? "";
  const orderMobile = lastCustomer?.mobile?.replace(/\D/g, "") ?? "";
  const browserMobile = browserContact?.mobile?.replace(/\D/g, "") ?? "";
  const profileMobile = session.mobile?.replace(/\D/g, "") ?? "";

  return {
    email: session.email.trim().toLowerCase(),
    name: orderName || browserContact?.name?.trim() || profileName,
    mobile: orderMobile || browserMobile || profileMobile,
    address: ship?.address ?? "",
    city: ship?.city ?? "",
    pin: ship?.pin ?? "",
    gstNumber: ship?.gstNumber ?? "",
  };
}

/** Fill only fields the shopper has not edited yet. */
export function applyCheckoutPrefill(
  current: CheckoutPrefillFields,
  prefill: CheckoutPrefillFields
): CheckoutPrefillFields {
  return {
    email: current.email.trim() || prefill.email,
    name: current.name.trim() || prefill.name,
    mobile: current.mobile.trim() || prefill.mobile,
    address: current.address.trim() || prefill.address,
    city: current.city.trim() || prefill.city,
    pin: current.pin.trim() || prefill.pin,
    gstNumber: current.gstNumber.trim() || prefill.gstNumber,
  };
}
