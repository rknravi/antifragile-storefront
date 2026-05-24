import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardPointsForOrder } from "@/lib/loyalty";
import { sendOrderConfirmationEmail } from "@/lib/send-order-email";
import { validateCheckoutFields } from "@/lib/checkout-validation";

type Gateway = "razorpay" | "cashfree" | "demo" | "cod";

type OrderItem = { name: string; sku: string; qty: number; price: number };

type Body = {
  sourceOrderId?: string;
  gateway?: Gateway;
  paymentRef?: string;
  razorpayOrderId?: string;
  customer?: { name?: string; email?: string; mobile?: string };
  shippingAddress?: { address?: string; city?: string; pin?: string; gstNumber?: string };
  items?: OrderItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  shippingFee?: number;
  total?: number;
};

function isGateway(x: unknown): x is Gateway {
  return x === "razorpay" || x === "cashfree" || x === "demo" || x === "cod";
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const sourceOrderId = typeof body.sourceOrderId === "string" ? body.sourceOrderId.trim() : "";
  if (!sourceOrderId || sourceOrderId.length > 64) {
    return NextResponse.json({ error: "Invalid sourceOrderId." }, { status: 400 });
  }
  if (!isGateway(body.gateway)) {
    return NextResponse.json({ error: "Invalid gateway." }, { status: 400 });
  }

  const cust = body.customer ?? {};
  const ship = body.shippingAddress ?? {};

  const checkoutErr = validateCheckoutFields({
    name: typeof cust.name === "string" ? cust.name : "",
    email: typeof cust.email === "string" ? cust.email : "",
    mobile: typeof cust.mobile === "string" ? cust.mobile : "",
    address: typeof ship.address === "string" ? ship.address : "",
    city: typeof ship.city === "string" ? ship.city : "",
    pin: typeof ship.pin === "string" ? ship.pin : "",
    gstNumber: typeof ship.gstNumber === "string" ? ship.gstNumber : undefined,
  });
  if (checkoutErr) return NextResponse.json({ error: checkoutErr }, { status: 400 });

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: "No line items." }, { status: 400 });

  const totals = {
    subtotal: Number(body.subtotal),
    discount: Number(body.discount),
    tax: Number(body.tax),
    shippingFee: Number(body.shippingFee),
    total: Number(body.total),
  };
  if (!Number.isFinite(totals.total) || totals.total < 0) {
    return NextResponse.json({ error: "Invalid totals." }, { status: 400 });
  }

  const customerJson = JSON.stringify({
    name: String(cust.name).trim(),
    email: String(cust.email).trim().toLowerCase(),
    mobile: String(cust.mobile).replace(/\D/g, ""),
  });
  const gstRaw = typeof ship.gstNumber === "string" ? ship.gstNumber : "";
  const shippingJson = JSON.stringify({
    address: String(ship.address ?? "").trim(),
    city: String(ship.city ?? "").trim(),
    pin: String(ship.pin ?? "").replace(/\s/g, ""),
    gstNumber: gstRaw.trim() ? gstRaw.trim().toUpperCase() : undefined,
  });
  const itemsJson = JSON.stringify(items);
  const totalsJson = JSON.stringify(totals);

  const status =
    body.gateway === "cod"
      ? "cod_pending"
      : body.gateway === "demo"
        ? "demo_completed"
        : "created";

  let persisted = false;
  let dbId: string | undefined;

  if (process.env.DATABASE_URL) {
    try {
      await prisma.order.upsert({
        where: { sourceOrderId },
        create: {
          sourceOrderId,
          status,
          gateway: body.gateway,
          paymentRef: typeof body.paymentRef === "string" ? body.paymentRef : null,
          razorpayOrderId: typeof body.razorpayOrderId === "string" ? body.razorpayOrderId : null,
          customerJson,
          shippingJson,
          itemsJson,
          totalsJson,
        },
        update: {
          status,
          paymentRef: typeof body.paymentRef === "string" ? body.paymentRef : null,
          razorpayOrderId: typeof body.razorpayOrderId === "string" ? body.razorpayOrderId : null,
          customerJson,
          shippingJson,
          itemsJson,
          totalsJson,
        },
      });
      const row = await prisma.order.findUnique({ where: { sourceOrderId } });
      dbId = row?.id;
      persisted = true;
    } catch {
      return NextResponse.json({ error: "Could not persist order (database error)." }, { status: 500 });
    }
  }

  const email = String(cust.email).trim().toLowerCase();

  let pointsAwarded = 0;
  let pointsBalance = 0;
  if (persisted && email) {
    const loyalty = await awardPointsForOrder({
      email,
      sourceOrderId,
      orderTotal: totals.total,
    });
    pointsAwarded = loyalty.awarded;
    pointsBalance = loyalty.balance;
  }
  const emailResult = await sendOrderConfirmationEmail({
    sourceOrderId,
    gateway: body.gateway,
    customerEmail: email,
    customerName: String(cust.name).trim(),
    total: totals.total,
    items: items.map((i) => ({ name: i.name, qty: i.qty })),
  });

  return NextResponse.json({
    ok: true,
    persisted,
    id: dbId ?? sourceOrderId,
    sourceOrderId,
    emailSent: emailResult.ok,
    emailSkipped: emailResult.skipped === true,
    emailError: emailResult.ok ? undefined : emailResult.error,
    pointsAwarded,
    pointsBalance,
  });
}
