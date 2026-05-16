import { Suspense } from "react";
import CheckoutClient, { type CheckoutFlags } from "./CheckoutClient";

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const checkoutFlags: CheckoutFlags = {
    showRazorpay: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
    showCashfree: process.env.NEXT_PUBLIC_ENABLE_CASHFREE === "1",
    showCod: process.env.NEXT_PUBLIC_ENABLE_COD === "1",
  };

  return (
    <Suspense fallback={<div className="p-10 text-neutral-500">Loading checkout…</div>}>
      <CheckoutClient checkoutFlags={checkoutFlags} />
    </Suspense>
  );
}
