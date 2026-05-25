"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getThemeFromPath } from "@/lib/theme-paths";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import { readAccountSession, writeAccountSession } from "@/lib/account-session";
import {
  getCheckoutFieldErrors,
  validateEmail,
  type CheckoutFieldKey,
  type CheckoutFields,
} from "@/lib/checkout-validation";
import {
  applyCheckoutPrefill,
  buildCheckoutPrefill,
  buildGuestCheckoutPrefill,
  defaultSavedAddress,
  listCheckoutSavedAddresses,
  shippingFieldsFromSaved,
  type CheckoutPrefillFields,
} from "@/lib/checkout-prefill";
import { addressKey, type SavedAddress } from "@/lib/shipping-address";
import { CheckoutSavedAddressSelect } from "@/components/commerce/CheckoutSavedAddressSelect";
import { CouponField } from "@/components/commerce/CouponField";
import { OrderTotalsBreakdown } from "@/components/commerce/OrderTotalsBreakdown";
import { recordBrowserLoyalty } from "@/lib/loyalty-browser";
import { writePendingCheckout } from "@/lib/pending-checkout";
import { CheckoutBreadcrumbs } from "@/components/commerce/CheckoutBreadcrumbs";
import { CheckoutExpressPay } from "@/components/commerce/CheckoutExpressPay";
import { CheckoutSidebarTotals } from "@/components/commerce/CheckoutSidebarTotals";
import { CheckoutSummaryLines } from "@/components/commerce/CheckoutSummaryLines";
import { CheckoutUpsell } from "@/components/commerce/CheckoutUpsell";
import { FreeShippingProgress } from "@/components/commerce/FreeShippingProgress";
import type { CheckoutFlags } from "@/lib/checkout-flags";

export type { CheckoutFlags };

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

type Gateway = "razorpay" | "cashfree" | "demo" | "cod";

type PaymentIntentDebug = {
  gateway: string;
  status: number;
  sent: unknown;
  received: unknown;
};

