import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Razorpay webhooks — verify signature with RAZORPAY_WEBHOOK_SECRET.
 * @see https://razorpay.com/docs/webhooks/validate-test/
 */
export async function POST(req: Request) {
  // SECURITY-REVIEW: Webhook — verify HMAC on raw body; do not trust payload without verification.
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("x-razorpay-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(sig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const event = payload.event;
  const orderId = payload.payload?.payment?.entity?.order_id;
  const paymentId = payload.payload?.payment?.entity?.id;
  const payStatus = payload.payload?.payment?.entity?.status;

  if (process.env.DATABASE_URL && orderId && (event === "payment.captured" || event === "order.paid")) {
    try {
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          status: payStatus === "captured" || event === "order.paid" ? "paid" : "payment_event",
          paymentRef: paymentId ?? undefined,
        },
      });
    } catch {
      /* ignore DB errors for webhook idempotency */
    }
  }

  return NextResponse.json({ received: true });
}
