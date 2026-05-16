import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/get-catalog";
import { resolveCheckoutFromCatalog, type CheckoutItemInput } from "@/lib/checkout-order";
import { validateNameEmailMobile } from "@/lib/checkout-validation";

type Gateway = "razorpay" | "cashfree";

function razorpayAuthHeader(): string | null {
  const id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) return null;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

function cashfreeBaseUrl(): string {
  return process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export async function POST(req: Request) {
  // SECURITY-REVIEW: Payment intent — amounts derived from server-side catalog only (never trust client totals).
  let body: {
    gateway?: Gateway;
    items?: CheckoutItemInput[];
    coupon?: string | null;
    customer?: { name?: string; email?: string; phone?: string };
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const gateway = body.gateway;
  if (gateway !== "razorpay" && gateway !== "cashfree") {
    return NextResponse.json({ error: "Invalid gateway." }, { status: 400 });
  }
  const items = Array.isArray(body.items) ? body.items : [];
  const coupon = typeof body.coupon === "string" ? body.coupon : null;

  const cust = body.customer ?? {};
  const customerErr = validateNameEmailMobile({
    name: typeof cust.name === "string" ? cust.name : "",
    email: typeof cust.email === "string" ? cust.email : "",
    mobile: typeof cust.phone === "string" ? cust.phone : "",
  });
  if (customerErr) {
    return NextResponse.json({ error: customerErr }, { status: 400 });
  }

  let resolved;
  try {
    const catalog = await getCatalog();
    resolved = resolveCheckoutFromCatalog(catalog, items, coupon);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid cart.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const returnUrl = `${siteUrl.replace(/\/$/, "")}/order-confirmation?gateway=cashfree`;

  if (gateway === "razorpay") {
    const auth = razorpayAuthHeader();
    if (!auth) {
      return NextResponse.json({ error: "Razorpay is not configured on the server." }, { status: 503 });
    }
    const amountPaise = Math.round(resolved.total * 100);
    if (amountPaise < 100) {
      return NextResponse.json({ error: "Order amount too small." }, { status: 400 });
    }
    const receipt = `af_${Date.now()}`.slice(0, 40);
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes: {
          items: JSON.stringify(items.map((i) => ({ slug: i.slug, quantity: i.quantity }))),
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Razorpay order creation failed.", detail: process.env.NODE_ENV === "development" ? errText : undefined },
        { status: 502 }
      );
    }
    const data = (await res.json()) as { id?: string };
    if (!data.id) {
      return NextResponse.json({ error: "Razorpay returned no order id." }, { status: 502 });
    }
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_RAZORPAY_KEY_ID." }, { status: 503 });
    }
    return NextResponse.json({
      gateway: "razorpay" as const,
      orderId: data.id,
      amountPaise,
      keyId,
      customer: body.customer ?? {},
      pricing: {
        subtotal: resolved.subtotal,
        discount: resolved.discount,
        estimatedTax: resolved.estimatedTax,
        shippingEstimate: resolved.shippingEstimate,
        total: resolved.total,
      },
    });
  }

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Cashfree is not configured on the server." }, { status: 503 });
  }

  const orderId = `af_cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const phone = (body.customer?.phone || "9999999999").replace(/\D/g, "").slice(-10) || "9999999999";
  const email = body.customer?.email || "customer@example.com";
  const name = (body.customer?.name || "Customer").replace(/[^\w\s\-.,]/g, "").slice(0, 50) || "Customer";

  const cfRes = await fetch(`${cashfreeBaseUrl()}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      "x-api-version": "2022-09-01",
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: Number(resolved.total.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: `af_${email.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)}`,
        customer_email: email,
        customer_phone: phone,
        customer_name: name,
      },
      order_meta: {
        return_url: returnUrl,
      },
    }),
  });

  if (!cfRes.ok) {
    const errText = await cfRes.text();
    return NextResponse.json(
      { error: "Cashfree order creation failed.", detail: process.env.NODE_ENV === "development" ? errText : undefined },
      { status: 502 }
    );
  }

  const cfData = (await cfRes.json()) as { payment_session_id?: string };
  if (!cfData.payment_session_id) {
    return NextResponse.json({ error: "Cashfree returned no payment session." }, { status: 502 });
  }

  return NextResponse.json({
    gateway: "cashfree" as const,
    paymentSessionId: cfData.payment_session_id,
    cashfreeMode: process.env.CASHFREE_ENV === "production" ? "production" : "sandbox",
    cfOrderId: orderId,
    returnUrl,
    pricing: {
      subtotal: resolved.subtotal,
      discount: resolved.discount,
      estimatedTax: resolved.estimatedTax,
      shippingEstimate: resolved.shippingEstimate,
      total: resolved.total,
    },
  });
}