export default function CheckoutClient({ checkoutFlags }: { checkoutFlags: CheckoutFlags }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = getThemeFromPath(pathname);
  const nav = themeNavPaths(theme);
  const orderConfirmationPath = nav.orderConfirmation;
  const rays = theme === "rays";
  const searchParams = useSearchParams();
  const {
    lines,
    total,
    clear,
    subtotal,
    discount,
    estimatedTax,
    shippingEstimate,
    coupon,
    cartNote,
    giftWrap,
    giftWrapFee,
  } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [billingSame, setBillingSame] = useState(true);
  const [emailOffers, setEmailOffers] = useState(false);
  const [hasAccountSession, setHasAccountSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CheckoutFieldKey, string>>>({});
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
  const [prefillSource, setPrefillSource] = useState<"account" | "orders" | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressKey, setSelectedAddressKey] = useState("");
  const prefillStartedRef = useRef(false);
  const lastPrefillEmailRef = useRef<string | null>(null);

  useEffect(() => {
    setGateway(defaultGateway);
  }, [defaultGateway]);

  useEffect(() => {
    setHasAccountSession(Boolean(readAccountSession()));
  }, []);

  const applyPrefillToForm = useCallback((prefill: CheckoutPrefillFields, source: "account" | "orders") => {
    const snapshot = (): CheckoutPrefillFields => ({
      name,
      email,
      mobile,
      address,
      city,
      pin,
      gstNumber,
    });
    const next = applyCheckoutPrefill(snapshot(), prefill);
    setName(next.name);
    setEmail(next.email);
    setMobile(next.mobile);
    setAddress(next.address);
    setCity(next.city);
    setPin(next.pin);
    setGstNumber(next.gstNumber);
    const filled =
      next.email || next.name || next.mobile || next.address || next.city || next.pin;
    if (filled) setPrefillSource(source);
  }, [name, email, mobile, address, city, pin, gstNumber]);

  const fetchCheckoutPrefill = useCallback(
    async (targetEmail: string) => {
      const normalized = targetEmail.trim().toLowerCase();
      if (!normalized || validateEmail(normalized)) return;
      if (lastPrefillEmailRef.current === normalized) return;
      lastPrefillEmailRef.current = normalized;

      const session = readAccountSession();
      const matchesSession =
        session !== null && session.email.trim().toLowerCase() === normalized;

      if (matchesSession && session) {
        applyPrefillToForm(buildCheckoutPrefill({ session, addresses: [] }), "account");
      }

      try {
        const r = await fetch("/api/account/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalized }),
        });
        const j = (await r.json()) as {
          addresses?: SavedAddress[];
          lastCustomer?: { name?: string; mobile?: string } | null;
        };
        if (!r.ok) return;

        const merged = listCheckoutSavedAddresses(normalized, j.addresses ?? []);
        setSavedAddresses(merged);

        const prefill =
          matchesSession && session
            ? buildCheckoutPrefill({
                session,
                addresses: j.addresses ?? [],
                lastCustomer: j.lastCustomer ?? null,
              })
            : buildGuestCheckoutPrefill(
                normalized,
                j.addresses ?? [],
                j.lastCustomer ?? null
              );

        applyPrefillToForm(prefill, matchesSession ? "account" : "orders");

        const defaultAddr = defaultSavedAddress(normalized, j.addresses ?? []);
        if (defaultAddr) {
          const key = addressKey(defaultAddr);
          setSelectedAddressKey(merged.some((a) => addressKey(a) === key) ? key : "");
        }
      } catch {
        /* Profile-only or browser snapshot prefill may already be applied */
      }
    },
    [applyPrefillToForm]
  );

  const applySavedAddressSelection = useCallback(
    (key: string) => {
      setSelectedAddressKey(key);
      if (!key) return;
      const addr = savedAddresses.find((a) => addressKey(a) === key);
      if (!addr) return;
      const ship = shippingFieldsFromSaved(addr);
      setAddress(ship.address);
      setCity(ship.city);
      setPin(ship.pin);
      setGstNumber(ship.gstNumber);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.address;
        delete next.city;
        delete next.pin;
        delete next.gstNumber;
        return next;
      });
    },
    [savedAddresses]
  );

  useEffect(() => {
    if (prefillStartedRef.current) return;
    const session = readAccountSession();
    if (!session) return;
    prefillStartedRef.current = true;
    void fetchCheckoutPrefill(session.email);
  }, [fetchCheckoutPrefill]);

  const handleEmailBlur = useCallback(() => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || validateEmail(normalized)) return;
    const session = readAccountSession();
    if (session && session.email.trim().toLowerCase() === normalized) return;
    lastPrefillEmailRef.current = null;
    void fetchCheckoutPrefill(normalized);
  }, [email, fetchCheckoutPrefill]);

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
        ...(cartNote.trim() ? { cartNote: cartNote.trim() } : {}),
        ...(giftWrap ? { giftWrap: true, giftWrapFee } : {}),
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

      const orderEmail = payload.customer.email.trim().toLowerCase();
      recordBrowserLoyalty(orderEmail, id, total);

      try {
        const orderRes = await fetch("/api/orders", {
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
        if (orderRes.ok) {
          const orderJson = (await orderRes.json()) as {
            persisted?: boolean;
            pointsAwarded?: number;
          };
          if (orderJson.pointsAwarded && orderJson.pointsAwarded > 0) {
            recordBrowserLoyalty(orderEmail, id, total);
          }
        }
      } catch {
        /* Order API optional when DB/email not configured — browser ledger still updated */
      }

      completingOrderRef.current = true;
      sessionStorage.setItem("af_last_order", JSON.stringify(payload));
      const account = readAccountSession();
      if (account && account.email.trim().toLowerCase() === orderEmail) {
        const digits = payload.customer.mobile.replace(/\D/g, "").slice(0, 15);
        if (digits) {
          writeAccountSession({ ...account, mobile: digits });
        }
      }
      clear();
      router.push(`${orderConfirmationPath}?orderId=${encodeURIComponent(id)}`);
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

  const checkoutFields = useMemo(
    (): CheckoutFields => ({
      name,
      email,
      mobile,
      address,
      city,
      pin,
      gstNumber: gstNumber.trim() || undefined,
    }),
    [name, email, mobile, address, city, pin, gstNumber]
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
      shippingAddress: buildShippingAddress(),
    }),
    // buildShippingAddress uses current field state — keep in sync with checkoutFields
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, coupon, name, email, mobile, address, city, pin, gstNumber]
  );

  function buildShippingAddress() {
    return {
      address: address.trim(),
      city: city.trim(),
      pin: pin.replace(/\s/g, ""),
      ...(gstNumber.trim() ? { gstNumber: gstNumber.trim().toUpperCase() } : {}),
    };
  }

  const runCheckoutValidation = useCallback((): boolean => {
    const errors = getCheckoutFieldErrors(checkoutFields);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      setError(first ?? "Please fix the highlighted fields.");
      return false;
    }
    setError(null);
    return true;
  }, [checkoutFields]);

  const continueToReview = () => {
    if (!lines.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!runCheckoutValidation()) return;
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pay = async () => {
    if (!lines.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!runCheckoutValidation()) {
      setStep("details");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const fieldClass = (key?: CheckoutFieldKey) =>
    `mt-1 w-full rounded-md border bg-white px-3 py-2.5 text-sm focus:outline-none ${
      key && fieldErrors[key]
        ? "border-red-500 focus:border-red-700"
        : "border-neutral-300 focus:border-neutral-900"
    }`;

  const clearFieldError = (key: CheckoutFieldKey) => {
    if (!fieldErrors[key]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_min(26rem,42vw)]">
      <div className="bg-white px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <CheckoutBreadcrumbs
          step={step === "details" ? "information" : "review"}
          cartHref={nav.cart}
          onInformationClick={step === "review" ? () => setStep("details") : undefined}
          className="mb-6"
        />

        {prefillSource === "account" && (
          <p className="mb-4 rounded-lg border border-brand-fresh/30 bg-brand-mist/50 px-3 py-2 text-sm text-neutral-700">
            Signed in — we filled your details from your profile. You can edit anything before paying.
          </p>
        )}

        {step === "details" && (
          <>
            <CheckoutExpressPay
              flags={checkoutFlags}
              selected={gateway}
              onSelect={setGateway}
              variant={rays ? "rays" : "classic"}
            />

            <section className="mt-2">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-semibold text-neutral-900">Contact</h2>
                {!hasAccountSession ? (
                  <Link href={nav.account} className="text-sm text-neutral-600 underline hover:text-neutral-900">
                    Sign in
                  </Link>
                ) : null}
              </div>
              <div className="mt-3">
                <label className="text-sm text-neutral-700" htmlFor="checkout-email">
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  className={fieldClass("email")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                    if (lastPrefillEmailRef.current && e.target.value.trim().toLowerCase() !== lastPrefillEmailRef.current) {
                      lastPrefillEmailRef.current = null;
                    }
                  }}
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                  maxLength={254}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "checkout-email-error" : undefined}
                />
                {fieldErrors.email ? (
                  <p id="checkout-email-error" className="mt-1 text-xs text-red-700" role="alert">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={emailOffers}
                  onChange={(e) => setEmailOffers(e.target.checked)}
                />
                Email me with news and offers
              </label>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-900">Shipping address</h2>
              {prefillSource ? (
                <p className="mt-1 text-xs text-neutral-500">
                  {prefillSource === "account"
                    ? "Filled from your account and past orders where fields were empty."
                    : "Filled from past orders for this email where fields were empty."}
                </p>
              ) : null}
              <div className="mt-3 space-y-3">
                <CheckoutSavedAddressSelect
                  addresses={savedAddresses}
                  value={selectedAddressKey}
                  onChange={applySavedAddressSelection}
                  inputClassName={fieldClass()}
                />
                <div>
                  <label className="text-sm text-neutral-700">Country / region</label>
                  <select className={fieldClass()} defaultValue="IN" aria-label="Country">
                    <option value="IN">India</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-neutral-700" htmlFor="checkout-name">
                    Full name
                  </label>
                  <input
                    id="checkout-name"
                    required
                    className={fieldClass("name")}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    autoComplete="name"
                    maxLength={120}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? "checkout-name-error" : undefined}
                  />
                  {fieldErrors.name ? (
                    <p id="checkout-name-error" className="mt-1 text-xs text-red-700" role="alert">
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-sm text-neutral-700" htmlFor="checkout-address">
                    Address
                  </label>
                  <input
                    id="checkout-address"
                    required
                    className={fieldClass("address")}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearFieldError("address");
                    }}
                    autoComplete="street-address"
                    maxLength={500}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={fieldErrors.address ? "checkout-address-error" : undefined}
                  />
                  {fieldErrors.address ? (
                    <p id="checkout-address-error" className="mt-1 text-xs text-red-700" role="alert">
                      {fieldErrors.address}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-neutral-700" htmlFor="checkout-city">
                      City
                    </label>
                    <input
                      id="checkout-city"
                      required
                      className={fieldClass("city")}
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        clearFieldError("city");
                      }}
                      maxLength={80}
                      autoComplete="address-level2"
                      aria-invalid={Boolean(fieldErrors.city)}
                      aria-describedby={fieldErrors.city ? "checkout-city-error" : undefined}
                    />
                    {fieldErrors.city ? (
                      <p id="checkout-city-error" className="mt-1 text-xs text-red-700" role="alert">
                        {fieldErrors.city}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-sm text-neutral-700" htmlFor="checkout-pin">
                      PIN code
                    </label>
                    <input
                      id="checkout-pin"
                      required
                      className={fieldClass("pin")}
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                        clearFieldError("pin");
                      }}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="560001"
                      pattern="\d{6}"
                      aria-invalid={Boolean(fieldErrors.pin)}
                      aria-describedby={fieldErrors.pin ? "checkout-pin-error" : undefined}
                    />
                    {fieldErrors.pin ? (
                      <p id="checkout-pin-error" className="mt-1 text-xs text-red-700" role="alert">
                        {fieldErrors.pin}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-700" htmlFor="checkout-mobile">
                    Mobile
                  </label>
                  <input
                    id="checkout-mobile"
                    required
                    className={fieldClass("mobile")}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      clearFieldError("mobile");
                    }}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="10-digit mobile"
                    aria-invalid={Boolean(fieldErrors.mobile)}
                    aria-describedby={fieldErrors.mobile ? "checkout-mobile-error" : undefined}
                  />
                  {fieldErrors.mobile ? (
                    <p id="checkout-mobile-error" className="mt-1 text-xs text-red-700" role="alert">
                      {fieldErrors.mobile}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-sm text-neutral-700" htmlFor="checkout-gst">
                    GSTIN (optional)
                  </label>
                  <input
                    id="checkout-gst"
                    className={`${fieldClass("gstNumber")} font-mono uppercase`}
                    value={gstNumber}
                    onChange={(e) => {
                      setGstNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15));
                      clearFieldError("gstNumber");
                    }}
                    maxLength={15}
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.gstNumber)}
                    aria-describedby={fieldErrors.gstNumber ? "checkout-gst-error" : undefined}
                  />
                  {fieldErrors.gstNumber ? (
                    <p id="checkout-gst-error" className="mt-1 text-xs text-red-700" role="alert">
                      {fieldErrors.gstNumber}
                    </p>
                  ) : null}
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
                  Billing address same as shipping
                </label>
              </div>
            </section>

            {process.env.NODE_ENV === "development" && (
              <p className="mt-6 text-xs text-neutral-400">
                Dev: payment intent debug at <code>/checkout?debug=1</code>
              </p>
            )}
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
              {coupon ? (
                <div>
                  <dt className="text-neutral-500">Promo code</dt>
                  <dd>
                    {coupon}
                    {discount > 0 ? (
                      <>
                        {" "}
                        (−<Money amount={discount} />)
                      </>
                    ) : null}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-4 text-sm text-neutral-600">
              Totals and line items are in your order summary on the right.
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
            Continue to payment
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

      <aside
        className={`border-t px-4 py-8 sm:px-6 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto lg:border-l lg:border-t-0 ${
          rays ? "border-rays-line bg-neutral-100" : "border-black/10 bg-neutral-100"
        }`}
      >
        <div className="mx-auto max-w-md space-y-6 lg:py-4">
          <CheckoutSummaryLines theme={rays ? "rays" : "classic"} />
          <CouponField variant={rays ? "rays" : "classic"} layout="sidebar" />
          <CheckoutSidebarTotals variant={rays ? "rays" : "classic"} />
          <FreeShippingProgress
            variant={rays ? "rays" : "classic"}
            shopHref={nav.shop}
            align="left"
            hideWhenQualified
          />
          <CheckoutUpsell theme={rays ? "rays" : "classic"} />
        </div>
      </aside>
    </div>
  );
}
