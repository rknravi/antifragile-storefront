import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminSessionCookieName, verifyAdminSessionValue } from "@/lib/admin-session";

const ALLOWED_STATUSES = new Set([
  "created",
  "paid",
  "demo_completed",
  "cod_pending",
  "payment_event",
  "shipped",
  "cancelled",
]);

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSessionValue(store.get(adminSessionCookieName())?.value);
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ orders: [], message: "DATABASE_URL not set." });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const status = (searchParams.get("status") ?? "").trim();
  const gateway = (searchParams.get("gateway") ?? "").trim();

  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        sourceOrderId: true,
        status: true,
        gateway: true,
        paymentRef: true,
        razorpayOrderId: true,
        customerJson: true,
        shippingJson: true,
        itemsJson: true,
        totalsJson: true,
        createdAt: true,
      },
    });

    let orders = rows;
    if (status) orders = orders.filter((o) => o.status === status);
    if (gateway) orders = orders.filter((o) => o.gateway === gateway);
    if (q) {
      orders = orders.filter((o) => {
        if (o.sourceOrderId.toLowerCase().includes(q)) return true;
        if (o.paymentRef?.toLowerCase().includes(q)) return true;
        try {
          const c = JSON.parse(o.customerJson) as { email?: string; name?: string; mobile?: string };
          return (
            c.email?.toLowerCase().includes(q) ||
            c.name?.toLowerCase().includes(q) ||
            c.mobile?.includes(q)
          );
        } catch {
          return false;
        }
      });
    }

    return NextResponse.json({ orders: orders.slice(0, 100) });
  } catch {
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not set." }, { status: 503 });
  }

  let body: { id?: string; status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (!id) return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    await prisma.order.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
