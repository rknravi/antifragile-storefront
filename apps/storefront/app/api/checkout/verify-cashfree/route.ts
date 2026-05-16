import { NextResponse } from "next/server";
import { fetchCashfreeOrder, isCashfreeOrderPaid } from "@/lib/cashfree-server";

export async function POST(req: Request) {
  // SECURITY-REVIEW: Verifies payment with Cashfree server API before client finalizes order.
  let body: { cfOrderId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const cfOrderId = typeof body.cfOrderId === "string" ? body.cfOrderId.trim() : "";
  if (!cfOrderId || cfOrderId.length > 80 || !/^[a-zA-Z0-9_-]+$/.test(cfOrderId)) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const order = await fetchCashfreeOrder(cfOrderId);
  if (!order) {
    return NextResponse.json({ error: "Could not verify payment with Cashfree." }, { status: 502 });
  }

  const paid = isCashfreeOrderPaid(order.order_status);
  return NextResponse.json({
    paid,
    orderStatus: order.order_status ?? "unknown",
    cfOrderId: order.order_id ?? cfOrderId,
  });
}
