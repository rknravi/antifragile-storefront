import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAdminReports } from "@/lib/admin-reports";
import { getCatalog } from "@/lib/get-catalog";
import { adminSessionCookieName, verifyAdminSessionValue } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSessionValue(store.get(adminSessionCookieName())?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    const catalog = await getCatalog().catch(() => []);
    const payload = buildAdminReports([], catalog);
    return NextResponse.json({
      ...payload,
      databaseConnected: false,
      message: "DATABASE_URL not set — order metrics are empty. Catalog inventory still loads from disk.",
    });
  }

  try {
    const [rows, catalog] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
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
      }),
      getCatalog(),
    ]);

    const payload = buildAdminReports(
      rows.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
      })),
      catalog
    );

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Could not build reports." }, { status: 500 });
  }
}
