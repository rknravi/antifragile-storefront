"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Money } from "@/components/Money";
import {
  clearPendingCheckout,
  readPendingCheckout,
  type PendingCheckout,
} from "@/lib/pending-checkout";

type OrderPayload = {
  orderId: string;
  paymentId: string;
  gateway?: "razorpay" | "cashfree" | "demo" | "cod";
  razorpayOrderId?: string;
  customer: { name: string; email: string; mobile: string };
  shippingAddress: { address: string; city: string; pin: string; gstNumber?: string };
  items: { name: string; sku: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  createdAt: string;
};

function pendingToPayload(pending: PendingCheckout, storeId: string, paymentId: string): OrderPayload {
  return {
    orderId: storeId,
    paymentId,
    gateway: "cashfree",
    customer: pending.customer,
    shippingAddress: pending.shippingAddress,
    items: pending.items,
    subtotal: pending.subtotal,
    discount: pending.discount,
    tax: pending.tax,
    shippingFee: pending.shippingFee,
    total: pending.total,
    createdAt: new Date().toISOString(),
  };
}

function OrderConfirmationView({ order }: { order: OrderPayload }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Thank you</h1>
      <p className="mt-2 text-neutral-600">
        Order <span className="font-mono font-semibold">{order.orderId}</span> is confirmed.
      </p>

      <div className="mt-8 rounded-2xl border border-black/5 bg-brand-sand p-6 text-sm">
        {order.gateway && (
          <p>
            <strong>Gateway:</strong> {order.gateway === "cod" ? "Cash on delivery" : order.gateway}
          </p>
        )}
        {order.razorpayOrderId && (
          <p className="mt-2">
            <strong>Razorpay order:</strong> {order.razorpayOrderId}
          </p>
        )}
        {order.gateway === "cod" ? (
          <p className="mt-2">
            <strong>Payment:</strong> Pay when your order arrives (reference: {order.paymentId})
          </p>
        ) : (
          <p className="mt-2">
            <strong>Payment ID:</strong> {order.paymentId}
          </p>
        )}
        <p className="mt-2">
          <strong>Email:</strong> {order.customer.email}
        </p>
        <p className="mt-2">
          <strong>Ship to:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
          {order.shippingAddress.pin}
        </p>
        {order.shippingAddress.gstNumber && (
          <p className="mt-2">
            <strong>GSTIN:</strong> {order.shippingAddress.gstNumber}
          </p>
        )}
        <ul className="mt-6 space-y-2 border-t border-black/10 pt-4">
          {order.items.map((i) => (
            <li key={i.sku} className="flex justify-between">
              <span>
                {i.name} × {i.qty}
              </span>
              <span>
                <Money amount={i.price * i.qty} />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-semibold text-neutral-900">
          <span>Total</span>
          <span>
            <Money amount={order.total} />
          </span>
        </div>
      </div>

      <Link
        href="/shop"
        className="mt-8 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
      >
        Continue shopping
      </Link>
    </div>
  );
}

function OrderBody() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const gatewayParam = searchParams.get("gateway");
      const cfOrderId =
        searchParams.get("order_id") ?? searchParams.get("cf_order_id") ?? searchParams.get("orderId");

      if (gatewayParam === "cashfree" && cfOrderId) {
        const pending = readPendingCheckout();
        if (!pending || pending.cfOrderId !== cfOrderId) {
          if (!cancelled) {
            setError("Checkout session expired. If payment succeeded, contact support with your Cashfree order id.");
            setLoading(false);
          }
          return;
        }

        try {
          const verifyRes = await fetch("/api/checkout/verify-cashfree", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cfOrderId }),
          });
          const verify = (await verifyRes.json()) as { paid?: boolean; error?: string };
          if (!verifyRes.ok || !verify.paid) {
            if (!cancelled) {
              setError(verify.error || "Payment was not confirmed. If you were charged, contact support.");
              setLoading(false);
            }
            return;
          }

          const storeId = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
          const paymentId = `cf_${cfOrderId}`;
          const payload = pendingToPayload(pending, storeId, paymentId);

          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceOrderId: storeId,
              gateway: "cashfree",
              paymentRef: paymentId,
              customer: payload.customer,
              shippingAddress: payload.shippingAddress,
              items: payload.items,
              subtotal: payload.subtotal,
              discount: payload.discount,
              tax: payload.tax,
              shippingFee: payload.shippingFee,
              total: payload.total,
            }),
          });

          sessionStorage.setItem("af_last_order", JSON.stringify(payload));
          clearPendingCheckout();
          clear();
          if (!cancelled) {
            setOrder(payload);
            router.replace(`/order-confirmation?orderId=${encodeURIComponent(storeId)}`);
          }
        } catch {
          if (!cancelled) {
            setError("Could not complete order after payment.");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      try {
        const raw = sessionStorage.getItem("af_last_order");
        if (raw) {
          const parsed = JSON.parse(raw) as OrderPayload;
          if (!cancelled) setOrder(parsed);
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, clear]);

  if (loading) {
    return <p className="mx-auto max-w-xl px-4 py-16 text-center text-neutral-600">Confirming your order…</p>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Order confirmation</h1>
        <p className="mt-4 text-red-800">{error}</p>
        <Link href="/checkout" className="mt-6 inline-block font-semibold text-brand-fresh underline">
          Return to checkout
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Order confirmation</h1>
        <p className="mt-4 text-neutral-600">
          We could not load your order details. If you just completed checkout, try returning from checkout again.
        </p>
        <Link href="/account" className="mt-4 inline-block text-sm font-semibold text-brand-fresh underline">
          Look up by email
        </Link>
        <Link href="/shop" className="mt-6 block font-semibold text-brand-fresh underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return <OrderConfirmationView order={order} />;
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-neutral-500">Loading…</div>}>
      <OrderBody />
    </Suspense>
  );
}
