import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string };
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
    return NextResponse.json({ orders: [], message: "Order history requires DATABASE_URL." });
  }

  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        sourceOrderId: true,
        status: true,
        gateway: true,
        customerJson: true,
        itemsJson: true,
        totalsJson: true,
        createdAt: true,
      },
    });

    const orders = rows
      .filter((row) => {
        try {
          const c = JSON.parse(row.customerJson) as { email?: string };
          return c.email?.toLowerCase() === email;
        } catch {
          return false;
        }
      })
      .slice(0, 50)
      .map((row) => ({
        id: row.id,
        sourceOrderId: row.sourceOrderId,
        status: row.status,
        gateway: row.gateway,
        createdAt: row.createdAt,
        itemsJson: row.itemsJson,
        totalsJson: row.totalsJson,
      }));

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}
