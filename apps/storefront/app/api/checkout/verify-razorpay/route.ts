import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(req: Request) {
  // SECURITY-REVIEW: Razorpay signature verification using server secret.
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Razorpay is not configured on the server." }, { status: 503 });
  }
  let body: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing verification fields." }, { status: 400 });
  }
  const payload = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, razorpay_order_id: orderId, razorpay_payment_id: paymentId });
}
