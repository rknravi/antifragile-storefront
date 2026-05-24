import "server-only";

import { prisma } from "@/lib/prisma";

/** Earn 1 point per ₹1 spent (order total, after discounts). */
export const POINTS_PER_RUPEE = 1;

export function pointsForOrderTotal(total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.floor(total * POINTS_PER_RUPEE);
}

export function parseOrderTotal(totalsJson: string): number {
  try {
    const t = JSON.parse(totalsJson) as { total?: number };
    return typeof t.total === "number" && t.total > 0 ? t.total : 0;
  } catch {
    return 0;
  }
}

export async function getPointsBalance(email: string): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 0;

  const agg = await prisma.loyaltyLedger.aggregate({
    where: { email: normalized },
    _sum: { points: true },
  });
  return agg._sum.points ?? 0;
}

export type LoyaltyEntry = {
  sourceOrderId: string;
  points: number;
  orderTotal: number;
  createdAt: string;
};

/** Idempotent: one ledger row per order. */
export async function awardPointsForOrder(params: {
  email: string;
  sourceOrderId: string;
  orderTotal: number;
}): Promise<{ awarded: number; balance: number }> {
  if (!process.env.DATABASE_URL) return { awarded: 0, balance: 0 };

  const email = params.email.trim().toLowerCase();
  const sourceOrderId = params.sourceOrderId.trim();
  const points = pointsForOrderTotal(params.orderTotal);

  if (!email || !sourceOrderId || points <= 0) {
    return { awarded: 0, balance: await getPointsBalance(email) };
  }

  const existing = await prisma.loyaltyLedger.findUnique({
    where: { sourceOrderId },
  });
  if (existing) {
    return { awarded: 0, balance: await getPointsBalance(email) };
  }

  try {
    await prisma.loyaltyLedger.create({
      data: {
        email,
        sourceOrderId,
        points,
        orderTotal: Math.floor(params.orderTotal),
      },
    });
    return { awarded: points, balance: await getPointsBalance(email) };
  } catch {
    return { awarded: 0, balance: await getPointsBalance(email) };
  }
}

/** Credit any past orders for this email that are not in the ledger yet. */
export async function syncLoyaltyFromOrders(email: string): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;

  const normalized = email.trim().toLowerCase();
  if (!normalized) return 0;

  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      sourceOrderId: true,
      customerJson: true,
      totalsJson: true,
    },
  });

  for (const row of rows) {
    try {
      const c = JSON.parse(row.customerJson) as { email?: string };
      if (c.email?.trim().toLowerCase() !== normalized) continue;
      const total = parseOrderTotal(row.totalsJson);
      if (total <= 0) continue;
      await awardPointsForOrder({
        email: normalized,
        sourceOrderId: row.sourceOrderId,
        orderTotal: total,
      });
    } catch {
      continue;
    }
  }

  return getPointsBalance(normalized);
}

export async function getRecentLoyaltyEntries(email: string, limit = 10): Promise<LoyaltyEntry[]> {
  if (!process.env.DATABASE_URL) return [];

  const rows = await prisma.loyaltyLedger.findMany({
    where: { email: email.trim().toLowerCase() },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    sourceOrderId: r.sourceOrderId,
    points: r.points,
    orderTotal: r.orderTotal,
    createdAt: r.createdAt.toISOString(),
  }));
}
