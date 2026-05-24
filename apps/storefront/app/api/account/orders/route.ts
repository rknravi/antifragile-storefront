import { NextResponse } from "next/server";
import { getRecentLoyaltyEntries, syncLoyaltyFromOrders } from "@/lib/loyalty";
import { extractLastCustomerFromOrders } from "@/lib/order-customer";
import { persistOrderRecord, type PersistOrderInput } from "@/lib/persist-order";
import { prisma } from "@/lib/prisma";
import { extractAddressesFromOrderRows } from "@/lib/shipping-address";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type BrowserOrderBody = PersistOrderInput;

export async function POST(req: Request) {
  let body: { email?: string; browserOrder?: BrowserOrderBody };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      orders: [],
      addresses: [],
      pointsBalance: 0,
      loyaltyHistory: [],
      loyaltyWarning: null,
      message: "Order history requires DATABASE_URL. Run npm run db:push in apps/storefront.",
    });
  }

  try {
    const browserOrder = body.browserOrder;
    if (
      browserOrder?.sourceOrderId &&
      browserOrder.customer?.email?.trim().toLowerCase() === email
    ) {
      await persistOrderRecord(browserOrder);
    }

    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        sourceOrderId: true,
        status: true,
        gateway: true,
        customerJson: true,
        shippingJson: true,
        itemsJson: true,
        totalsJson: true,
        createdAt: true,
      },
    });

    const matched = rows
      .filter((row) => {
        try {
          const c = JSON.parse(row.customerJson) as { email?: string };
          return c.email?.trim().toLowerCase() === email;
        } catch {
          return false;
        }
      })
      .slice(0, 50);

    const orders = matched.map((row) => ({
      id: row.id,
      sourceOrderId: row.sourceOrderId,
      status: row.status,
      gateway: row.gateway,
      createdAt: row.createdAt.toISOString(),
      itemsJson: row.itemsJson,
      totalsJson: row.totalsJson,
    }));

    const addresses = extractAddressesFromOrderRows(
      matched.map((row) => ({
        shippingJson: row.shippingJson,
        sourceOrderId: row.sourceOrderId,
        createdAt: row.createdAt,
      }))
    );

    const lastCustomer = extractLastCustomerFromOrders(matched);

    let pointsBalance = 0;
    let loyaltyHistory: Awaited<ReturnType<typeof getRecentLoyaltyEntries>> = [];
    let loyaltyWarning: string | null = null;

    try {
      pointsBalance = await syncLoyaltyFromOrders(email);
      loyaltyHistory = await getRecentLoyaltyEntries(email, 12);
    } catch (err) {
      loyaltyWarning =
        err instanceof Error && err.message.includes("LoyaltyLedger")
          ? "Rewards table missing — run npm run db:push in apps/storefront."
          : "Could not sync rewards. Run npm run db:push and refresh.";
    }

    return NextResponse.json({
      orders,
      addresses,
      lastCustomer,
      pointsBalance,
      loyaltyHistory,
      loyaltyWarning,
    });
  } catch {
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}
