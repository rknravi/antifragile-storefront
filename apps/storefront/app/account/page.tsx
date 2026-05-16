import type { Metadata } from "next";
import Link from "next/link";
import { AccountOrders } from "./AccountOrders";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Account</h1>
      <p className="mt-3 text-neutral-600">
        Look up orders by the email you used at checkout. For your most recent purchase on this device, you can also open
        the session receipt.
      </p>
      <Link href="/order-confirmation" className="mt-4 inline-block text-sm font-semibold text-brand-fresh underline">
        Last order (this browser)
      </Link>
      <AccountOrders />
    </div>
  );
}
