"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";
import Link from "next/link";
import { validateCheckoutFields } from "@/lib/checkout-validation";
import { writePendingCheckout } from "@/lib/pending-checkout";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(s);
  });
}

export type CheckoutFlags = {
  showRazorpay: boolean;
  showCashfree: boolean;
  showCod: boolean;
};

type Gateway = "razorpay" | "cashfree" | "demo" | "cod";

type PaymentIntentDebug = {
  gateway: string;
  status: number;
  sent: unknown;
  received: unknown;
};

export default function CheckoutClient({ checkoutFlags }: { checkoutFlags: CheckoutFlags }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lines, total, clear, subtotal, discount, estimatedTax, shippingEstimate, coupon } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [billingSame, setBillingSame] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDebug, setPaymentDebug] = useState<PaymentIntentDebug | null>(null);
  /** When true, cart is cleared on purpose after pay — do not redirect to /cart (would race order-confirmation). */
  const completingOrderRef = useRef(false);

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const showPaymentIntentDebug =
    process.env.NODE_ENV === "development" && searchParams.get("debug") === "1";

  const recordPaymentIntentDebug = useCallback(
    (gateway: string, sent: unknown, res: Response, received: unknown) => {
      if (!showPaymentIntentDebug) return;
      setPaymentDebug({ gateway, status: res.status, sent, received });
    },
    [showPaymentIntentDebug]
  );

  const defaultGateway: Gateway = useMemo(() => {
    if (checkoutFlags.showRazorpay) return "razorpay";
    if (checkoutFlags.showCashfree) return "cashfree";
    if (checkoutFlags.showCod) return "cod";
    return "demo";
  }, [checkoutFlags.showCashfree, checkoutFlags.showCod, checkoutFlags.showRazorpay]);

  const [gateway, setGateway] = useState<Gateway>(defaultGateway);
  const [step, setStep] = useState<"details" | "review">("details");

  useEffect(() => {
    setGateway(defaultGateway);
  }, [defaultGateway]);

  const finalizeOrder = useCallback(
    async (opts: {
      paymentId: string;
      gateway: Gateway;
      razorpayOrderId?: string;
    }) => {
      const id = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
      const shippingAddress = {
        address: address.trim(),
        city: city.trim(),
        pin: pin.replace(/\s/g, ""),
        ...(gstNumber.trim() ? { gstNumber: gstNumber.trim().toUpperCase() } : {}),
      };
      const payload = {
        orderId: id,
        paymentId: opts.paymentId,
        gateway: opts.gateway,
        razorpayOrderId: opts.razorpayOrderId,
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.replace(/\D/g, ""),
        },
        shippingAddress,
        items: lines.map((l) => ({
          name: l.product.name,
          sku: l.product.sku,
          qty: l.quantity,
          price: l.product.salePrice,
        })),
        subtotal,
        discount,
        tax: estimatedTax,
        shippingFee: shippingEstimate,
        total,
        createdAt: new Date().toISOString(),
      };

      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceOrderId: id,
            gateway: opts.gateway,
            paymentRef: opts.paymentId,
            razorpayOrderId: opts.razorpayOrderId,
            customer: payload.customer,
            shippingAddress,
            items: payload.items,
            subtotal,
            discount,
            tax: estimatedTax,
            shippingFee: shippingEstimate,
            total,
          }),
        });
      } catch {
        /* Order API optional when DB/email not configured */
      }

      completingOrderRef.current = true;
      sessionStorage.setItem("af_last_order", JSON.stringify(payload));
      clear();
      router.push(`/order-confirmation?orderId=${encodeURIComponent(id)}`);
    },
    [
      address,
      city,
      clear,
      discount,
      email,
      estimatedTax,
      gstNumber,
      lines,
      mobile,
      name,
      pin,
      router,
      shippingEstimate,
      subtotal,
      total,
    ]
  );

  const cartPayload = useMemo(
    () => ({
      items: lines.map((l) => ({ slug: l.product.slug, quantity: l.quantity })),
      coupon,
      customer: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: mobile.replace(/\D/g, ""),
      },
    }),
    [lines, coupon, name, email, mobile]
  );

  function buildShippingAddress() {
    return {
      address: address.trim(),
      city: city.trim(),
      pin: pin.replace(/\s/g, ""),
      ...(gstNumber.trim() ? { gstNumber: gstNumber.trim().toUpperCase() } : {}),
    };
  }

  const continueToReview = () => {
    setError(null);
    if (!lines.length) {
      setError("Your cart is empty.");
      return;
    }
    const fieldError = validateCheckoutFields({
      name,
      email,
      mobile,
      address,
      city,
      pin,
      gstNumber: gstNumber.trim() || undefined,
    });
    if (fieldError) {
      setError(fieldError);
      return;
    }
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pay = async () => {
    setError(null);
    if (!lines.length) {
      setError("Your cart is empty.");
      return;
    }

    if (gateway === "demo") {
      await finalizeOrder({ paymentId: "demo_pay_" + Date.now(), gateway: "demo" });
      return;
    }

    if (gateway === "cod") {
      setBusy(true);
      try {
        await finalizeOrder({ paymentId: "cod_pending", gateway: "cod" });
      } finally {
        setBusy(false);
      }
      return;
    }

    if (gateway === "cashfree") {
      setBusy(true);
      try {
        if (!window.Cashfree) {
          await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
        }
        const cfConstructor = window.Cashfree;
        if (!cfConstructor) throw new Error("Cashfree SDK unavailable");

        const intentBodyRaw = { ...cartPayload, gateway: "cashfree" as const };
        const intentRes = await fetch("/api/checkout/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intentBodyRaw),
        });
        const intentBody = (await intentRes.json()) as {
          error?: string;
          paymentSessionId?: string;
          cashfreeMode?: "sandbox" | "production";
          returnUrl?: string;
          cfOrderId?: string;
        };
        recordPaymentIntentDebug("cashfree", intentBodyRaw, intentRes, intentBody);
        if (!intentRes.ok) {
          throw new Error(intentBody.error || "Could not start Cashfree checkout.");
        }
        if (!intentBody.paymentSessionId || !intentBody.cashfreeMode || !intentBody.cfOrderId) {
          throw new Error("Invalid Cashfree session.");
        }

        writePendingCheckout({
          gateway: "cashfree",
          cfOrderId: intentBody.cfOrderId,
          customer: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.replace(/\D/g, ""),
          },
          shippingAddress: buildShippingAddress(),
          items: lines.map((l) => ({
            name: l.product.name,
            sku: l.product.sku,
            qty: l.quantity,
            price: l.product.salePrice,
          })),
          subtotal,
          discount,
          tax: estimatedTax,
          shippingFee: shippingEstimate,
          total,
        });

        const cashfree = cfConstructor({ mode: intentBody.cashfreeMode });
        const result = await cashfree.checkout({
          paymentSessionId: intentBody.paymentSessionId,
          returnUrl: intentBody.returnUrl,
        });

        if (result.error) {
          throw new Error("Cashfree checkout was cancelled or failed.");
        }
        if (result.paymentDetails) {
          const pm =
            typeof result.paymentDetails.paymentMessage === "string"
              ? result.paymentDetails.paymentMessage
              : "cashfree_paid";
          await finalizeOrder({ paymentId: pm, gateway: "cashfree" });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Payment failed");
      } finally {
        setBusy(false);
      }
      return;
    }

    // Razorpay
    if (!keyId) {
      setError("Razorpay publishable key is not configured.");
      return;
    }

    setBusy(true);
    try {
      if (!window.Razorpay) {
        await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      }
      if (!window.Razorpay) throw new Error("Razorpay unavailable");

      const intentBodyRaw = { ...cartPayload, gateway: "razorpay" as const };
      const intentRes = await fetch("/api/checkout/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intentBodyRaw),
      });
      const intentBody = (await intentRes.json()) as {
        error?: string;
        orderId?: string;
        amountPaise?: number;
        keyId?: string;
      };

      recordPaymentIntentDebug("razorpay", intentBodyRaw, intentRes, intentBody);

      const useServerOrder = intentRes.ok && intentBody.orderId;

      const amountPaise = Math.round(total * 100);

      const openRzp = (opts: {
        order_id?: string;
        amount: number;
        handler: (res: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => void;
      }) => {
        const rzp = new window.Razorpay!({
          key: intentBody.keyId || keyId,
          amount: opts.amount,
          currency: "INR",
          name: "ANTIFRAGILE",
          description: "Skincare order",
          order_id: opts.order_id,
          handler: opts.handler,
          prefill: { name, email, contact: mobile },
          theme: { color: "#1E4A6E" },
          modal: {
            ondismiss: () => setBusy(false),
          },
        });
        rzp.open();
      };

      if (useServerOrder) {
        openRzp({
          order_id: intentBody.orderId,
          amount: intentBody.amountPaise ?? amountPaise,
          handler: async (res) => {
            try {
              if (res.razorpay_order_id && res.razorpay_payment_id && res.razorpay_signature) {
                const v = await fetch("/api/checkout/verify-razorpay", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: res.razorpay_order_id,
                    razorpay_payment_id: res.razorpay_payment_id,
                    razorpay_signature: res.razorpay_signature,
                  }),
                });
                if (!v.ok) {
                  setError("Payment could not be verified. Contact support with your receipt.");
                  setBusy(false);
                  return;
                }
              }
              await finalizeOrder({
                paymentId: res.razorpay_payment_id,
                gateway: "razorpay",
                razorpayOrderId: res.razorpay_order_id,
              });
            } catch {
              setError("Verification request failed.");
            } finally {
              setBusy(false);
            }
          },
        });
        return;
      }

      // Fallback: publishable key only (no server secret) — amount-only checkout for local UX
      openRzp({
        amount: amountPaise,
        handler: async (res) => {
          await finalizeOrder({
            paymentId: res.razorpay_payment_id,
            gateway: "razorpay",
            razorpayOrderId: res.razorpay_order_id,
          });
          setBusy(false);
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed to start");
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!lines.length && !completingOrderRef.current) {
      router.replace("/cart");
    }
  }, [lines.length, router]);

  if (!lines.length) {
    if (completingOrderRef.current) {
      return (
        <p className="mx-auto max-w-3xl px-4 py-16 text-neutral-600">
          Taking you to your order confirmation…
        </p>
      );
    }
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-neutral-600">
        Redirecting to cart… <Link href="/cart">Open cart</Link>
      </p>
    );
  }

  const payLabel =
    gateway === "demo"
      ? "Complete order (demo)"
      : gateway === "cod"
        ? "Place order (COD)"
        : gateway === "cashfree"
          ? "Pay with Cashfree"
          : "Pay with Razorpay";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-3 md:px-6">
      <div className="md:col-span-2">
        <h1 className="font-display text-4xl text-neutral-900">Checkout</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Server-side payment intents use your catalog for pricing. Configure{" "}
          <code className="rounded bg-neutral-100 px-1">RAZORPAY_KEY_SECRET</code> or{" "}
          <code className="rounded bg-neutral-100 px-1">CASHFREE_CLIENT_ID</code> /{" "}
          <code className="rounded bg-neutral-100 px-1">CASHFREE_CLIENT_SECRET</code> on the server (never in the
          browser). Optional: <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_ENABLE_CASHFREE=1</code> to
          show Cashfree when credentials exist.
        </p>

        {step === "details" && (
        <>
        <fieldset className="mt-6 space-y-2">
          <legend className="text-sm font-semibold text-neutral-900">Payment method</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {checkoutFlags.showRazorpay && (
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50">
                <input
                  type="radio"
                  name="gw"
                  checked={gateway === "razorpay"}
                  onChange={() => setGateway("razorpay")}
                />
                Razorpay
              </label>
            )}
            {checkoutFlags.showCashfree && (
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50">
                <input
                  type="radio"
                  name="gw"
                  checked={gateway === "cashfree"}
                  onChange={() => setGateway("cashfree")}
                />
                Cashfree
              </label>
            )}
            {checkoutFlags.showCod && (
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50">
                <input type="radio" name="gw" checked={gateway === "cod"} onChange={() => setGateway("cod")} />
                Cash on delivery
              </label>
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50">
              <input type="radio" name="gw" checked={gateway === "demo"} onChange={() => setGateway("demo")} />
              Demo (no gateway)
            </label>
          </div>
        </fieldset>

        {!checkoutFlags.showRazorpay && !checkoutFlags.showCashfree && !checkoutFlags.showCod ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Only “Demo” appears</p>
            <p className="mt-1 text-amber-900/90">
              Set <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> in{" "}
              <code className="rounded bg-white/70 px-1">.env.local</code> for Razorpay. For Cashfree, set{" "}
              <code className="rounded bg-white/70 px-1">CASHFREE_CLIENT_ID</code>,{" "}
              <code className="rounded bg-white/70 px-1">CASHFREE_CLIENT_SECRET</code>,{" "}
              <code className="rounded bg-white/70 px-1">CASHFREE_ENV=sandbox</code>, and{" "}
              <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_ENABLE_CASHFREE=1</code>. For COD, set{" "}
              <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_ENABLE_COD=1</code>. Restart{" "}
              <code className="rounded bg-white/70 px-1">npm run dev</code>.
            </p>
          </div>
        ) : null}

        <p className="mt-4 text-xs text-neutral-500">
          Verify payment payloads: DevTools → Network → request{" "}
          <code className="rounded bg-neutral-100 px-0.5">/api/checkout/payment-intent</code> → Payload / Response.
          {process.env.NODE_ENV === "development" ? (
            <>
              {" "}
              Locally, open <code className="rounded bg-neutral-100 px-0.5">/checkout?debug=1</code> to log the last
              intent on this page after you click pay.
            </>
          ) : null}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Full name *</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={120}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={254}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mobile *</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
              inputMode="numeric"
              maxLength={15}
              placeholder="9876543210"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Shipping address *</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-sm font-medium">City *</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={80}
              autoComplete="address-level2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">PIN code *</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="560001"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">GSTIN (optional)</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 font-mono text-sm uppercase"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15))}
              maxLength={15}
              placeholder="15-character GSTIN for B2B / invoice"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-neutral-500">Leave blank for B2C. Not a full e-invoice; store for your records.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
              Billing address same as shipping
            </label>
          </div>
        </div>

        </>
        )}

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        {step === "review" ? (
          <section className="mt-8 rounded-2xl border border-black/5 bg-brand-sand/60 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Review your order</h2>
            <p className="mt-1 text-sm text-neutral-600">Confirm details before payment.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-neutral-500">Contact</dt>
                <dd>
                  {name.trim()} · {email.trim()} · {mobile.replace(/\D/g, "")}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Ship to</dt>
                <dd>
                  {address.trim()}, {city.trim()} {pin.replace(/\s/g, "")}
                  {gstNumber.trim() ? ` · GSTIN ${gstNumber.trim().toUpperCase()}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Payment</dt>
                <dd className="capitalize">{gateway === "cod" ? "Cash on delivery" : gateway}</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm">
              {lines.map((l) => (
                <li key={l.product.slug} className="flex justify-between gap-2">
                  <span>
                    {l.product.name} × {l.quantity}
                  </span>
                  <span className="shrink-0">
                    <Money amount={l.product.salePrice * l.quantity} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between border-t border-black/10 pt-4 font-semibold">
              <span>Total</span>
              <Money amount={total} />
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold"
                onClick={() => setStep("details")}
              >
                Edit details
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={pay}
                className="rounded-full bg-neutral-900 px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {payLabel}
              </button>
            </div>
          </section>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={continueToReview}
            className="mt-8 w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 sm:w-auto sm:px-10"
          >
            Continue to review order
          </button>
        )}

        {showPaymentIntentDebug && paymentDebug ? (
          <details className="mt-6 rounded-xl border border-violet-200 bg-violet-50 p-4 text-xs text-neutral-900">
            <summary className="cursor-pointer font-semibold text-violet-900">
              Last payment-intent (dev + ?debug=1 only)
            </summary>
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono leading-relaxed">
              {JSON.stringify(paymentDebug, null, 2)}
            </pre>
          </details>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-black/5 bg-brand-sand p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <li key={l.product.slug} className="flex justify-between gap-2">
              <span>
                {l.product.name} × {l.quantity}
              </span>
              <span className="shrink-0">
                <Money amount={l.product.salePrice * l.quantity} />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-semibold">
              <Money amount={total} />
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
